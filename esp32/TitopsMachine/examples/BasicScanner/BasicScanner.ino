/**
 * BasicScanner — minimal example for the TitopsMachine library.
 *
 * Sends periodic heartbeats and processes card scans from Serial input.
 * Replace the constants below with your actual credentials.
 */

#include <Arduino.h>
#include <TitopsMachine.h>
#include <WiFi.h>

// ── Configuration ──────────────────────────────────────────────────────────
static const char *WIFI_SSID = "YOUR_WIFI_SSID";
static const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

static const char *TITOPS_BASE_URL = "http://192.168.1.10:3000";
static const char *TITOPS_MACHINE_ID = "YOUR_MACHINE_ID";
static const char *TITOPS_MACHINE_KEY = "mk_YOUR_MACHINE_KEY";

static const unsigned long HEARTBEAT_INTERVAL_MS = 30000;

// ── Globals ────────────────────────────────────────────────────────────────
TitopsMachineClient titops;
unsigned long lastHeartbeatMs = 0;

// ── WiFi ───────────────────────────────────────────────────────────────────
void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\nConnected — IP: %s\n", WiFi.localIP().toString().c_str());
}

// ── Heartbeat ──────────────────────────────────────────────────────────────
void sendHeartbeatIfDue() {
  if (lastHeartbeatMs != 0 &&
      millis() - lastHeartbeatMs < HEARTBEAT_INTERVAL_MS) {
    return;
  }
  lastHeartbeatMs = millis();

  TitopsHeartbeatResult result = titops.sendHeartbeat();
  if (!result.ok) {
    Serial.printf("Heartbeat failed [%s]: %s\n", titopsErrorToString(result.error), result.errorMessage.c_str());
    return;
  }
  Serial.println("Heartbeat OK");
}

// ── Card scan ──────────────────────────────────────────────────────────────
void handleCardScan(const char *cardUid) {
  TitopsScanResult result = titops.sendScan(cardUid);
  if (!result.ok) {
    Serial.printf("Scan failed [%s]: %s\n", titopsErrorToString(result.error), result.errorMessage.c_str());
    return;
  }
  Serial.printf("Scan OK: %s%s\n", titopsOutcomeToString(result.outcome), result.replayed ? " (replayed)" : "");
}

// ── Arduino entry points ───────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  connectWiFi();

  TitopsConfig config;
  config.baseUrl = TITOPS_BASE_URL;
  config.machineId = TITOPS_MACHINE_ID;
  config.machineKey = TITOPS_MACHINE_KEY;
  // config.insecureTLS = true;  // uncomment for local HTTPS testing only

  if (!titops.begin(config)) {
    Serial.println("ERROR: Titops client init failed");
    while (true)
      delay(1000);
  }
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  sendHeartbeatIfDue();

  // Replace this with your RFID reader callback.
  // The server expects exactly 14 hexadecimal characters.
  if (Serial.available()) {
    String cardUid = Serial.readStringUntil('\n');
    cardUid.trim();
    if (cardUid.length() > 0) {
      handleCardScan(cardUid.c_str());
    }
  }

  delay(10);
}
