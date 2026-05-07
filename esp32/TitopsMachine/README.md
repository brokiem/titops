# TitopsMachine ESP32 Library

Small Arduino ESP32 client for the Titops machine API.

It covers only the machine routes intended for scanner firmware:

- `POST /api/machines/{machineId}/heartbeat`
- `POST /api/machines/{machineId}/scan-requests`

## Install

Copy `esp32/TitopsMachine` into your Arduino `libraries` folder, or add this folder as a local library in PlatformIO.

Install the `ArduinoJson` dependency if your IDE does not install it from `library.properties`.

## Usage

```cpp
#include <WiFi.h>
#include <TitopsMachineClient.h>

TitopsMachineClient titops;

void setup() {
  WiFi.begin("ssid", "password");
  while (WiFi.status() != WL_CONNECTED) delay(250);

  titops.begin(
    "http://192.168.1.10:3000",
    "machine-id-from-dashboard",
    "mk_machine-key-shown-once"
  );
}

void loop() {
  titops.sendHeartbeat();

  TitopsScanResult scan = titops.sendScan("04A1B2C3D4E5F6");
  if (scan.ok) {
    Serial.println(scan.outcomeText);
  } else {
    Serial.println(scan.errorMessage);
  }

  delay(30000);
}
```

## Notes

- `cardUid` must be exactly 14 hexadecimal characters.
- The library sends the required `x-machine-key` header.
- `sendScan(cardUid)` creates an idempotency key automatically. Use `sendScan(cardUid, key)` if your firmware needs to retry the same scan safely after a connection failure.
- For production HTTPS, prefer `setRootCA(...)`. `setInsecureTLS(true)` is only for local testing.
