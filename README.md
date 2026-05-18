# 🧠 Dokkai

> Summarise any webpage and chat with its content — powered by Google Gemini AI.

![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat&logo=googlechrome&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?style=flat&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

<img width="1920" height="1200" alt="dokkai" src="https://github.com/user-attachments/assets/262d9917-4715-4cdf-9995-d0a313e7d97f" />


---

## What it does

Dokkai is a Chrome extension that opens as a sidebar on any webpage. In one click it reads the page, generates an AI summary, and lets you ask follow-up questions — all without leaving the tab.

- **Instant summaries** — paste any article, product page, or documentation and get a clear breakdown in seconds
- **Chat with the page** — ask specific questions and get answers grounded in the actual page content
- **Persistent API key** — enter your key once, stored locally, never shared
- **Clean UI** — minimal dark sidebar that stays out of your way

---

## Demo

> 📹 [Watch the demo on YouTube](#) 

---

## Tech stack

- **Vanilla JavaScript** — no frameworks, no build tools
- **Chrome Extensions Manifest V3** — service workers, side panel API, scripting API
- **Google Gemini 2.5 Flash API** — fast and free tier available
- **Chrome Storage API** — local key persistence

---

## Getting started

### Prerequisites
- Google Chrome browser
- A free Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/yourusername/dokkai-extension.git
   ```

2. Open Chrome and go to `chrome://extensions`

3. Enable **Developer Mode** (toggle in the top right)

4. Click **Load unpacked** and select the `dokkai-extension` folder

5. Click the Dokkai icon in your toolbar to open the sidebar

6. Click ⚙ and paste your Gemini API key → Save

### Usage

1. Navigate to any webpage
2. Click the **Dokkai icon** in your Chrome toolbar
3. Hit **Analyse Page** to generate a summary
4. Type questions in the chat box to dig deeper

---

## Project structure

```
dokkai-extension/
├── manifest.json       # Chrome extension config (Manifest V3)
├── background.js       # Service worker — handles tab access & messaging
├── sidebar.html        # Sidebar UI markup
├── sidebar.css         # Styling
├── sidebar.js          # Core logic — Gemini API calls, chat, summary
└── icon.png            # Extension icon
```

---

## Security

Your API key is stored using Chrome's local storage API and never leaves your machine. It is not sent to any third-party server — only directly to Google's Gemini API.

---

## Roadmap

- [ ] Export summary as PDF or markdown
- [ ] Highlight key sentences on the page
- [ ] Support for multiple AI providers (OpenAI, Claude)
- [ ] Summary history across tabs

---

## License

MIT — do whatever you want with it.

---

*Built with vanilla JS and the Gemini API. No frameworks. No build step. Just drop it in Chrome and go.*
