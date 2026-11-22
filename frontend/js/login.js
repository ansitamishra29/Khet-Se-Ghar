
document.addEventListener("DOMContentLoaded", function () {

    const form = document.querySelector("form");
    const emailInput = document.getElementById("email");
    const suggestionsBox = document.getElementById("account-suggestions");

    let accounts = [];

    // LOAD REGISTERED ACCOUNTS
    async function loadAccounts() {
        try {
            const response = await fetch("/login-accounts");
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            accounts = result.accounts || [];

        } catch (error) {
            console.error("Unable to load accounts:", error);
        }
    }

    // DISPLAY EMAIL SUGGESTIONS
    function showSuggestions() {

        suggestionsBox.innerHTML = "";

        const search = emailInput.value.toLowerCase().trim();
        if (!search) {
    suggestionsBox.style.display = "none";
    return;
}

        const filteredAccounts = accounts.filter(account =>
            account.email.toLowerCase().includes(search) ||
            account.full_name.toLowerCase().includes(search)
        );

        if (filteredAccounts.length === 0) {
            suggestionsBox.style.display = "none";
            return;
        }

        filteredAccounts.forEach(account => {

            const option = document.createElement("div");

            option.className = "account-suggestion";

            option.textContent =
                `${account.full_name} — ${account.email}`;

            option.addEventListener("click", function () {
                emailInput.value = account.email;
                suggestionsBox.style.display = "none";
            });

            suggestionsBox.appendChild(option);
        });

        suggestionsBox.style.display = "block";
    }

    emailInput.addEventListener("focus", showSuggestions);
    emailInput.addEventListener("input", showSuggestions);

    document.addEventListener("click", function (event) {
        if (
            !emailInput.contains(event.target) &&
            !suggestionsBox.contains(event.target)
        ) {
            suggestionsBox.style.display = "none";
        }
    });

    // LOGIN
    form.addEventListener("submit", async function(event) {

        event.preventDefault();

        const formData = new FormData(this);

        try {
            const response = await fetch("/login", {
                method: "POST",
                body: new URLSearchParams(formData)
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                window.location.href = result.redirect;
            } else {
                alert(result.message);
            }

        } catch (error) {
            alert("Unable to connect to the server. Please try again.");
            console.error(error);
        }
    });

    loadAccounts();

});
