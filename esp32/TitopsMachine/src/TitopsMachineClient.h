#pragma once

#include <Arduino.h>
#include <HTTPClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>

enum class TitopsScanOutcome {
  CheckedIn,
  CheckedOut,
  AlreadyCheckedIn,
  CheckinRequired,
  AlreadyCompleted,
  InvalidCheckoutTime,
  UnknownCard,
  Unknown,
};

struct TitopsResult {
  bool ok = false;
  int statusCode = 0;
  String errorMessage;
  String rawBody;
};

struct TitopsMachineResult : TitopsResult {
  String machineId;
  String lastHeartbeatAt;
};

struct TitopsScanResult : TitopsResult {
  TitopsScanOutcome outcome = TitopsScanOutcome::Unknown;
  String outcomeText;
  bool replayed = false;
  String scanRequestId;
  String sessionId;
  String idempotencyKey;
};

class TitopsMachineClient {
public:
  TitopsMachineClient();

  void begin(const String& baseUrl, const String& machineId, const String& machineKey);
  void setTimeout(uint16_t timeoutMs);
  void setRootCA(const char* rootCa);
  void setInsecureTLS(bool insecure);

  TitopsMachineResult sendHeartbeat();
  TitopsScanResult sendScan(const String& cardUid);
  TitopsScanResult sendScan(const String& cardUid, const String& idempotencyKey);

  String makeIdempotencyKey() const;
  static bool isValidCardUid(const String& cardUid);
  static String outcomeToString(TitopsScanOutcome outcome);

private:
  String _baseUrl;
  String _machineId;
  String _machineKey;
  uint16_t _timeoutMs = 10000;
  const char* _rootCa = nullptr;
  bool _insecureTLS = false;

  WiFiClient _plainClient;
  WiFiClientSecure _secureClient;

  String machinePath(const String& suffix) const;
  bool beginHttp(HTTPClient& http, const String& url);
  void applyHeaders(HTTPClient& http) const;
  TitopsScanOutcome parseOutcome(const String& value) const;
  String parseErrorMessage(const String& body) const;
};
