
document.addEventListener("DOMContentLoaded", function () {

    const toggleButton = document.getElementById("partner-voice-toggle");
    const closeButton = document.getElementById("partner-voice-close");
    const panel = document.getElementById("partner-voice-panel");
    const startButton = document.getElementById("partner-voice-start");
    const languageSelect = document.getElementById("partner-voice-language");

    const statusBox = document.getElementById("partner-voice-status");
    const transcriptBox = document.getElementById("partner-voice-transcript");
    const responseBox = document.getElementById("partner-voice-response");

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    let recognition = null;
    let isListening = false;

    const commands = [
        {
            keywords: ["dashboard", "overview", "home", "डैशबोर्ड", "मुख्य पृष्ठ", "ଡ୍ୟାସବୋର୍ଡ"],
            action: "overview",
            responses: {
                "en-IN": "Opening your dashboard overview.",
                "hi-IN": "आपका डैशबोर्ड खोल रहा हूँ।",
                "or-IN": "ଆପଣଙ୍କ ଡ୍ୟାସବୋର୍ଡ ଖୋଲୁଛି।"
            }
        },
        {
            keywords: ["orders", "customer orders", "show orders", "ऑर्डर", "ग्राहक ऑर्डर", "ଅର୍ଡର", "ଗ୍ରାହକ ଅର୍ଡର"],
            action: "orders",
            responses: {
                "en-IN": "Opening customer orders.",
                "hi-IN": "ग्राहक ऑर्डर खोल रहा हूँ।",
                "or-IN": "ଗ୍ରାହକ ଅର୍ଡର ଖୋଲୁଛି।"
            }
        }
    ];

    function speak(message, language) {

        if (!("speechSynthesis" in window)) {
            responseBox.textContent = message;
            return;
        }

        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = language;
        speech.rate = 0.9;

        window.speechSynthesis.speak(speech);

    }

    function respond(message, language) {

        responseBox.textContent = message;
        speak(message, language);

    }

    function processCommand(spokenText) {

        const language = languageSelect.value;
        const text = spokenText.toLowerCase().trim();

       transcriptBox.textContent = "Recognised: " + spokenText;

        // Refresh orders command
        const refreshKeywords = [
            "refresh orders",
            "reload orders",
            "ऑर्डर रिफ्रेश",
            "ऑर्डर अपडेट",
            "ଅର୍ଡର ରିଫ୍ରେସ",
            "ଅର୍ଡର ଅପଡେଟ"
        ];

        if (refreshKeywords.some(keyword => text.includes(keyword))) {

            const refreshButton = document.getElementById("refresh-orders");

            if (refreshButton) {
                refreshButton.click();

                const messages = {
                    "en-IN": "Refreshing customer orders.",
                    "hi-IN": "ग्राहक ऑर्डर अपडेट कर रहा हूँ।",
                    "or-IN": "ଗ୍ରାହକ ଅର୍ଡର ଅପଡେଟ୍ କରୁଛି।"
                };

                respond(messages[language], language);
                statusBox.textContent = "Command completed.";
            }

            return;
        }

        const matchedCommand = commands.find(command =>
            command.keywords.some(keyword => text.includes(keyword.toLowerCase()))
        );

        if (matchedCommand) {

            const target = document.getElementById(matchedCommand.action);

            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            respond(matchedCommand.responses[language], language);
            statusBox.textContent = "Command completed.";

        } else {

            const messages = {
                "en-IN": "Sorry, I could not understand. Try saying show dashboard or show customer orders.",
                "hi-IN": "माफ़ कीजिए, मैं समझ नहीं पाया। डैशबोर्ड या ग्राहक ऑर्डर कहकर देखें।",
                "or-IN": "ଦୁଃଖିତ, ମୁଁ ବୁଝିପାରିଲି ନାହିଁ। ଡ୍ୟାସବୋର୍ଡ କିମ୍ବା ଗ୍ରାହକ ଅର୍ଡର କହି ଚେଷ୍ଟା କରନ୍ତୁ।"
            };

            respond(messages[language], language);
            statusBox.textContent = "Command not recognised.";

        }

    }

    function createRecognition() {

        recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = languageSelect.value;

        recognition.onstart = function () {

            isListening = true;
            statusBox.textContent = "Listening... Speak now.";
            startButton.textContent = "🎤 Listening...";

        };

        recognition.onresult = function (event) {

            const spokenText = event.results[0][0].transcript;
            processCommand(spokenText);

        };

        recognition.onerror = function (event) {

            statusBox.textContent = "Voice error: " + event.error;

        };

        recognition.onend = function () {

            isListening = false;
            startButton.textContent = "🎤 Start Listening";

        };

    }

    toggleButton.addEventListener("click", function () {
        panel.classList.toggle("open");
    });

    closeButton.addEventListener("click", function () {

        panel.classList.remove("open");

        if (recognition && isListening) {
            recognition.stop();
        }

    });

    languageSelect.addEventListener("change", function () {

        if (recognition && isListening) {
            recognition.stop();
        }

        statusBox.textContent = "Language selected: " + languageSelect.options[languageSelect.selectedIndex].text;
        transcriptBox.textContent = "Your spoken command will appear here.";
        responseBox.textContent = "Your assistant is ready.";

    });

    startButton.addEventListener("click", function () {

        if (!SpeechRecognition) {
            statusBox.textContent = "Voice recognition is not supported in this browser.";
            return;
        }

        if (isListening) {
            recognition.stop();
            return;
        }

        createRecognition();

        try {
            recognition.start();
        } catch (error) {
            statusBox.textContent = "Unable to start microphone. Please try again.";
        }

    });

});
