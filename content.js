function extractTextFromPage() {
  const elements = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span");
  const texts = Array.from(elements)
    .filter((el) => el.offsetParent !== null && el.innerText.trim() !== "")
    .map((el) => el.innerText);

  let fullText = texts
    .join(" ")
    .replace(/[^a-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return fullText.length <= 3000
    ? fullText
    : fullText.substring(
        (fullText.length - 3000) / 2,
        (fullText.length + 3000) / 2
      );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extract_text") {
    sendResponse({ text: extractTextFromPage() });
  }
});
