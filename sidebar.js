const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

let pageContent = null;
let chatHistory = [];
let apiKey = "";

// Elements
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const summarizeBtn = document.getElementById("summarizeBtn");
const summaryBox = document.getElementById("summaryBox");
const pageInfo = document.getElementById("pageInfo");
const pageTitle = document.getElementById("pageTitle");
const pageUrl = document.getElementById("pageUrl");
const chatSection = document.getElementById("chatSection");
const chatDivider = document.getElementById("chatDivider");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

// Load saved API key
chrome.storage.local.get("geminiApiKey", (result) => {
  if (result.geminiApiKey) {
    apiKey = result.geminiApiKey;
    apiKeyInput.value = apiKey;
  } else {
    // Show settings on first load if no key
    settingsPanel.classList.remove("hidden");
  }
});

// Settings toggle
settingsBtn.addEventListener("click", () => {
  settingsPanel.classList.toggle("hidden");
});

// Save key
saveKeyBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (!key) return alert("Please enter a valid API key.");
  apiKey = key;
  chrome.storage.local.set({ geminiApiKey: key }, () => {
    settingsPanel.classList.add("hidden");
    showToast("API key saved!");
  });
});

// Summarize button
summarizeBtn.addEventListener("click", async () => {
  if (!apiKey) {
    settingsPanel.classList.remove("hidden");
    return;
  }

  summarizeBtn.disabled = true;
  summarizeBtn.textContent = "Reading page";
  summaryBox.innerHTML = `<div class="empty-state"><div class="empty-icon dots">Analysing</div></div>`;

  // Get page content
  chrome.runtime.sendMessage({ type: "GET_PAGE_CONTENT" }, async (response) => {
    if (response?.error || !response?.data) {
      summaryBox.innerHTML = `<p style="color:#ff5555">Could not read page. Try refreshing.</p>`;
      summarizeBtn.disabled = false;
      summarizeBtn.textContent = "Analyse Page";
      return;
    }

    pageContent = response.data;
    pageTitle.textContent = pageContent.title || "Untitled";
    pageUrl.textContent = pageContent.url || "";
    pageInfo.classList.remove("hidden");

    // Reset chat
    chatHistory = [];

    const systemPrompt = `You are Dokkai, a sharp and intelligent reading assistant. 
The user is viewing a webpage. Here is the full page content:

TITLE: ${pageContent.title}
URL: ${pageContent.url}

CONTENT:
${pageContent.text}

Your job: give a clear, insightful summary. Use 3-5 short paragraphs. Be direct. No filler phrases like "certainly" or "of course". Highlight the most important points. If it's an article, capture the core argument. If it's a product page, capture what it does and who it's for.`;

    try {
      const summary = await callGemini([{ role: "user", parts: [{ text: systemPrompt }] }]);
      summaryBox.innerHTML = formatText(summary);

      // Show chat
      chatSection.classList.remove("hidden");
      chatDivider.classList.remove("hidden");

      // Seed chat history with context
      chatHistory.push({
        role: "user",
        parts: [{ text: `I'm reading this page:\n\nTITLE: ${pageContent.title}\nURL: ${pageContent.url}\n\nCONTENT:\n${pageContent.text}\n\nPlease help me understand it.` }]
      });
      chatHistory.push({
        role: "model",
        parts: [{ text: summary }]
      });

    } catch (err) {
      summaryBox.innerHTML = `<p style="color:#ff5555">Error: ${err.message}</p>`;
    }

    summarizeBtn.disabled = false;
    summarizeBtn.textContent = "Re-analyse";
  });
});

// Chat send
sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) sendMessage();
});

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || !apiKey) return;

  chatInput.value = "";
  sendBtn.disabled = true;

  appendMessage("user", text);

  const thinkingEl = appendMessage("ai thinking", "Thinking");

  chatHistory.push({ role: "user", parts: [{ text }] });

  try {
    const reply = await callGemini(chatHistory);
    chatHistory.push({ role: "model", parts: [{ text: reply }] });
    thinkingEl.remove();
    appendMessage("ai", reply);
  } catch (err) {
    thinkingEl.remove();
    appendMessage("ai", `Error: ${err.message}`);
  }

  sendBtn.disabled = false;
  chatInput.focus();
}

function appendMessage(type, text) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  if (type === "ai thinking") {
    div.innerHTML = `<span class="dots">${text}</span>`;
  } else if (type === "ai") {
    div.innerHTML = formatText(text);
  } else {
    div.textContent = text;
  }
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

async function callGemini(messages) {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: messages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: var(--accent); color: #000; font-family: var(--font-display);
    font-weight: 700; font-size: 12px; padding: 8px 18px;
    border-radius: 4px; z-index: 9999; animation: fadeIn 0.2s ease;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}
