# TitopsMachine ESP32 Library

Robust Arduino ESP32 client for the Titops machine API with automatic retry, exponential backoff, WiFi connectivity guard, and levelled debug logging.

Covers the machine-facing endpoints:

- `POST /api/machines/{machineId}/heartbeat`
- `POST /api/machines/{machineId}/scan-requests`

## Features

- **Automatic retry** with exponential backoff + jitter on transient failures (timeouts, 5xx, connection errors). Client errors (4xx) are never retried.
- **WiFi guard** — checks connectivity before every request; returns immediately with `TitopsError::WiFiDisconnected` instead of hanging.
- **Structured error codes** — `TitopsError` enum for programmatic error handling.
- **Debug logging** — compile-time levelled logging (`TITOPS_LOG_LEVEL` 0–4).
- **ArduinoJson v7** — uses `JsonDocument` (auto-sized, no deprecated `DynamicJsonDocument`).
- **Connection reuse** — keeps TCP/TLS sockets open between requests.

## Install

Copy `esp32/TitopsMachine` into your Arduino `libraries` folder, or add this folder as a local library in PlatformIO.

Install the `ArduinoJson` (v7+) dependency if your IDE does not install it from `library.properties`.

## Quick Start

```cpp
#include <WiFi.h>
#include <TitopsMachine.h>

TitopsMachineClient titops;

void setup() {
  Serial.begin(115200);
  WiFi.begin("ssid", "password");
  while (WiFi.status() != WL_CONNECTED) delay(250);

  TitopsConfig config;
  config.baseUrl    = "http://192.168.1.10:3000";
  config.machineId  = "machine-id-from-dashboard";
  config.machineKey = "mk_machine-key-shown-once";

  titops.begin(config);
}

void loop() {
  titops.sendHeartbeat();

  TitopsScanResult scan = titops.sendScan("04A1B2C3D4E5F6");
  if (scan.ok) {
    Serial.println(titopsOutcomeToString(scan.outcome));
  } else {
    Serial.printf("Error [%s]: %s\n",
                  titopsErrorToString(scan.error),
                  scan.errorMessage.c_str());
  }

  delay(30000);
}
```

## Configuration

Pass a `TitopsConfig` struct to `begin()`:

| Field | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | `const char*` | *required* | Server base URL |
| `machineId` | `const char*` | *required* | Machine ID from the dashboard |
| `machineKey` | `const char*` | *required* | Machine API key (`mk_...`) |
| `rootCa` | `const char*` | `nullptr` | PEM root CA for HTTPS verification |
| `insecureTLS` | `bool` | `false` | Skip TLS verification (testing only) |
| `timeoutMs` | `uint16_t` | `8000` | HTTP request timeout |
| `maxRetries` | `uint8_t` | `3` | Retry count for transient failures |
| `retryBaseMs` | `uint16_t` | `500` | Base delay for exponential backoff |
| `retryMaxMs` | `uint16_t` | `8000` | Maximum backoff delay |

## Logging

Control log verbosity by defining `TITOPS_LOG_LEVEL` **before** including the header:

```cpp
#define TITOPS_LOG_LEVEL 4  // 0=off, 1=error, 2=warn, 3=info, 4=debug
#include <TitopsMachine.h>
```

Default level is `3` (info).

## Error Handling

Every result struct has:
- `ok` — `true` on success
- `error` — `TitopsError` enum for programmatic handling
- `httpStatus` — raw HTTP status code (0 or negative on transport failure)
- `errorMessage` — human-readable description

```cpp
TitopsScanResult result = titops.sendScan(uid);
switch (result.error) {
  case TitopsError::None:             /* success */         break;
  case TitopsError::WiFiDisconnected: /* no WiFi */         break;
  case TitopsError::ConnectionFailed: /* can't reach server */ break;
  case TitopsError::Timeout:          /* request timed out */ break;
  case TitopsError::InvalidCardUid:   /* bad UID format */  break;
  default: /* other error */ break;
}
```

## Idempotency

`sendScan(cardUid)` generates a unique idempotency key automatically. To retry the same scan safely after a connection failure, pass an explicit key:

```cpp
String key = titops.makeIdempotencyKey();
TitopsScanResult result = titops.sendScan(uid, key.c_str());
if (!result.ok && result.error == TitopsError::Timeout) {
  // Safe to retry with the same key — the server will deduplicate
  result = titops.sendScan(uid, key.c_str());
}
```

## Notes

- `cardUid` must be exactly 14 hexadecimal characters.
- The library sends the `x-machine-key` header on every request.
- For production HTTPS, set `config.rootCa`. Only use `config.insecureTLS = true` for local testing.
