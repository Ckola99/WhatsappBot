# WhatsApp Lead-Gen & CRM Automation Engine

> A robust, stateful microservices architecture that automates user acquisition funnels and synchronises lead data with Google Contacts in real-time.

---

## Engineering Highlights

| Capability | Details |
| :--- | :--- |
| **Stateful Microservices** | Decoupled Node.js (persistent WebSocket) + Python FastAPI (stateless logic). High-compute tasks never interfere with sensitive WhatsApp socket timing. |
| **Persistent State Machine** | Built on Better-SQLite3. Manages multi-branch onboarding funnels and survives full server restarts without losing user context. |
| **Enterprise API Integration** | Google People API via OAuth 2.0. Warm leads are automatically converted into structured CRM entries in Google Contacts. |
| **Async Background Processing** | Non-blocking scheduler handles 24-hour automated follow-ups using event-loop-safe background cron logic. |
| **Remote DevOps** | Headless `/qr` endpoint renders Baileys authentication QR codes as Data URLs — clients link their WhatsApp accounts without terminal access. |

---

## Features

- **Multi-Stage Sales Funnels** — Specialised paths per product/service (e.g. Blossom and Tribe) with step-level validation.
- **Automated CRM Sync** — Name, phone number, and lead category pushed to Google Cloud in real time on funnel completion.
- **Smart Follow-up System** — Re-engages users who stall in the funnel for more than 24 hours to increase conversion rates.
- **Granular Admin Controls**
  - Global killswitch via WhatsApp commands (`/start`, `/stop`).
  - Per-chat bot override (`/bot off`, `/bot on`) so the account owner can take over any conversation manually.
- **Security & Privacy** — Strict group-chat filtering; the bot only interacts with authorised individual leads.

---

## Tech Stack

| Component | Responsibility | Technologies |
| :--- | :--- | :--- |
| **WA Gateway** | Persistent WebSocket connection & I/O | Node.js, `@whiskeysockets/baileys` |
| **Logic Engine** | Stateless logic & AI processing | Python 3.13, FastAPI, Pydantic |
| **Persistence** | Lead tracking & session state | SQLite, `better-sqlite3` |
| **Integrations** | CRM & lead management | Google People API, OAuth 2.0 |
| **Deployment** | Local tunnelling & webhook proxy | Ngrok, Express |

---

## Setup & Installation

### 1. Google API Configuration

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com).
2. Enable the **People API**.
3. Configure your **OAuth Consent Screen** and create **OAuth 2.0 Client IDs**.
4. Download the credentials file and save it as `python-ai-core/credentials.json`.

### 2. Start the Python Logic Engine

```bash
cd python-ai-core

# Install dependencies
pip install fastapi uvicorn google-api-python-client google-auth-oauthlib pydantic

# Start the server
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Start the Node.js Gateway

```bash
cd nodejs-bot

# Install dependencies
npm install

# Start the bot
node src/index.js
```

### 4. Remote Client Linking

Expose the gateway so your client can scan the QR code:

```bash
ngrok http 3000
```

Provide the client with: `https://your-ngrok-url.ngrok-free.app/qr`

---

## Admin Commands

| Command | Scope | Effect |
| :--- | :--- | :--- |
| `/start` | Global | Enables the bot for all users |
| `/stop` | Global | Disables the bot for all users |
| `/bot off` | Specific chat | Pauses the bot for that contact |
| `/bot on` | Specific chat | Resumes the bot for that contact |

---

## Architecture Overview

```
WhatsApp ──► Node.js Gateway (Baileys WebSocket)
                    │
                    ▼ HTTP (internal)
             Python FastAPI Logic Engine
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
   SQLite State DB      Google People API
   (session / funnel)   (CRM sync via OAuth 2.0)
```

---

## Contact

**Christopher Kola**
Software Engineer — Full-Stack | DevOps
