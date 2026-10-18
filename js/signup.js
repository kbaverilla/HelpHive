import { supabase } from "./supabaseconfig.js";
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("signup-form");

    const fullname = document.getElementById("fullname");
    const accountType = document.getElementById("account-type");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");

    const successAlert = document.getElementById("success-alert");
    const successMessage = document.getElementById("success-message");

    const errorAlert = document.getElementById("error-alert");
    const errorMessage = document.getElementById("error-message");

    const submitBtn = document.getElementById("submit-btn");
    const btnText = document.getElementById("btn-text");
    const spinner = document.getElementById("spinner");

    function showError(message) {
        errorMessage.textContent = message;
        errorAlert.classList.remove("hidden");
        successAlert.classList.add("hidden");
    }
    function showSuccess(message) {
        successMessage.textContent = message;
        successAlert.classList.remove("hidden");
        errorAlert.classList.add("hidden");
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        successAlert.classList.add("hidden");
        errorAlert.classList.add("hidden");

        const name = fullname.value.trim();
        const type = accountType.value;
        const userEmail = email.value.trim();
        const userPassword = password.value;
        const confirm = confirmPassword.value;

        // VALIDATION
        if (name === "") {
            showError("Please enter your full name.");
            return;
        }
        if (userEmail === "") {
            showError("Please enter your email address.");
            return;
        }
        if (userPassword.length < 6) {
            showError("Password must be at least 6 characters.");
            return;
        }
        if (userPassword !== confirm) {
            showError("Passwords do not match.");
            return;
        }
        // DISABLE BUTTON
        submitBtn.disabled = true;
        btnText.textContent = "Creating Account...";
        spinner.classList.remove("hidden");

        // SIGN UP
        try {
            console.log("SIGNUP BUTTON WORKED");
            console.log("Attempting signup for:", userEmail);
            const { data, error } =
                await supabase.auth.signUp({
                    email: userEmail,
                    password: userPassword,
                    options: {
                        data: {
                            full_name: name,
                            account_type: type
                        },
                        emailRedirectTo:
                            "https://helphives.netlify.app/login"
                    }
                });

            // SUPABASE ERROR
            if (error) {
                console.error(
                    "SUPABASE SIGNUP ERROR:",
                    error
                );
                console.error(
                    "MESSAGE:",
                    error.message
                );
                console.error(
                    "CODE:",
                    error.code
                );
                showError(
                    error.message ||
                    "Registration failed."
                );
                return;
            }

            // SUCCESS
            console.log(
                "REGISTRATION DATA:",
                data
            );
            console.log(
                "USER:",
                data.user
            );
            console.log(
                "SESSION:",
                data.session
            );
            // EMAIL CONFIRMATION OFF
            if (data.session) {
                showSuccess(
                    "Registration successful! Redirecting..."
                );
                setTimeout(function () {
                    window.location.href =
                        "../index.html";
                }, 1500);
            }
            // EMAIL CONFIRMATION ON
            else {
                showSuccess(
                    "Registration successful! Please check your email to verify your account."
                );
                form.reset();
            }
        } catch (error) {
            console.error(
                "REGISTRATION ERROR:",
                error
            );
            console.error(
                "ERROR MESSAGE:",
                error.message
            );
            showError(
                error.message ||
                "Registration failed. Please try again."
            );
        } finally {
            submitBtn.disabled = false;
            btnText.textContent = "Sign Up";
            spinner.classList.add("hidden");
        }
    });

    // PASSWORD TOGGLE
    const togglePassword =
        document.getElementById("toggle-password");

    if (togglePassword) {
        togglePassword.addEventListener(
            "click",
            function () {
                const icon =
                    document.getElementById("eye-icon");

                if (password.type === "password") {
                    password.type = "text";
                    icon.classList.remove("fa-eye");
                    icon.classList.add("fa-eye-slash");
                } else {
                    password.type = "password";
                    icon.classList.remove("fa-eye-slash");
                    icon.classList.add("fa-eye");
                }
            }
        );
    }

    // CONFIRM PASSWORD TOGGLE
    const toggleConfirmPassword =
        document.getElementById(
            "toggle-confirm-password"
        );
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener(
            "click",
            function () {
                const icon =
                    document.getElementById(
                        "confirm-eye-icon"
                    );

                if (
                    confirmPassword.type === "password"
                ) {
                    confirmPassword.type = "text";
                    icon.classList.remove("fa-eye");
                    icon.classList.add("fa-eye-slash");
                } else {
                    confirmPassword.type = "password";
                    icon.classList.remove(
                        "fa-eye-slash"
                    );
                    icon.classList.add("fa-eye");
                }
            }
        );
    }
});