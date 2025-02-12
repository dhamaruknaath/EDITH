const API_KEY = 'INSERT API KEY HERE';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

function speak(text) {
    window.speechSynthesis.cancel();
    const text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.volume = 1;
    text_speak.pitch = 1;
    window.speechSynthesis.speak(text_speak);
    return text_speak.rate;
}

function updateOutputWithTypingEffect(responseText, speechRate) {
    const outputBox = document.querySelector('.output-box');
    outputBox.innerHTML = '<span class="cursor">|</span>';
    let index = 0;
    const typingSpeed = Math.max(10, 40 / speechRate);

    const typingIntervalID = setInterval(() => {
        if (index < responseText.length) {
            outputBox.innerHTML = responseText.substring(0, index + 1) + '<span class="cursor">|</span>';
            index++;
        } else {
            clearInterval(typingIntervalID);
            outputBox.innerHTML = responseText;
        }
    }, typingSpeed);
}

const generateAPIResponse = async (userMessage) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: userMessage }]}] })
        });

        const data = await response.json();
        const apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond to that.";
        console.log("API Response:", apiResponse);
        const speechRate = speak(apiResponse);
        updateOutputWithTypingEffect(apiResponse, speechRate);
    } catch (error) {
        console.error("Error:", error);
        speak("Sorry, I encountered an error.");
        updateOutputWithTypingEffect("Error processing your request.", 1);
    }
};

const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = false;

recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript;
    content.textContent = transcript;
    generateAPIResponse(transcript.toLowerCase());
};

btn.addEventListener('click', () => {
    content.textContent = "Listening...";
    recognition.start();
});
