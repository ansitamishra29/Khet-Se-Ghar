
/* =====================================
   KHET SE GHAR - SIGNUP
===================================== */

const signupForm = document.querySelector("form");

if (signupForm) {

    signupForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const submitButton = signupForm.querySelector(
            'button[type="submit"]'
        );

        const formData = new FormData(signupForm);

        const role = formData.get("role");
        const serviceArea = formData.get("service_area");

        // VALIDATE LOCAL PARTNER
        if (role === "local_partner" && !serviceArea) {
            alert("Please select your service area.");
            return;
        }

        // VALIDATE BUSINESS
        if (role === "business") {

            const businessName = formData.get("business_name")?.trim();
            const businessType = formData.get("business_type");
            const address = formData.get("address")?.trim();

            if (!businessName) {
                alert("Please enter your business name.");
                return;
            }

            if (!businessType) {
                alert("Please select your business type.");
                return;
            }

            if (!address) {
                alert("Please enter your business address.");
                return;
            }
        }

        submitButton.disabled = true;
        submitButton.textContent = "Creating Account...";

        try {

            const response = await fetch("/signup", {
                method: "POST",
                body: new URLSearchParams(formData)
            });

            const result = await response.json();

            alert(result.message);

            if (response.ok) {
                window.location.href = "login.html";
            } else {
                submitButton.disabled = false;
                submitButton.textContent = "Create Account";
            }

        } catch (error) {

            alert("Unable to connect to the server. Please try again.");

            console.error("Signup Error:", error);

            submitButton.disabled = false;
            submitButton.textContent = "Create Account";

        }

    });

}
