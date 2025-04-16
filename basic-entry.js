import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const studentForm = document.getElementById("student-form");
const backButton = document.getElementById("back-button");

let currentUser = null; // Store logged-in user details

// Check user authentication status
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user; // Store the logged-in user's info
  } else {
    alert("You must be logged in to access this page.");
    window.location.href = "index.html"; // Redirect to login if not authenticated
  }
});

// Handle form submission
studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("User not authenticated!");
    return;
  }

  const studentName = document.getElementById("student-name").value.trim();
  const contactNumber = document.getElementById("contact-number").value.trim();

  if (studentName === "" || contactNumber === "") {
    alert("Please fill in all fields.");
    return;
  }

  try {
    await addDoc(collection(db, "students"), {
      name: studentName,
      contact: contactNumber,
      submittedBy: currentUser.email, // Save the email of the logged-in user
      timestamp: serverTimestamp(), // Auto-generate timestamp
    });

    alert("Student details submitted successfully!");
    studentForm.reset(); // Clear form fields
  } catch (error) {
    console.error("Error submitting student details:", error);
    alert("Failed to submit. Please try again.");
  }
});

// Back button functionality
backButton.addEventListener("click", () => {
  window.history.back(); // Navigate back to the previous page
});
