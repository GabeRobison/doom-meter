# DoomMeter Chrome Extension

DoomMeter is a Chrome extension that scans web pages in real time and rates their sentiment from **1 (neutral)** to **10 (very negative)** using OpenAI's GPT-4o-mini model. The sentiment score is visually displayed on the page as a "Doom Meter."

![DoomMeter Gif](assets/doomMeter.gif)

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

### 3. Start the Server

```bash
npm start
```

The server runs at `http://localhost:3000` and provides a `/analyze-sentiment` endpoint.

---

## Project Structure

```
doom-meter/
├── background.js       # Chrome extension logic and tab analysis
├── content.js          # Extracts and cleans text from webpages
├── popup.html          # Extension popup UI
├── popup.js            # Handles popup toggle behavior
├── server.js           # Express server for sentiment analysis
├── .env.example        # Example env file
├── logs/               # Text logs of analyzed pages
├── package.json        # Node.js dependencies
└── assets/             # Images (e.g., doom-meter.png)
```

---

## Security & Best Practices

- API keys are stored in `.env` and never in extension code
- `.env` and `logs/` are ignored via `.gitignore`
- Requests from the extension are routed through a secure local server
- Do **not** expose the OpenAI key in client-side scripts

---

## Example Request to Local Server

```bash
POST http://localhost:3000/analyze-sentiment
Content-Type: application/json

{
  "text": "Today was a terrible day. Everything went wrong."
}
```

Response:

```json
{
  "score": "9"
}
```

---

## Troubleshooting

- **CORS Error**: Ensure the extension is allowed to access `localhost:3000`
- **No Score Displayed**: Make sure the server is running before opening tabs
- **Extension not injecting**: Avoid restricted URLs like `chrome://`, `file://`, and some Google domains

---

## 🤝 Contributing

Pull requests and feature suggestions are welcome! Feel free to fork the repo and submit improvements.

---

## 📬 Contact

If you have any questions or feedback, feel free to reach out at:  
📧 gaberobison.mn@gmail.com
