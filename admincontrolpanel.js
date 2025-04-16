import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  getDoc,
} from "./firebase-config.js";

const viewStudentsBtn = document.getElementById("view-students");
const editStudentsBtn = document.getElementById("edit-students");
const exportStudentsBtn = document.getElementById("export-students");
const applicationStatusBtn = document.getElementById("data-analysis");
const DataAnalysis2Btn = document.getElementById("data-analysis2");
const backButton = document.getElementById("back-button");
const welcomeMessage = document.getElementById("welcome-message");

// ✅ Check authentication & admin access
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().role === "admin") {
      welcomeMessage.textContent = `Welcome, Admin ${
        user.displayName || "User"
      }`;
    } else {
      alert("Access Denied! Only admins can access this page.");
      window.location.href = "index.html"; // Redirect unauthorized users
    }
  } else {
    alert("Please log in first.");
    window.location.href = "index.html"; // Redirect if not logged in
  }
});

// ✅ Button Click Event Listeners
viewStudentsBtn.addEventListener("click", () => {
  window.location.href = "view-students.html";
});

editStudentsBtn.addEventListener("click", () => {
  window.location.href = "edit-students.html";
});

exportStudentsBtn.addEventListener("click", () => {
  window.location.href = "export-students.html";
});

applicationStatusBtn.addEventListener("click", () => {
  window.location.href = "data-analysis.html";
});

DataAnalysis2Btn.addEventListener("click", () => {
  window.location.href = "data-analysis2.html";
});

backButton.addEventListener("click", () => {
  window.location.href = "admin.html";
});
