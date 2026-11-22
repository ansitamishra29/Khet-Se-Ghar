
document.addEventListener("DOMContentLoaded", function () {

    const toggleButton = document.getElementById("business-voice-toggle");
    const closeButton = document.getElementById("business-voice-close");
    const panel = document.getElementById("business-voice-panel");
    const startButton = document.getElementById("business-voice-start");
    const languageSelect = document.getElementById("business-voice-language");

    const statusBox = document.getElementById("business-voice-status");
    const transcriptBox = document.getElementById("business-voice-transcript");
    const responseBox = document.getElementById("business-voice-response");

    if (!toggleButton || !closeButton || !panel || !startButton ||
        !languageSelect || !statusBox || !transcriptBox || !responseBox) {
        console.error("Business voice assistant elements are missing.");
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
                "dashboard", "overview", "home",
                "open dashboard", "business dashboard",
                "डैशबोर्ड", "मुख्य पृष्ठ",
                "ବ୍ୟବସାୟ ଡ୍ୟାସବୋର୍ଡ",
                "ଡ୍ୟାସବୋର୍ଡ", "ମୁଖ୍ୟ ପୃଷ୍ଠା"
            ],
            target: "top",
            responses: {
                "en-IN": "Opening your business dashboard.",
                "hi-IN": "आपका बिजनेस डैशबोर्ड खोल रहा हूँ।",
                "or-IN": "ଆପଣଙ୍କ ବ୍ୟବସାୟ ଡ୍ୟାସବୋର୍ଡ ଖୋଲୁଛି।"
            }
        },
        {
            keywords: [
                "product catalogue", "product catalog",
                "available products", "browse products",
                "products", "farm products",
                "उत्पाद सूची", "प्रोडक्ट कैटलॉग",
                "उपलब्ध उत्पाद", "उत्पाद दिखाओ",
                "ଉତ୍ପାଦ ତାଲିକା", "ଉପଲବ୍ଧ ଉତ୍ପାଦ",
                "ଉତ୍ପାଦ ଦେଖାଅ", "ଫାର୍ମ ଉତ୍ପାଦ"
            ],
            target: "catalogue",
            responses: {
                "en-IN": "Opening the available product catalogue.",
                "hi-IN": "उपलब्ध उत्पादों की सूची खोल रहा हूँ।",
                "or-IN": "ଉପଲବ୍ଧ ଉତ୍ପାଦ ତାଲିକା ଖୋଲୁଛି।"
            }
        },
        {
            keywords: [
                "bulk procurement", "bulk requirement",
                "bulk orders", "bulk supply",
                "थोक खरीद", "बल्क प्रोक्योरमेंट",
                "थोक ऑर्डर", "थोक सप्लाई",
                "ବଲ୍କ ପ୍ରୋକ୍ୟୁରମେଣ୍ଟ",
                "ବଲ୍କ ଅର୍ଡର", "ଥୋକ କିଣା",
                "ବଲ୍କ ସପ୍ଲାଏ"
            ],
            target: "bulk-procurement",
            responses: {
                "en-IN": "Opening bulk procurement.",
                "hi-IN": "थोक खरीद का सेक्शन खोल रहा हूँ।",
                "or-IN": "ବଲ୍କ ପ୍ରୋକ୍ୟୁରମେଣ୍ଟ ବିଭାଗ ଖୋଲୁଛି।"
            }
        },
        {
            keywords: [
                "my cart", "open cart", "shopping cart",
                "मेरा कार्ट", "मेरी टोकरी", "कार्ट खोलो",
                "ମୋ କାର୍ଟ", "କାର୍ଟ ଖୋଲ",
                "ମୋ ଝୁଡ଼ି"
            ],
            page: "business_cart.html",
            responses: {
                "en-IN": "Opening your business cart.",
                "hi-IN": "आपका बिजनेस कार्ट खोल रहा हूँ।",
                "or-IN": "ଆପଣଙ୍କ ବ୍ୟବସାୟ କାର୍ଟ ଖୋଲୁଛି।"
            }
        },
        {
            keywords: [
                "my orders", "business orders",
                "order management", "track orders",
                "मेरे ऑर्डर", "मेरा ऑर्डर",
                "ऑर्डर प्रबंधन", "ऑर्डर दिखाओ",
                "ମୋ ଅର୍ଡର", "ଅର୍ଡର ପରିଚାଳନା",
                "ଅର୍ଡର ଦେଖାଅ"
            ],
            page: "business_orders.html",
            responses: {
                "en-IN": "Opening your business orders.",
                "hi-IN": "आपके बिजनेस ऑर्डर खोल रहा हूँ।",
                "or-IN": "ଆପଣଙ୍କ ବ୍ୟବସାୟ ଅର୍ଡର ଖୋଲୁଛି।"
            }
        },
        {
            keywords: [
                "suppliers", "my suppliers", "supplier list",
                "आपूर्तिकर्ता", "सप्लायर", "सप्लायर सूची",
                "ଯୋଗାଣକାରୀ", "ସପ୍ଲାୟର", "ସପ୍ଲାୟର ତାଲିକା"
            ],
            target: "catalogue",
            responses: {
                "en-IN": "Opening the supplier and product catalogue.",
                "hi-IN": "सप्लायर और उत्पाद सूची खोल रहा हूँ।",
                "or-IN": "ସପ୍ଲାୟର ଏବଂ ଉତ୍ପାଦ ତାଲିକା ଖୋଲୁଛି।"
            }
        },
        {
            keywords: [
                "payments", "payment details", "payment history",
                "भुगतान", "पेमेंट", "भुगतान विवरण",
                "ପେମେଣ୍ଟ", "ଦେୟ", "ପେମେଣ୍ଟ ବିବରଣୀ"
            ],
            target: "recent-orders",
            responses: {
                "en-IN": "Opening the payments section.",
                "hi-IN": "भुगतान सेक्शन खोल रहा हूँ।",
                "or-IN": "ପେମେଣ୍ଟ ବିଭାଗ ଖୋଲୁଛି।"
            }
        },
        {
            keywords: [
                "profile settings", "profile",
                "my profile", "account settings",
                "प्रोफाइल", "प्रोफाइल सेटिंग्स",
                "मेरा अकाउंट",
                "ପ୍ରୋଫାଇଲ", "ପ୍ରୋଫାଇଲ ସେଟିଂସ",
                "ମୋ ଆକାଉଣ୍ଟ"
            ],
            target: "profile",
            responses: {
                "en-IN": "Opening profile settings.",
                "hi-IN": "प्रोफाइल सेटिंग्स खोल रहा हूँ।",
                "or-IN": "ପ୍ରୋଫାଇଲ ସେଟିଂସ ଖୋଲୁଛି।"
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

        const matchedCommand = commands.find(command =>
            command.keywords.some(keyword =>
                text.includes(normalizeText(keyword))
            )
        );

        if (!matchedCommand) {

            const messages = {
                "en-IN": "Sorry, I could not understand. Try overview, product catalogue, bulk procurement, my cart or my orders.",
                "hi-IN": "माफ़ कीजिए, मैं समझ नहीं पाया। डैशबोर्ड, उत्पाद सूची, थोक खरीद, मेरा कार्ट या मेरे ऑर्डर कहकर देखें।",
                "or-IN": "ଦୁଃଖିତ, ମୁଁ ବୁଝିପାରିଲି ନାହିଁ। ଡ୍ୟାସବୋର୍ଡ, ଉତ୍ପାଦ ତାଲିକା, ବଲ୍କ ପ୍ରୋକ୍ୟୁରମେଣ୍ଟ, ମୋ କାର୍ଟ କିମ୍ବା ମୋ ଅର୍ଡର କହି ଚେଷ୍ଟା କରନ୍ତୁ।"
            };

            respond(messages[language], language);
            statusBox.textContent = "Command not recognised.";
            return;
        }

        if (matchedCommand.page) {

            respond(matchedCommand.responses[language], language);
            statusBox.textContent = "Opening page...";

            window.location.href = matchedCommand.page;
            return;
        }

        let target = null;

        if (matchedCommand.target === "top") {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        } else {
            target = document.getElementById(matchedCommand.target);

            if (!target) {
                statusBox.textContent = "Dashboard section not found.";
                return;
            }

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        respond(matchedCommand.responses[language], language);
        statusBox.textContent = "Command completed.";
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
