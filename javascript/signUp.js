// Import Firebase authentication and database instances
import { auth, db } from './firebase.js';

// Import Firebase Authentication function for user registration
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Import Firestore functions for saving user data
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Reference to the registration form
const registrationForm = document.getElementById('regForm');

// Password toggle elements (make eye icon work on registration page)
const togglePasswordButton = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePasswordButton && passwordInput) {
    togglePasswordButton.addEventListener('click', () => {
        const isHidden = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isHidden ? 'text' : 'password');
        togglePasswordButton.classList.toggle('fa-eye');
        togglePasswordButton.classList.toggle('fa-eye-slash');
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
