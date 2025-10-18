# 🤖 WhatsApp AI Chatbot

An intelligent **WhatsApp Chatbot** built with **Node.js** and **Python**, designed to automate business and community conversations.  
This hybrid system uses **Node.js** for real-time WhatsApp messaging and **Python** for AI-driven responses and Google Contacts synchronization.  

> Developed by **Christopher Kola** 🧠  
> Integrated with **Google Contacts**, **Ngrok**, and optional **Render deployment**.

---

## 🚀 Features

- 💬 **Real-time WhatsApp messaging** using the [Baileys](https://github.com/WhiskeySockets/Baileys) library  
- 🧩 **Hybrid architecture** — Node.js handles WhatsApp sessions; Python manages AI and contact syncing  
- ⚙️ **Start/Stop Bot Control** — the client can activate or pause the bot using WhatsApp commands like `start` and `stop`  
- 🧠 **AI-Driven Branching Flows** — supports conditional message paths for different products or communities (e.g. *Blossom* and *Tribe*)  
- 📇 **Smart Contact Management**
  - Collects user name, phone, and location  
  - Syncs new contacts with **Google Contacts** automatically via the Python backend  
- 🔍 **Group Detection** — the bot ignores group chats unless explicitly configured  
- 🕒 **Timeout Prompts & Fallbacks** — gracefully re-prompts inactive users or provides fallback responses  
- 🌐 **Ngrok Integration** for secure local testing and remote QR scanning  
- ☁️ **Render Deployment Ready** for cloud hosting  

---

## 🧱 Project Architecture

whatsapp-ai-bot/
├── node_backend/              # Node.js server for WhatsApp integration
│   ├── index.js               # Main entry file
│   ├── messageHandler.js      # Handles incoming/outgoing WhatsApp messages
│   ├── contactController.js   # Saves and formats user contacts
│   ├── utils/
│   │   ├── detectChatType.js  # Identifies if chat is group or private
│   │   └── commands.js        # Logic for start/stop and fallback prompts
│   ├── package.json
│   └── .env
│
├── python_backend/            # Python AI + Google Contacts sync
│   ├── google_sync.py         # Handles Google Contacts API integration
│   ├── ai_engine.py           # Processes AI or NLP-based responses
│   ├── requirements.txt
│   └── .env
│
├── README.md
└── docs/
└── user_manual.md         # Client usage guide (QR setup, bot commands)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/whatsapp-ai-bot.git
cd whatsapp-ai-bot
```

### 2️⃣ Install Node.js dependencies

```bash
cd node_backend
npm install
```

### 3️⃣ Install Python dependencies

```bash
cd ../python_backend
pip install -r requirements.txt
```

### 4️⃣ Set up environment variables

.env (Node.js)
```bash
SESSION_NAME=whatsapp-bot
PORT=3000
PYTHON_API=http://localhost:5000
```

.env (Python)
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

## 🧠 Usage

## 🔹 Start the WhatsApp bot

```bash 
# Inside node_backend
npm start
```

A QR code will be generated in your terminal or accessible via Ngrok.
Scan it with your WhatsApp to authenticate the bot session.

## 🔹 Start the Python backend

```bash 
# Inside python_backend
python google_sync.py
```

This service runs AI logic and Google Contacts sync in the background.

## 💬 Bot Commands

## 🧩 Example Use Cases

  •	Businesses: Automate customer onboarding or order confirmations
	•	Communities: Manage membership groups like Tribe or Blossom
	•	Developers: Extend with custom AI modules, sentiment analysis, or CRM sync

## 🧠 Tech Stack

## 🧰 Scripts

## 🧪 Testing

Both services use Test-Driven Development (TDD) principles.
	•	Node.js: Uses Jest for unit and integration tests
	•	Python: Uses Pytest for AI and Google sync tests

📈 Future Improvements
	•	✅ Add Docker for seamless deployment
	•	✅ Introduce database persistence (MongoDB / PostgreSQL)
	•	✅ Expand AI to handle natural conversations
	•	✅ Build an admin dashboard for analytics
	•	✅ Add message queue for scalable multi-client handling
