const API_KEY = 'INSERT API KEY HERE';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Function to speak the response text
function speak(text) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1; // Keep speech rate at normal speed
    text_speak.volume = 1;
    text_speak.pitch = 1;

    // Start speaking the new text
    window.speechSynthesis.speak(text_speak);

    // Return the rate for synchronization with the typewriter effect
    return text_speak.rate;
}

// Function to update the output box with the letter-by-letter typewriter effect
function updateOutputWithTypingEffect(responseText, speechRate) {
    const outputBox = document.querySelector('.output-box');
    outputBox.textContent = ''; // Clear the previous text
    let index = 0;

    // Set typing interval based on the speech rate
    const typingSpeed = Math.max(5, 50 / speechRate); // Ensure the text appears quickly (no less than 20ms per character)
    
    // Simulate typing the response text letter by letter
    const typingIntervalID = setInterval(() => {
        if (index < responseText.length) {
            outputBox.textContent += responseText.charAt(index); // Add one character at a time
            index++;
        } else {
            clearInterval(typingIntervalID); // Stop typing once the full text is displayed
        }
    }, typingSpeed);
}

// Example function that calls the Gemini API
const generateAPIResponse = async (userMessage) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            })
        });

        const data = await response.json();
        const apiResponse = data?.candidates[0]?.content?.parts[0]?.text;

        if (apiResponse) {
            console.log("API Response:", apiResponse);
            const speechRate = speak(apiResponse);  // Speak the API response and get the speech rate
            updateOutputWithTypingEffect(apiResponse, speechRate);  // Update the output box with the typing effect
        } else {
            throw new Error("Invalid response format.");
        }
    } catch (error) {
        console.error("Error with API request:", error);
        speak("Sorry, I encountered an error while getting the response.");
        updateOutputWithTypingEffect("Sorry, I couldn't get a response.", 1); // Default speed of 1
    }
};

// Handle speech recognition when button is clicked
const btn = document.querySelector('.talk');
const content = document.querySelector('.content');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript;
    content.textContent = transcript;
    generateAPIResponse(transcript.toLowerCase());
};

// Add event listener to the button
btn.addEventListener('click', () => {
    content.textContent = "Listening...";

    // If speech is currently happening, cancel it
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        content.textContent = "Speech interrupted. Listening...";
    }

    // Start the speech recognition
    recognition.start();
});
