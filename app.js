const apiKey = "PASTE_YOUR_OPENAI_API_KEY_HERE"; 
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

sendBtn.addEventListener('click', handleUserMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserMessage(); });

async function handleUserMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    userInput.value = '';

    const aiResponse = await askAI(text);
    appendMessage(aiResponse, 'ai');

    parseAndExecute(aiResponse);
}

function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.innerText = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function askAI(promptText) {
    if (apiKey.includes("PASTE_YOUR")) return "Error: Please add your API key to app.js";
    
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { 
                        role: "system", 
                        content: "You are an automated broker assistant. If the user wants to trade, reply strictly with this format block: [EXECUTE;ACTION;SYMBOL;VOLUME] where ACTION is BUY or SELL, SYMBOL is uppercase currency name, and VOLUME is a decimal number. Example: [EXECUTE;BUY;EURUSD;0.1]. If they are just talking or asking questions, respond with a helpful short sentence." 
                    },
                    { role: "user", content: promptText }
                ]
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (err) {
        return "AI Connection timeout.";
    }
}

function parseAndExecute(aiText) {
    if (aiText.includes('[EXECUTE;')) {
        const match = aiText.match(/\[EXECUTE;[A-Z]+;[A-Z0-9]+;[0-9.]+\]/g);
        if (match) {
            // Shout the raw string out of the web container directly to cTrader's environment
            window.postMessage(match[0], "*");
        }
    }
}
