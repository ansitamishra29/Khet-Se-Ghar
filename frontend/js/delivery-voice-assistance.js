
document.addEventListener("DOMContentLoaded", function () {

    const toggleButton = document.getElementById("delivery-voice-toggle");
    const closeButton = document.getElementById("delivery-voice-close");
    const panel = document.getElementById("delivery-voice-panel");
    const startButton = document.getElementById("delivery-voice-start");
    const languageSelect = document.getElementById("delivery-voice-language");

    const statusBox = document.getElementById("delivery-voice-status");
    const transcriptBox = document.getElementById("delivery-voice-transcript");
    const responseBox = document.getElementById("delivery-voice-response");

    if (!toggleButton || !closeButton || !panel || !startButton ||
        !languageSelect || !statusBox || !transcriptBox || !responseBox) {
        console.error("Delivery voice assistant elements are missing.");
        return;
    }

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    let recognition = null;
    let isListening = false;

    function normalizeText(value) {
        return value
            .toLowerCase()
            .replace(/[.,!?।]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    const commands = [
        {
            keywords: [
                "dashboard", "overview", "home", "open dashboard",
                "डैशबोर्ड", "मुख्य पृष्ठ",
                "ଡ୍ୟାସବୋର୍ଡ", "ମୁଖ୍ୟ ପୃଷ୍ଠା"
            ],
            target: "overview",
            responses: {
                "en-IN": "Opening your delivery dashboard.",
                "hi-IN": "आपका डिलीवरी डैशबोर्ड खोल रहा हूँ।",
                "or-IN": "ଆପଣଙ୍କ ଡେଲିଭରି ଡ୍ୟାସବୋର୍ଡ ଖୋଲୁଛି।"
            }
        },
        {
            keywords: [
                "available deliveries", "show available",
                "available orders", "available delivery",
                "show available deliveries", "show available orders",
                "उपलब्ध डिलीवरी", "उपलब्ध ऑर्डर",
                "ଉପଲବ୍ଧ ଡେଲିଭରି", "ଉପଲବ୍ଧ ଅର୍ଡର"
            ],
            target: "available",
            responses: {
                "en-IN": "Showing available deliveries.",
                "hi-IN": "उपलब्ध डिलीवरी दिखा रहा हूँ।",
                "or-IN": "ଉପଲବ୍ଧ ଡେଲିଭରି ଦେଖାଉଛି।"
            }
        },
        {
            keywords: [
                "my deliveries", "my delivery",
                "more delivery", "more deliveries",
                "my orders", "my order",
                "accepted deliveries", "assigned deliveries",
                "show my deliveries", "show my orders",
                "मेरी डिलीवरी", "मेरी डिलीवरी दिखाओ",
                "मेरे ऑर्डर", "मेरी डिलीवरी खोलो",
                "ମୋ ଡେଲିଭରି", "ମୋ ଅର୍ଡର",
                "ମୋ ଡେଲିଭରି ଦେଖାଅ"
            ],
            target: "my-deliveries",
            responses: {
                "en-IN": "Opening your assigned deliveries.",
                "hi-IN": "आपकी डिलीवरी खोल रहा हूँ।",
                "or-IN": "ଆପଣଙ୍କ ଡେଲିଭରି ଖୋଲୁଛି।"
            }
        }
    ];

    const refreshCommands = [
        {
            keywords: [
                "refresh available deliveries",
                "refresh available orders",
                "refresh available",
                "उपलब्ध डिलीवरी रिफ्रेश",
                "उपलब्ध ऑर्डर अपडेट",
                "ଉପଲବ୍ଧ ଡେଲିଭରି ରିଫ୍ରେସ",
                "ଉପଲବ୍ଧ ଅର୍ଡର ଅପଡେଟ"
            ],
            button: "refresh-available",
            messages: {
                "en-IN": "Refreshing available deliveries.",
                "hi-IN": "उपलब्ध डिलीवरी अपडेट कर रहा हूँ।",
                "or-IN": "ଉପଲବ୍ଧ ଡେଲିଭରି ଅପଡେଟ୍ କରୁଛି।"
            }
        },
        {
            keywords: [
                "refresh my deliveries",
                "refresh my delivery",
                "refresh more delivery",
                "refresh my orders",
                "मेरी डिलीवरी रिफ्रेश",
                "मेरे ऑर्डर अपडेट",
                "ମୋ ଡେଲିଭରି ରିଫ୍ରେସ",
                "ମୋ ଅର୍ଡର ଅପଡେଟ"
            ],
            button: "refresh-mine",
            messages: {
                "en-IN": "Refreshing your deliveries.",
                "hi-IN": "आपकी डिलीवरी अपडेट कर रहा हूँ।",
                "or-IN": "ଆପଣଙ୍କ ଡେଲିଭରି ଅପଡେଟ୍ କରୁଛି।"
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
        const text = normalizeText(spokenText);

        transcriptBox.textContent = "Recognised: " + spokenText;

        // Check refresh commands first.
        const refreshMatch = refreshCommands.find(command =>
            command.keywords.some(keyword =>
                text.includes(normalizeText(keyword))
            )
        );

        if (refreshMatch) {
            const button = document.getElementById(refreshMatch.button);

            if (button) {
                button.click();
                respond(refreshMatch.messages[language], language);
                statusBox.textContent = "Command completed.";
            } else {
                statusBox.textContent = "Refresh button not found.";
            }

            return;
        }

        // Check navigation commands.
        const matchedCommand = commands.find(command =>
            command.keywords.some(keyword =>
                text.includes(normalizeText(keyword))
            )
        );

        if (matchedCommand) {

            const target = document.getElementById(matchedCommand.target);

            if (!target) {
                statusBox.textContent = "Dashboard section not found.";
                return;
            }

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            respond(matchedCommand.responses[language], language);
            statusBox.textContent = "Command completed.";

        } else {

            const messages = {
                "en-IN": "Sorry, I could not understand. Try dashboard, available deliveries or my deliveries.",
                "hi-IN": "माफ़ कीजिए, मैं समझ नहीं पाया। डैशबोर्ड, उपलब्ध डिलीवरी या मेरी डिलीवरी कहकर देखें।",
                "or-IN": "ଦୁଃଖିତ, ମୁଁ ବୁଝିପାରିଲି ନାହିଁ। ଡ୍ୟାସବୋର୍ଡ, ଉପଲବ୍ଧ ଡେଲିଭରି କିମ୍ବା ମୋ ଡେଲିଭରି କହି ଚେଷ୍ଟା କରନ୍ତୁ।"
            };

            respond(messages[language], language);
            statusBox.textContent = "Command not recognised.";
        }
    }

    function createRecognition() {

        if (!SpeechRecognition) {
            statusBox.textContent =
                "Voice recognition is not supported in this browser.";
            startButton.disabled = true;
            return;
        }

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

        const languageName =
            languageSelect.options[languageSelect.selectedIndex].text;

        statusBox.textContent = "Language selected: " + languageName;
        transcriptBox.textContent = "Your spoken command will appear here.";
        responseBox.textContent = "Your assistant is ready.";
    });

    startButton.addEventListener("click", function () {

        if (!SpeechRecognition) {
            statusBox.textContent =
                "Please use a supported browser such as Chrome.";
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
            statusBox.textContent =
                "Unable to start microphone. Please try again.";
        }
    });

});
