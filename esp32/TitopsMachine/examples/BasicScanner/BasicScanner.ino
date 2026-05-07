#include <Arduino.h>
#include <WiFi.h>
#include <TitopsMachineClient.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char* TITOPS_BASE_URL = "http://192.168.1.10:3000";
const char* TITOPS_MACHINE_ID = "YOUR_MACHINE_ID";
const char* TITOPS_MACHINE_KEY = "mk_YOUR_MACHINE_KEY";

TitopsMachineClient titops;

unsigned long lastHeartbeatAt = 0;
const unsigned long HEARTBEAT_INTERVAL_MS = 30000;

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void sendHeartbeatIfDue() {
  if (lastHeartbeatAt != 0 && millis() - lastHeartbeatAt < HEARTBEAT_INTERVAL_MS) {
    return;
  }

  lastHeartbeatAt = millis();

  TitopsMachineResult result = titops.sendHeartbeat();
  if (!result.ok) {
    Serial.print("Heartbeat failed: ");
    Serial.print(result.statusCode);
    Serial.print(" ");
    Serial.println(result.errorMessage);
    return;
  }

  Serial.println("Heartbeat sent");
}

void sendCardScan(const String& cardUid) {
  TitopsScanResult result = titops.sendScan(cardUid);
  if (!result.ok) {
    Serial.print("Scan failed: ");
    Serial.print(result.statusCode);
    Serial.print(" ");
    Serial.println(result.errorMessage);
    return;
  }

  Serial.print("Scan outcome: ");
  Serial.print(result.outcomeText);
  if (result.replayed) {
    Serial.print(" replayed");
  }
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  connectWiFi();

  titops.begin(TITOPS_BASE_URL, TITOPS_MACHINE_ID, TITOPS_MACHINE_KEY);

  // For HTTPS without a root certificate during local testing only:
  // titops.setInsecureTLS(true);
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
    sendCardScan(cardUid);
  }

  delay(10);
}
