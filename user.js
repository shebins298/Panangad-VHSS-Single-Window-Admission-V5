import { auth, db, doc, getDoc, signOut } from "./firebase-config.js";

const userContent = document.getElementById("user-content");
const loadingMessage = document.getElementById("loading");

const checkUserAccess = async () => {
  userContent.style.display = "none"; // Hide content initially
  loadingMessage.style.display = "block"; // Show loading

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      alert("Access Denied. Redirecting...");
      window.location.href = "index.html";
      return;
    }

    const role = userDoc.data().role;
    if (role !== "admin" && role !== "normal") {
      alert("Login approval pending.");
      window.location.href = "index.html";
      return;
    }

    // Show content once user role is confirmed
    loadingMessage.style.display = "none";
    userContent.style.display = "block";
  });
};

document.getElementById("logout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

checkUserAccess();
