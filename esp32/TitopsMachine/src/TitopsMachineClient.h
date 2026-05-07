/**
 * TitopsMachine ESP32 Library
 *
 * Robust client for Titops machine heartbeat and scan-request API endpoints.
 * Features: automatic retry with exponential backoff, WiFi connectivity guard,
 * levelled debug logging, and ArduinoJson v7 support.
 */

#pragma once

#include <Arduino.h>
#include <HTTPClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>

// ---------------------------------------------------------------------------
// Logging macros — define TITOPS_LOG_LEVEL before including this header
// to control verbosity.  0 = off, 1 = error, 2 = warn, 3 = info, 4 = debug
// ---------------------------------------------------------------------------
#ifndef TITOPS_LOG_LEVEL
  #define TITOPS_LOG_LEVEL 3 // default: info
#endif

#if TITOPS_LOG_LEVEL >= 1
  #define TITOPS_LOGE(fmt, ...) Serial.printf("[TITOPS E] " fmt "\n", ##__VA_ARGS__)
#else
  #define TITOPS_LOGE(fmt, ...)
#endif

#if TITOPS_LOG_LEVEL >= 2
  #define TITOPS_LOGW(fmt, ...) Serial.printf("[TITOPS W] " fmt "\n", ##__VA_ARGS__)
#else
  #define TITOPS_LOGW(fmt, ...)
#endif

#if TITOPS_LOG_LEVEL >= 3
  #define TITOPS_LOGI(fmt, ...) Serial.printf("[TITOPS I] " fmt "\n", ##__VA_ARGS__)
#else
  #define TITOPS_LOGI(fmt, ...)
#endif

#if TITOPS_LOG_LEVEL >= 4
  #define TITOPS_LOGD(fmt, ...) Serial.printf("[TITOPS D] " fmt "\n", ##__VA_ARGS__)
#else
  #define TITOPS_LOGD(fmt, ...)
#endif

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
struct TitopsConfig {
  const char* baseUrl      = nullptr;
  const char* machineId    = nullptr;
  const char* machineKey   = nullptr;

  // TLS
  const char* rootCa       = nullptr;   // PEM root CA for HTTPS verification
  bool        insecureTLS  = false;     // skip TLS verification (testing only)

  // Timeouts & retry
  uint16_t    timeoutMs    = 8000;
  uint8_t     maxRetries   = 3;         // total attempts = 1 + maxRetries
  uint16_t    retryBaseMs  = 500;       // base delay, doubled each retry
  uint16_t    retryMaxMs   = 8000;      // backoff cap
};

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------
enum class TitopsError : uint8_t {
  None = 0,
  NotInitialised,
  WiFiDisconnected,
  ConnectionFailed,
  Timeout,
  ServerError,          // 5xx
  ClientError,          // 4xx (not retried)
  JsonParseError,
  InvalidCardUid,
};

const char* titopsErrorToString(TitopsError error);

// ---------------------------------------------------------------------------
// Scan outcomes (mirrors server enum)
// ---------------------------------------------------------------------------
enum class TitopsScanOutcome : uint8_t {
  Unknown = 0,
  CheckedIn,
  CheckedOut,
  AlreadyCheckedIn,
  CheckinRequired,
  AlreadyCompleted,
  InvalidCheckoutTime,
  UnknownCard,
};

const char* titopsOutcomeToString(TitopsScanOutcome outcome);

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------
struct TitopsResult {
  bool         ok          = false;
  TitopsError  error       = TitopsError::None;
  int          httpStatus  = 0;
  String       errorMessage;
  String       rawBody;
};

struct TitopsHeartbeatResult : TitopsResult {
  String machineId;
  String lastHeartbeatAt;
};

struct TitopsScanResult : TitopsResult {
  TitopsScanOutcome outcome = TitopsScanOutcome::Unknown;
  String            outcomeText;
  bool              replayed = false;
  String            scanRequestId;
  String            sessionId;
  String            idempotencyKey;
};

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------
class TitopsMachineClient {
public:
  /**
   * Initialise the client. Must be called before any requests.
   * Returns false if required config fields (baseUrl, machineId, machineKey) are missing.
   */
  bool begin(const TitopsConfig& config);

  /** Send a heartbeat. Retries automatically on transient failures. */
  TitopsHeartbeatResult sendHeartbeat();

  /** Send a card scan. Generates an idempotency key automatically. */
  TitopsScanResult sendScan(const char* cardUid);

  /** Send a card scan with an explicit idempotency key (for safe retries). */
  TitopsScanResult sendScan(const char* cardUid, const char* idempotencyKey);

  /** Check WiFi connectivity. */
  bool isConnected() const;

  /** Validate a card UID (14 hex characters). */
  static bool isValidCardUid(const char* uid);

  /** Generate a unique idempotency key. */
  String makeIdempotencyKey() const;

private:
  TitopsConfig     _config;
  bool             _initialised = false;

  WiFiClient       _plainClient;
  WiFiClientSecure _secureClient;

  // URL building
  String _machineUrl;  // cached: baseUrl + "/api/machines/" + machineId

  // Internal HTTP helpers
  struct HttpResponse {
    int    statusCode = 0;
    String body;
  };

  bool         _isHttps() const;
  bool         _beginHttp(HTTPClient& http, const String& url);
  HttpResponse _post(const String& url, const String& body);
  bool         _isTransientError(int statusCode) const;
  void         _delayWithBackoff(uint8_t attempt) const;

  // JSON parsing helpers
  TitopsScanOutcome _parseOutcome(const char* value) const;
  String            _parseServerError(const String& body) const;
};
