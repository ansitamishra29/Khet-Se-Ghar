
document.addEventListener("DOMContentLoaded", function () {

    const toggleButton = document.getElementById("customer-voice-toggle");
    const closeButton = document.getElementById("customer-voice-close");
    const panel = document.getElementById("customer-voice-panel");
    const startButton = document.getElementById("customer-voice-start");
    const languageSelect = document.getElementById("customer-voice-language");

    const statusBox = document.getElementById("customer-voice-status");
    const transcriptBox = document.getElementById("customer-voice-transcript");
    const responseBox = document.getElementById("customer-voice-response");

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    let recognition = null;

    const messages = {
        "en-IN": {
            ready: "Assistant is ready.",
            listening: "Listening... Please speak.",
            unsupported: "Speech recognition is not supported in this browser.",
            error: "Could not recognize your voice. Please try again.",
            dashboard: "Taking you to the dashboard.",
            shop: "Opening the shop section.",
            vegetables: "Showing vegetables.",
            fruits: "Showing fruits.",
            grains: "Showing grains.",
            dairy: "Showing dairy products.",
            offers: "Opening special offers.",
            cart: "Opening your cart.",
            orders: "Opening your orders.",
            profile: "Opening your profile.",
            unknown: "Sorry, I could not understand that command."
        },
        "hi-IN": {
            ready: "सहायक तैयार है।",
            listening: "सुन रहा हूँ। कृपया बोलिए।",
            unsupported: "इस ब्राउज़र में वॉइस पहचान उपलब्ध नहीं है।",
            error: "आवाज़ समझ नहीं आई। कृपया दोबारा कोशिश करें।",
            dashboard: "डैशबोर्ड खोल रहा हूँ।",
            shop: "शॉप सेक्शन खोल रहा हूँ।",
            vegetables: "सब्ज़ियाँ दिखा रहा हूँ।",
            fruits: "फल दिखा रहा हूँ।",
            grains: "अनाज दिखा रहा हूँ।",
            dairy: "डेयरी उत्पाद दिखा रहा हूँ।",
            offers: "विशेष ऑफ़र खोल रहा हूँ।",
            cart: "आपकी कार्ट खोल रहा हूँ।",
            orders: "आपके ऑर्डर खोल रहा हूँ।",
            profile: "आपकी प्रोफ़ाइल खोल रहा हूँ।",
            unknown: "माफ़ कीजिए, मैं आपका निर्देश समझ नहीं पाया।"
        },
        "or-IN": {
            ready: "ସହାୟକ ପ୍ରସ୍ତୁତ ଅଛି।",
            listening: "ଶୁଣୁଛି। ଦୟାକରି କୁହନ୍ତୁ।",
            unsupported: "ଏହି ବ୍ରାଉଜରରେ ଭଏସ୍ ସୁବିଧା ଉପଲବ୍ଧ ନାହିଁ।",
            error: "ଆପଣଙ୍କ କଥା ବୁଝିପାରିଲି ନାହିଁ। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।",
            dashboard: "ଡ୍ୟାସବୋର୍ଡ ଖୋଲୁଛି।",
            shop: "ଦୋକାନ ବିଭାଗ ଖୋଲୁଛି।",
            vegetables: "ପନିପରିବା ଦେଖାଉଛି।",
            fruits: "ଫଳ ଦେଖାଉଛି।",
            grains: "ଶସ୍ୟ ଦେଖାଉଛି।",
            dairy: "ଦୁଗ୍ଧଜାତ ଦ୍ରବ୍ୟ ଦେଖାଉଛି।",
            offers: "ବିଶେଷ ଅଫର ଖୋଲୁଛି।",
            cart: "ଆପଣଙ୍କ କାର୍ଟ ଖୋଲୁଛି।",
            orders: "ଆପଣଙ୍କ ଅର୍ଡର ଖୋଲୁଛି।",
            profile: "ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ ଖୋଲୁଛି।",
            unknown: "ଦୁଃଖିତ, ଆପଣଙ୍କ ନିର୍ଦ୍ଦେଶ ବୁଝିପାରିଲି ନାହିଁ।"
        }
    };

    function normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[.,!?।]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function speak(message) {
        if (!("speechSynthesis" in window)) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = languageSelect.value;
        utterance.rate = 0.9;

        window.speechSynthesis.speak(utterance);
    }

    function respond(key) {
        const message = messages[languageSelect.value][key];

        responseBox.textContent = message;
        speak(message);
    }

    function goToSection(id, messageKey) {
        const section = document.getElementById(id);

        if (section) {
            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            respond(messageKey);
        } else {
            respond("unknown");
        }
    }

    function processCommand(command) {
        const text = normalizeText(command);

        transcriptBox.textContent = "You said: " + command;

        // Dashboard / Home
        if (
            text.includes("dashboard") ||
            text.includes("home") ||
            text.includes("डैशबोर्ड") ||
            text.includes("होम") ||
            text.includes("ଡ୍ୟାସବୋର୍ଡ") ||
            text.includes("ହୋମ")
        ) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            respond("dashboard");
        }

        // Shop
        else if (
            text.includes("shop") ||
            text.includes("शॉप") ||
            text.includes("दुकान") ||
            text.includes("ଦୋକାନ")
        ) {
            goToSection("shop", "shop");
        }

        // Vegetables
        else if (
            text.includes("vegetable") ||
            text.includes("सब्ज़ी") ||
            text.includes("सब्जी") ||
            text.includes("ପନିପରିବା")
        ) {
            goToSection("vegetables", "vegetables");
        }

        // Fruits
        else if (
            text.includes("fruit") ||
            text.includes("फल") ||
            text.includes("ଫଳ")
        ) {
            goToSection("fruits", "fruits");
        }

        // Grains
        else if (
            text.includes("grain") ||
            text.includes("अनाज") ||
            text.includes("ଶସ୍ୟ")
        ) {
            goToSection("grains", "grains");
        }

        // Dairy
        else if (
            text.includes("dairy") ||
            text.includes("दूध") ||
            text.includes("डेयरी") ||
            text.includes("ଦୁଗ୍ଧ") ||
            text.includes("ଡେରି")
        ) {
            goToSection("dairy", "dairy");
        }

        // Special Offers
        else if (
            text.includes("offer") ||
            text.includes("deal") ||
            text.includes("ऑफर") ||
            text.includes("ऑफ़र") ||
            text.includes("ଅଫର")
        ) {
            goToSection("offers", "offers");
        }

        // My Cart
        else if (
            text.includes("my cart") ||
            text.includes("cart") ||
            text.includes("कार्ट") ||
            text.includes("କାର୍ଟ")
        ) {
            respond("cart");
            window.location.href = "cart.html";
        }

        // My Orders
        else if (
            text.includes("my orders") ||
            text.includes("orders") ||
            text.includes("order") ||
            text.includes("ऑर्डर") ||
            text.includes("ଅର୍ଡର")
        ) {
            respond("orders");
            window.location.href = "my_orders.html";
        }

        // My Profile
        else if (
            text.includes("my profile") ||
            text.includes("profile") ||
            text.includes("प्रोफाइल") ||
            text.includes("प्रोफ़ाइल") ||
            text.includes("ପ୍ରୋଫାଇଲ")
        ) {
            goToSection("profile", "profile");
        }

        else {
            respond("unknown");
        }
    }

    toggleButton.addEventListener("click", function () {
        panel.classList.toggle("open");
    });

    closeButton.addEventListener("click", function () {
        panel.classList.remove("open");

        if (recognition) {
            recognition.stop();
        }

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    });

    languageSelect.addEventListener("change", function () {
        statusBox.textContent = messages[languageSelect.value].ready;
    });

    startButton.addEventListener("click", function () {

        if (!SpeechRecognition) {
            statusBox.textContent = messages[languageSelect.value].unsupported;
            return;
        }

        recognition = new SpeechRecognition();

        recognition.lang = languageSelect.value;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = function () {
            statusBox.textContent = messages[languageSelect.value].listening;
            transcriptBox.textContent = "Listening...";
        };

        recognition.onresult = function (event) {
            const command = event.results[0][0].transcript;
            processCommand(command);
        };

        recognition.onerror = function () {
            statusBox.textContent = messages[languageSelect.value].error;
        };

        recognition.onend = function () {
            if (statusBox.textContent === messages[languageSelect.value].listening) {
                statusBox.textContent = messages[languageSelect.value].ready;
            }
        };

        try {
            recognition.start();
        } catch (error) {
            statusBox.textContent = messages[languageSelect.value].error;
        }
    });

});
