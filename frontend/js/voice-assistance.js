
document.addEventListener("DOMContentLoaded", function () {

    const widget = document.getElementById("farmer-voice-widget");
    const toggleButton = document.getElementById("voice-toggle");
    const closeButton = document.getElementById("voice-close");
    const panel = document.getElementById("voice-panel");
    const startButton = document.getElementById("voice-start");
    const languageSelect = document.getElementById("voice-language");

    const statusBox = document.getElementById("voice-status");
    const transcriptBox = document.getElementById("voice-transcript");
    const responseBox = document.getElementById("voice-response");

    if (!widget) return;

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    let recognition = null;
    let isListening = false;

    const languageNames = {
        "en-IN": "English",
        "hi-IN": "Hindi",
        "or-IN": "Odia"
    };

    const commands = [
        {
            section: "dashboard",
            keywords: [
                "dashboard", "home", "main page",
                "डैशबोर्ड", "मुख्य पृष्ठ",
                "ଡ୍ୟାସବୋର୍ଡ", "ମୁଖ୍ୟ ପୃଷ୍ଠା"
            ],
            responses: {
                "en-IN": "Opening your dashboard.",
                "hi-IN": "आपका डैशबोर्ड खोल रहा हूँ।",
                "or-IN": "ଆପଣଙ୍କ ଡ୍ୟାସବୋର୍ଡ ଖୋଲୁଛି।"
            }
        },
        {
            section: "products",
            keywords: [
                "products", "my products", "manage products",
                "प्रोडक्ट", "मेरे उत्पाद", "उत्पाद",
                "ଉତ୍ପାଦ", "ମୋ ଉତ୍ପାଦ"
            ],
            responses: {
                "en-IN": "Opening your products.",
                "hi-IN": "आपके उत्पाद खोल रहा हूँ।",
                "or-IN": "ଆପଣଙ୍କ ଉତ୍ପାଦ ଖୋଲୁଛି।"
            }
        },
        {
            section: "add-product",
            keywords: [
                "add product", "new product", "add new product",
                "नया उत्पाद", "प्रोडक्ट जोड़ें",
                "ନୂଆ ଉତ୍ପାଦ", "ଉତ୍ପାଦ ଯୋଡ଼ନ୍ତୁ"
            ],
            responses: {
                "en-IN": "Opening the add product section.",
                "hi-IN": "नया उत्पाद जोड़ने वाला सेक्शन खोल रहा हूँ।",
                "or-IN": "ନୂଆ ଉତ୍ପାଦ ଯୋଡ଼ିବା ବିଭାଗ ଖୋଲୁଛି।"
            }
        },
        {
            section: "orders",
            keywords: [
                "orders", "my orders", "show my orders",
                "ऑर्डर", "मेरे ऑर्डर",
                "ଅର୍ଡର", "ମୋ ଅର୍ଡର"
            ],
            responses: {
                "en-IN": "Opening your orders.",
                "hi-IN": "आपके ऑर्डर खोल रहा हूँ।",
                "or-IN": "ଆପଣଙ୍କ ଅର୍ଡର ଖୋଲୁଛି।"
            }
        },
        {
            section: "harvest",
            keywords: [
                "harvest", "my harvest", "harvest management",
                "फसल", "मेरी फसल",
                "ଫସଲ", "ମୋ ଫସଲ"
            ],
            responses: {
                "en-IN": "Opening your harvest management.",
                "hi-IN": "आपका फसल प्रबंधन खोल रहा हूँ।",
                "or-IN": "ଆପଣଙ୍କ ଫସଲ ପରିଚାଳନା ଖୋଲୁଛି।"
            }
        },
        {
            section: "bulk-supply",
            keywords: [
                "bulk supply", "bulk orders", "supply",
                "बल्क सप्लाई", "थोक सप्लाई",
                "ବଲ୍କ ସପ୍ଲାଏ", "ଯୋଗାଣ"
            ],
            responses: {
                "en-IN": "Opening bulk supply opportunities.",
                "hi-IN": "बल्क सप्लाई के अवसर खोल रहा हूँ।",
                "or-IN": "ବଲ୍କ ସପ୍ଲାଏ ସୁଯୋଗ ଖୋଲୁଛି।"
            }
        },
        {
            section: "income-expenses",
            keywords: [
                "income", "expenses", "my income",
                "earnings", "profit",
                "आय", "कमाई", "खर्च",
                "ଆୟ", "ରୋଜଗାର", "ଖର୍ଚ୍ଚ"
            ],
            responses: {
                "en-IN": "Opening your income and expenses.",
                "hi-IN": "आपकी आय और खर्च का सेक्शन खोल रहा हूँ।",
                "or-IN": "ଆପଣଙ୍କ ଆୟ ଏବଂ ଖର୍ଚ୍ଚ ବିଭାଗ ଖୋଲୁଛି।"
            }
        },
        {
            section: "profile",
            keywords: [
                "profile", "my profile", "farm profile",
                "प्रोफाइल", "मेरी प्रोफाइल",
                "ପ୍ରୋଫାଇଲ", "ମୋ ପ୍ରୋଫାଇଲ"
            ],
            responses: {
                "en-IN": "Opening your farm profile.",
                "hi-IN": "आपकी फार्म प्रोफाइल खोल रहा हूँ।",
                "or-IN": "ଆପଣଙ୍କ ଫାର୍ମ ପ୍ରୋଫାଇଲ ଖୋଲୁଛି।"
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

    function showResponse(message, language) {

        responseBox.textContent = message;
        speak(message, language);

    }

    function openSection(sectionId) {

        const target = document.getElementById(sectionId);

        if (!target) return false;

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        if (sectionId === "products" ||
            sectionId === "add-product") {

            target.classList.add("voice-highlight");

            setTimeout(function () {
                target.classList.remove("voice-highlight");
            }, 1800);

        }

        return true;

    }

    function processCommand(spokenText) {

        const language = languageSelect.value;
        const text = spokenText.toLowerCase().trim();

        transcriptBox.textContent = spokenText;

        const matchedCommand = commands.find(function (command) {

            return command.keywords.some(function (keyword) {
                return text.includes(keyword.toLowerCase());
            });

        });

        if (matchedCommand) {

            openSection(matchedCommand.section);

            const message =
                matchedCommand.responses[language];

            showResponse(message, language);

            statusBox.textContent = "Command completed.";

        } else {

            const messages = {
                "en-IN": "Sorry, I could not understand that command. Please try again.",
                "hi-IN": "माफ़ कीजिए, मैं आपका निर्देश नहीं समझ पाया। कृपया दोबारा कोशिश करें।",
                "or-IN": "ଦୁଃଖିତ, ମୁଁ ଆପଣଙ୍କ ନିର୍ଦ୍ଦେଶ ବୁଝିପାରିଲି ନାହିଁ। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।"
            };

            showResponse(messages[language], language);

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

            const spokenText =
                event.results[0][0].transcript;

            processCommand(spokenText);

        };

        recognition.onerror = function (event) {

            statusBox.textContent =
                "Voice error: " + event.error;

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

        statusBox.textContent =
            "Language selected: " + languageNames[languageSelect.value];

        transcriptBox.textContent =
            "Your spoken command will appear here.";

        responseBox.textContent =
            "Your assistant is ready.";

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
