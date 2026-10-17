import { supabase } from "./supabaseconfig.js";

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        console.error("ERROR: loginForm was not found.");
        return;
    }

    console.log("HelpHive login script loaded.");

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        console.log("LOGIN BUTTON CLICKED");

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        const emailError = document.getElementById("emailError");
        const passwordError = document.getElementById("passwordError");

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Clear previous errors
        emailError.textContent = "";
        passwordError.textContent = "";

        // =========================
        // VALIDATION
        // =========================

        if (!email) {
            emailError.textContent = "Please enter your email.";
            return;
        }

        if (!password) {
            passwordError.textContent = "Please enter your password.";
            return;
        }

        try {

            console.log("Attempting Supabase login...");

            // =========================
            // SUPABASE LOGIN
            // =========================

            const { data, error } =
                await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            // =========================
            // LOGIN ERROR
            // =========================

            if (error) {

                console.error("Supabase login error:", error);

                const errorText = error.message.toLowerCase();

                if (errorText.includes("invalid login credentials")) {

                    passwordError.textContent =
                        "Incorrect email or password.";

                } else if (errorText.includes("email not confirmed")) {

                    emailError.textContent =
                        "Please confirm your email before logging in.";

                } else {

                    passwordError.textContent =
                        error.message;
                }

                return;
            }

            // =========================
            // LOGIN SUCCESS
            // =========================

            console.log("LOGIN SUCCESSFUL!");
            console.log("User:", data.user);
            console.log("Session:", data.session);

            if (!data.user) {

                passwordError.textContent =
                    "Login failed. User account could not be found.";

                return;
            }

            const user = data.user;

            console.log("User ID:", user.id);
            console.log("Email:", user.email);
            console.log("User metadata:", user.user_metadata);

            // =========================
            // GET ACCOUNT TYPE
            // =========================
            
            const accountType =
                String(user.user_metadata?.account_type || "")
                    .trim()
                    .toLowerCase();
            
            console.log("=================================");
            console.log("FINAL ACCOUNT TYPE:", accountType);
            console.log("=================================");
            
            // =========================
            // STUDENT
            // =========================
            
            if (accountType === "student") {
            
                console.log("Student account detected.");
            
                window.location.href = "dashboard.html";
            
                return;
            }
            
            // =========================
            // PROPERTY OWNER
            // =========================
            
            else if (accountType === "property_owner") {

                console.log("Property owner account detected.");

                window.location.href = "dashowner.html";

                return;
            }
            
            // =========================
            // UNKNOWN ACCOUNT TYPE
            // =========================
            
            else {
            
                console.error(
                    "Account type not found or invalid:",
                    accountType
                );
            
                alert(
                    "Login successful, but your account type could not be identified."
                );
            
                return;
            }
        } catch (error) {

            console.error(
                "Unexpected login error:",
                error
            );

            passwordError.textContent =
                error.message ||
                "Login failed. Please try again.";
        }

    });


    // =========================
    // SHOW / HIDE PASSWORD
    // =========================

    const togglePassword =
        document.getElementById("togglePassword");

    const passwordInput =
        document.getElementById("password");

    if (togglePassword) {

        togglePassword.addEventListener("click", () => {

            if (passwordInput.type === "password") {

                passwordInput.type = "text";

                togglePassword.classList.remove(
                    "fa-eye"
                );

                togglePassword.classList.add(
                    "fa-eye-slash"
                );

            } else {

                passwordInput.type = "password";

                togglePassword.classList.remove(
                    "fa-eye-slash"
                );

                togglePassword.classList.add(
                    "fa-eye"
                );
            }

        });
    }

});
