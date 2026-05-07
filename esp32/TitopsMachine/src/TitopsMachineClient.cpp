#include "TitopsMachineClient.h"

#include <ArduinoJson.h>
#include <WiFi.h>
#include <esp_system.h>

// ---------------------------------------------------------------------------
// String helpers for enums
// ---------------------------------------------------------------------------

const char *titopsErrorToString(TitopsError error) {
  switch (error) {
  case TitopsError::None:
    return "None";
  case TitopsError::NotInitialised:
    return "NotInitialised";
  case TitopsError::WiFiDisconnected:
    return "WiFiDisconnected";
  case TitopsError::ConnectionFailed:
    return "ConnectionFailed";
  case TitopsError::Timeout:
    return "Timeout";
  case TitopsError::ServerError:
    return "ServerError";
  case TitopsError::ClientError:
    return "ClientError";
  case TitopsError::JsonParseError:
    return "JsonParseError";
  case TitopsError::InvalidCardUid:
    return "InvalidCardUid";
  default:
    return "Unknown";
  }
}

const char *titopsOutcomeToString(TitopsScanOutcome outcome) {
  switch (outcome) {
  case TitopsScanOutcome::CheckedIn:
    return "CHECKED_IN";
  case TitopsScanOutcome::CheckedOut:
    return "CHECKED_OUT";
  case TitopsScanOutcome::AlreadyCheckedIn:
    return "ALREADY_CHECKED_IN";
  case TitopsScanOutcome::CheckinRequired:
    return "CHECKIN_REQUIRED";
  case TitopsScanOutcome::AlreadyCompleted:
    return "ALREADY_COMPLETED";
  case TitopsScanOutcome::InvalidCheckoutTime:
    return "INVALID_CHECKOUT_TIME";
  case TitopsScanOutcome::UnknownCard:
    return "UNKNOWN_CARD";
  default:
    return "UNKNOWN";
  }
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

bool TitopsMachineClient::begin(const TitopsConfig &config) {
  if (!config.baseUrl || !config.machineId || !config.machineKey) {
    TITOPS_LOGE(
        "begin() missing required config (baseUrl, machineId, machineKey)");
    return false;
  }

  _config = config;

  // Build and cache the machine URL prefix (strip trailing slashes)
  _machineUrl = String(config.baseUrl);
  while (_machineUrl.endsWith("/")) {
    _machineUrl.remove(_machineUrl.length() - 1);
  }
  _machineUrl += "/api/machines/";
  _machineUrl += config.machineId;

  _initialised = true;
  TITOPS_LOGI("Initialised for machine %s", config.machineId);
  return true;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

bool TitopsMachineClient::isConnected() const {
  return WiFi.status() == WL_CONNECTED;
}

bool TitopsMachineClient::isValidCardUid(const char *uid) {
  if (!uid)
    return false;
  size_t len = strlen(uid);
  if (len != 14)
    return false;
  for (size_t i = 0; i < len; i++) {
    if (!isxdigit(uid[i]))
      return false;
  }
  return true;
}

String TitopsMachineClient::makeIdempotencyKey() const {
  char buf[40];
  snprintf(buf, sizeof(buf), "esp32-%08lx-%010lu", (unsigned long)esp_random(),
           (unsigned long)millis());
  return String(buf);
}

// ---------------------------------------------------------------------------
// Heartbeat
// ---------------------------------------------------------------------------

TitopsHeartbeatResult TitopsMachineClient::sendHeartbeat() {
  TitopsHeartbeatResult result;

  if (!_initialised) {
    result.error = TitopsError::NotInitialised;
    result.errorMessage = "Client not initialised — call begin() first";
    TITOPS_LOGE("sendHeartbeat: %s", result.errorMessage.c_str());
    return result;
  }

  TITOPS_LOGD("Sending heartbeat...");

  const String url = _machineUrl + "/heartbeat";
  HttpResponse resp = _post(url, "");

  result.httpStatus = resp.statusCode;
  result.rawBody = resp.body;

  // Transport-level failure (already retried)
  if (resp.statusCode <= 0) {
    result.error = (resp.statusCode == HTTPC_ERROR_CONNECTION_REFUSED)
                       ? TitopsError::ConnectionFailed
                       : TitopsError::Timeout;
    result.errorMessage =
        "Request failed after retries (code " + String(resp.statusCode) + ")";
    TITOPS_LOGE("Heartbeat failed: %s", result.errorMessage.c_str());
    return result;
  }

  // Server-side error
  if (resp.statusCode >= 400) {
    result.error = resp.statusCode >= 500 ? TitopsError::ServerError
                                          : TitopsError::ClientError;
    result.errorMessage = _parseServerError(resp.body);
    TITOPS_LOGW("Heartbeat HTTP %d: %s", resp.statusCode,
                result.errorMessage.c_str());
    return result;
  }

  // Parse success response
  JsonDocument doc;
  DeserializationError jsonErr = deserializeJson(doc, resp.body);
  if (jsonErr) {
    result.error = TitopsError::JsonParseError;
    result.errorMessage = String("JSON parse error: ") + jsonErr.c_str();
    TITOPS_LOGE("Heartbeat JSON error: %s", jsonErr.c_str());
    return result;
  }

  JsonObject data = doc["data"].as<JsonObject>();
  result.machineId = data["id"] | "";
  result.lastHeartbeatAt = data["lastHeartbeatAt"] | "";
  result.ok = true;

  TITOPS_LOGI("Heartbeat OK");
  return result;
}

// ---------------------------------------------------------------------------
// Scan
// ---------------------------------------------------------------------------

TitopsScanResult TitopsMachineClient::sendScan(const char *cardUid) {
  return sendScan(cardUid, makeIdempotencyKey().c_str());
}

TitopsScanResult TitopsMachineClient::sendScan(const char *cardUid,
                                               const char *idempotencyKey) {
  TitopsScanResult result;
  result.idempotencyKey = idempotencyKey;

  if (!_initialised) {
    result.error = TitopsError::NotInitialised;
    result.errorMessage = "Client not initialised — call begin() first";
    TITOPS_LOGE("sendScan: %s", result.errorMessage.c_str());
    return result;
  }

  if (!isValidCardUid(cardUid)) {
    result.error = TitopsError::InvalidCardUid;
    result.errorMessage = "cardUid must be exactly 14 hex characters";
    TITOPS_LOGW("sendScan: invalid cardUid '%s'", cardUid ? cardUid : "(null)");
    return result;
  }

  TITOPS_LOGD("Sending scan for card %s (key=%s)", cardUid, idempotencyKey);

  // Build request JSON
  JsonDocument reqDoc;
  reqDoc["cardUid"] = cardUid;
  reqDoc["idempotencyKey"] = idempotencyKey;

  String reqBody;
  serializeJson(reqDoc, reqBody);

  const String url = _machineUrl + "/scan-requests";
  HttpResponse resp = _post(url, reqBody);

  result.httpStatus = resp.statusCode;
  result.rawBody = resp.body;

  if (resp.statusCode <= 0) {
    result.error = (resp.statusCode == HTTPC_ERROR_CONNECTION_REFUSED)
                       ? TitopsError::ConnectionFailed
                       : TitopsError::Timeout;
    result.errorMessage =
        "Request failed after retries (code " + String(resp.statusCode) + ")";
    TITOPS_LOGE("Scan failed: %s", result.errorMessage.c_str());
    return result;
  }

  if (resp.statusCode >= 400) {
    result.error = resp.statusCode >= 500 ? TitopsError::ServerError
                                          : TitopsError::ClientError;
    result.errorMessage = _parseServerError(resp.body);
    TITOPS_LOGW("Scan HTTP %d: %s", resp.statusCode,
                result.errorMessage.c_str());
    return result;
  }

  // Parse success response
  JsonDocument resDoc;
  DeserializationError jsonErr = deserializeJson(resDoc, resp.body);
  if (jsonErr) {
    result.error = TitopsError::JsonParseError;
    result.errorMessage = String("JSON parse error: ") + jsonErr.c_str();
    TITOPS_LOGE("Scan JSON error: %s", jsonErr.c_str());
    return result;
  }

  JsonObject data = resDoc["data"].as<JsonObject>();
  result.scanRequestId = data["id"] | "";
  result.sessionId = data["sessionId"] | "";
  result.idempotencyKey = data["idempotencyKey"] | idempotencyKey;
  result.replayed = data["replayed"] | false;

  const char *outcomeStr = data["outcome"] | "UNKNOWN";
  result.outcomeText = outcomeStr;
  result.outcome = _parseOutcome(outcomeStr);
  result.ok = true;

  TITOPS_LOGI("Scan OK: %s%s", outcomeStr,
              result.replayed ? " (replayed)" : "");
  return result;
}

// ---------------------------------------------------------------------------
// HTTP internals
// ---------------------------------------------------------------------------

bool TitopsMachineClient::_isHttps() const {
  return _machineUrl.startsWith("https://");
}

bool TitopsMachineClient::_beginHttp(HTTPClient &http, const String &url) {
  http.setTimeout(_config.timeoutMs);
  http.setReuse(true);

  if (_isHttps()) {
    if (_config.insecureTLS) {
      _secureClient.setInsecure();
    } else if (_config.rootCa) {
      _secureClient.setCACert(_config.rootCa);
    }
    return http.begin(_secureClient, url);
  }

  return http.begin(_plainClient, url);
}

TitopsMachineClient::HttpResponse
TitopsMachineClient::_post(const String &url, const String &body) {
  HttpResponse result;

  // WiFi guard
  if (!isConnected()) {
    TITOPS_LOGW("WiFi disconnected, skipping request");
    result.statusCode = HTTPC_ERROR_CONNECTION_REFUSED;
    return result;
  }

  uint8_t maxAttempts = 1 + _config.maxRetries;

  for (uint8_t attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      _delayWithBackoff(attempt);
      // Re-check WiFi before retry
      if (!isConnected()) {
        TITOPS_LOGW("WiFi lost during retry, aborting");
        result.statusCode = HTTPC_ERROR_CONNECTION_REFUSED;
        return result;
      }
      TITOPS_LOGD("Retry %u/%u ...", attempt, _config.maxRetries);
    }

    HTTPClient http;
    if (!_beginHttp(http, url)) {
      TITOPS_LOGW("http.begin() failed (attempt %u)", attempt + 1);
      result.statusCode = HTTPC_ERROR_CONNECTION_REFUSED;
      http.end();
      continue;
    }

    http.addHeader("Content-Type", "application/json");
    http.addHeader("Accept", "application/json");
    http.addHeader("x-machine-key", _config.machineKey);

    result.statusCode = http.POST(body);
    result.body = http.getString();
    http.end();

    // Success or client error → don't retry
    if (result.statusCode >= 200 || !_isTransientError(result.statusCode)) {
      return result;
    }

    TITOPS_LOGW("Transient error %d on attempt %u", result.statusCode,
                attempt + 1);
  }

  return result;
}

bool TitopsMachineClient::_isTransientError(int statusCode) const {
  // Negative codes are ESP-IDF HTTP errors (timeout, connection failed, etc.)
  if (statusCode <= 0)
    return true;
  // 5xx server errors are transient
  if (statusCode >= 500)
    return true;
  // 429 Too Many Requests is retryable
  if (statusCode == 429)
    return true;
  // 4xx client errors are not retryable
  return false;
}

void TitopsMachineClient::_delayWithBackoff(uint8_t attempt) const {
  // Exponential backoff: base * 2^(attempt-1), capped at retryMaxMs
  uint32_t delayMs = (uint32_t)_config.retryBaseMs << (attempt - 1);
  if (delayMs > _config.retryMaxMs)
    delayMs = _config.retryMaxMs;
  // Add small random jitter (0–25% of delay)
  delayMs += esp_random() % (delayMs / 4 + 1);
  TITOPS_LOGD("Backoff %lu ms", (unsigned long)delayMs);
  delay(delayMs);
}

// ---------------------------------------------------------------------------
// JSON parsing helpers
// ---------------------------------------------------------------------------

TitopsScanOutcome TitopsMachineClient::_parseOutcome(const char *value) const {
  if (!value)
    return TitopsScanOutcome::Unknown;
  if (strcmp(value, "CHECKED_IN") == 0)
    return TitopsScanOutcome::CheckedIn;
  if (strcmp(value, "CHECKED_OUT") == 0)
    return TitopsScanOutcome::CheckedOut;
  if (strcmp(value, "ALREADY_CHECKED_IN") == 0)
    return TitopsScanOutcome::AlreadyCheckedIn;
  if (strcmp(value, "CHECKIN_REQUIRED") == 0)
    return TitopsScanOutcome::CheckinRequired;
  if (strcmp(value, "ALREADY_COMPLETED") == 0)
    return TitopsScanOutcome::AlreadyCompleted;
  if (strcmp(value, "INVALID_CHECKOUT_TIME") == 0)
    return TitopsScanOutcome::InvalidCheckoutTime;
  if (strcmp(value, "UNKNOWN_CARD") == 0)
    return TitopsScanOutcome::UnknownCard;
  return TitopsScanOutcome::Unknown;
}

String TitopsMachineClient::_parseServerError(const String &body) const {
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, body);
  if (!err) {
    const char *msg = doc["error"]["message"];
    if (msg)
      return String(msg);
  }
  if (body.length() > 0)
    return body;
  return "Request failed";
}
