#include "TitopsMachineClient.h"

#include <ArduinoJson.h>
#include <esp_system.h>

TitopsMachineClient::TitopsMachineClient() = default;

void TitopsMachineClient::begin(const String& baseUrl, const String& machineId, const String& machineKey) {
  _baseUrl = baseUrl;
  _machineId = machineId;
  _machineKey = machineKey;

  while (_baseUrl.endsWith("/")) {
    _baseUrl.remove(_baseUrl.length() - 1);
  }
}

void TitopsMachineClient::setTimeout(uint16_t timeoutMs) {
  _timeoutMs = timeoutMs;
}

void TitopsMachineClient::setRootCA(const char* rootCa) {
  _rootCa = rootCa;
  _insecureTLS = false;
}

void TitopsMachineClient::setInsecureTLS(bool insecure) {
  _insecureTLS = insecure;
}

TitopsMachineResult TitopsMachineClient::sendHeartbeat() {
  TitopsMachineResult result;

  HTTPClient http;
  const String url = machinePath("/heartbeat");
  if (!beginHttp(http, url)) {
    result.errorMessage = "Failed to start HTTP request";
    return result;
  }

  applyHeaders(http);
  result.statusCode = http.POST("");
  result.rawBody = http.getString();
  http.end();

  result.ok = result.statusCode >= 200 && result.statusCode < 300;
  if (!result.ok) {
    result.errorMessage = parseErrorMessage(result.rawBody);
    return result;
  }

  DynamicJsonDocument doc(1024);
  DeserializationError err = deserializeJson(doc, result.rawBody);
  if (err) {
    result.ok = false;
    result.errorMessage = "Invalid JSON response";
    return result;
  }

  JsonObject data = doc["data"].as<JsonObject>();
  result.machineId = data["id"] | "";
  result.lastHeartbeatAt = data["lastHeartbeatAt"] | "";
  return result;
}

TitopsScanResult TitopsMachineClient::sendScan(const String& cardUid) {
  return sendScan(cardUid, makeIdempotencyKey());
}

TitopsScanResult TitopsMachineClient::sendScan(const String& cardUid, const String& idempotencyKey) {
  TitopsScanResult result;
  result.idempotencyKey = idempotencyKey;

  if (!isValidCardUid(cardUid)) {
    result.errorMessage = "cardUid must be exactly 14 hex characters";
    return result;
  }

  DynamicJsonDocument requestDoc(256);
  requestDoc["cardUid"] = cardUid;
  requestDoc["idempotencyKey"] = idempotencyKey;

  String requestBody;
  serializeJson(requestDoc, requestBody);

  HTTPClient http;
  const String url = machinePath("/scan-requests");
  if (!beginHttp(http, url)) {
    result.errorMessage = "Failed to start HTTP request";
    return result;
  }

  applyHeaders(http);
  result.statusCode = http.POST(requestBody);
  result.rawBody = http.getString();
  http.end();

  result.ok = result.statusCode >= 200 && result.statusCode < 300;
  if (!result.ok) {
    result.errorMessage = parseErrorMessage(result.rawBody);
    return result;
  }

  DynamicJsonDocument responseDoc(1536);
  DeserializationError err = deserializeJson(responseDoc, result.rawBody);
  if (err) {
    result.ok = false;
    result.errorMessage = "Invalid JSON response";
    return result;
  }

  JsonObject data = responseDoc["data"].as<JsonObject>();
  result.scanRequestId = data["id"] | "";
  result.sessionId = data["sessionId"] | "";
  result.idempotencyKey = data["idempotencyKey"] | idempotencyKey;
  result.outcomeText = data["outcome"] | "";
  result.outcome = parseOutcome(result.outcomeText);
  result.replayed = data["replayed"] | false;

  return result;
}

String TitopsMachineClient::makeIdempotencyKey() const {
  char buffer[64];
  snprintf(buffer, sizeof(buffer), "esp32-%08lx-%010lu", (unsigned long)esp_random(), (unsigned long)millis());
  return String(buffer);
}

bool TitopsMachineClient::isValidCardUid(const String& cardUid) {
  if (cardUid.length() != 14) {
    return false;
  }

  for (size_t i = 0; i < cardUid.length(); i++) {
    if (!isxdigit(cardUid.charAt(i))) {
      return false;
    }
  }

  return true;
}

String TitopsMachineClient::outcomeToString(TitopsScanOutcome outcome) {
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
    case TitopsScanOutcome::Unknown:
    default:
      return "UNKNOWN";
  }
}

String TitopsMachineClient::machinePath(const String& suffix) const {
  return _baseUrl + "/api/machines/" + _machineId + suffix;
}

bool TitopsMachineClient::beginHttp(HTTPClient& http, const String& url) {
  http.setTimeout(_timeoutMs);

  if (url.startsWith("https://")) {
    if (_insecureTLS) {
      _secureClient.setInsecure();
    } else if (_rootCa != nullptr) {
      _secureClient.setCACert(_rootCa);
    }

    return http.begin(_secureClient, url);
  }

  return http.begin(_plainClient, url);
}

void TitopsMachineClient::applyHeaders(HTTPClient& http) const {
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Accept", "application/json");
  http.addHeader("x-machine-key", _machineKey);
}

TitopsScanOutcome TitopsMachineClient::parseOutcome(const String& value) const {
  if (value == "CHECKED_IN") return TitopsScanOutcome::CheckedIn;
  if (value == "CHECKED_OUT") return TitopsScanOutcome::CheckedOut;
  if (value == "ALREADY_CHECKED_IN") return TitopsScanOutcome::AlreadyCheckedIn;
  if (value == "CHECKIN_REQUIRED") return TitopsScanOutcome::CheckinRequired;
  if (value == "ALREADY_COMPLETED") return TitopsScanOutcome::AlreadyCompleted;
  if (value == "INVALID_CHECKOUT_TIME") return TitopsScanOutcome::InvalidCheckoutTime;
  if (value == "UNKNOWN_CARD") return TitopsScanOutcome::UnknownCard;
  return TitopsScanOutcome::Unknown;
}

String TitopsMachineClient::parseErrorMessage(const String& body) const {
  DynamicJsonDocument doc(1024);
  DeserializationError err = deserializeJson(doc, body);
  if (!err) {
    const char* message = doc["error"]["message"] | nullptr;
    if (message != nullptr) {
      return String(message);
    }
  }

  if (body.length() > 0) {
    return body;
  }

  return "Request failed";
}
