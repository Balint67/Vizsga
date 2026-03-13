// Import Firebase authentication and database instances
import { auth, db } from './firebase.js';

// Import Firebase Authentication function for user registration
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Import Firestore functions for saving user data
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Reference to the registration form
const registrationForm = document.getElementById('regForm');

// Password toggle elements
document.addEventListener('DOMContentLoaded', () => {
    // 1. Element Selection
    const registrationForm = document.getElementById('registrationForm');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('passwordagain');
    const errorMessage = document.getElementById('error-message');
    const toggleButtons = document.querySelectorAll('.toggle-password');

    // 2. PASSWORD VISIBILITY TOGGLE
    toggleButtons.forEach(button => {
        button.style.cursor = 'pointer';

        button.addEventListener('click', function() {
            // Find the input field relative to the clicked eye icon
            const inputField = this.parentElement.querySelector('input');

            if (inputField.type === 'password') {
                inputField.type = 'text';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                inputField.type = 'password';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // 3. REAL-TIME MATCH VALIDATION
    function validatePasswords() {
        const val1 = password.value;
        const val2 = confirmPassword.value;

        // Only show error if the second field is not empty
        if (val2.length > 0) {
            if (val1 !== val2) {
                confirmPassword.style.border = "2px solid #ff4d4d";
                errorMessage.textContent = "Passwords do not match!";
                errorMessage.style.display = "block";
            } else {
                confirmPassword.style.border = "2px solid #2ecc71";
                errorMessage.style.display = "none";
            }
        } else {
            confirmPassword.style.border = "";
            errorMessage.style.display = "none";
        }
    }

    // Attach listeners for every keystroke
    password.addEventListener('input', validatePasswords);
    confirmPassword.addEventListener('input', validatePasswords);

    // 4. PREVENT FORM SUBMISSION ON ERROR
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            if (password.value !== confirmPassword.value) {
                e.preventDefault(); // Stop form from sending
                alert("Please make sure your passwords match!");
            } else {
                console.log("Form validated! Proceeding to registration...");
            }
        });
    }
});


if (registrationForm) {
    registrationForm.addEventListener('submit', (e) => {
        if (password.value !== confirmPassword.value) {
            e.preventDefault(); // Stop form submission

            // Show error message if it was hidden
            if (errorMessage) {
                errorMessage.style.display = "block";
                errorMessage.style.color = "#e74c3c";
            }
            alert("Registration failed: Passwords must match!");
        } else {
            console.log("Success! Data is ready for Firebase.");
            // Add your Firebase Auth code here
        }
    });
}

if (registrationForm) {
    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Disable submit button to prevent multiple submissions
        const submitButton = registrationForm.querySelector('button');
        submitButton.disabled = true;
        submitButton.innerHTML = "Registration successful!";

        // Get form input values
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const fullName = document.getElementById('fullname').value;
        const phoneNumber = document.getElementById('phone').value;

        try {
            // Create user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save additional user data to Firestore
            await setDoc(doc(db, "users", user.uid), {
                fullname: fullName,
                phone: phoneNumber,
                email: email,
                createdAt: new Date()
            });

            // Redirect to login page after successful registration
            window.location.replace("signIn.html");

        } catch (error) {
            console.error("Registration error:", error.code);

            // Re-enable submit button on error
            submitButton.disabled = false;
            submitButton.innerHTML = 'Registration <i class="fa-solid fa-arrow-right"></i>';

            // Handle common registration errors
            if (error.code === 'auth/email-already-in-use') {
                alert("This email address is already in use!");
            } else {
                alert("An error occurred: " + error.message);
            }
        }
    });
}
