# DoomMeter Chrome Extension

DoomMeter is a Chrome extension that scans web pages in real time and rates their sentiment from **1 (neutral)** to **10 (very negative)** using OpenAI's GPT-4o-mini model. The sentiment score is visually displayed on the page as a "Doom Meter."

![DoomMeter Gif](assets/doom-meter.gif)

---

## Features

- Automatically analyzes web pages when opened or switched to
- Uses content extraction and text cleaning for minimal tokens & accurate analysis
- Scores pages on a 1–10 "doom" scale
- Toggle functionality in the extension popup
- Sentiment analysis powered by a (currently) local server and OpenAI GPT
- Stores sentiment per tab using Chrome local storage

---

## Chrome Extension Setup

### 1. Clone the Repo

```bash
git clone https://github.com/gaberobison/doom-meter.git
cd doom-meter
```

### 2. Load Extension in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **"Load unpacked"**
4. Select the extension directory (`doom-meter/`)

---

## Local Server Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Create a `.env` file in the root of the project:

```bash
cp .env.example .env
```

Then add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

- API keys are stored in `.env` and never in extension code
- `.env` and `logs/` are ignored via `.gitignore`
- Do **not** expose the OpenAI key in client-side scripts

### 3. Start the Server

```bash
npm start
```

The server runs at `http://localhost:3000` and provides a `/analyze-sentiment` endpoint.

---

## Example Request to test Local Server

```bash
user ~ % curl -X POST http://localhost:3000/analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "Today was a terrible day. Everything went wrong."}'
```

Response:

```json
{
  "score": 10,
  "message": "🚨 Doom alert! This page might ruin your whole day."
}
```

---

## Troubleshooting

- **CORS Error**: Ensure the extension is allowed to access `localhost:3000`
- **No Score Displayed**: Make sure the server is running before opening tabs
- **Extension not injecting**: URLs starting with `chrome://`, `file://`, and some Google domains are not allowed to be analyzed to save on openAI tokens (sorry if you use a different browser or search engine lol)

---

## Contributing

- Pull requests and feature suggestions are welcome! Feel free to fork the repo and submit improvements.
- If you have any questions or feedback, feel free to reach out at:  
  📧 gaberobison.mn@gmail.com
