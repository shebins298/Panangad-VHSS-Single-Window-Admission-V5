import { auth, db, doc, getDoc, signOut } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {
  const adminContent = document.getElementById("admin-content");
  const loadingMessage = document.getElementById("loading");

  if (!adminContent || !loadingMessage) {
    console.error("Admin content or loading message not found in the DOM.");
    return;
  }

  const checkAdminAccess = async () => {
    adminContent.style.display = "none";
    loadingMessage.style.display = "block";

    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = "index.html";
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists() || userDoc.data().role !== "admin") {
          alert("Access Denied. Redirecting...");
          window.location.href = "index.html";
          return;
        }

        // Show content after role confirmation
        loadingMessage.style.display = "none";
        adminContent.style.display = "block";
      } catch (error) {
        console.error("Error checking admin access:", error);
        alert("Error verifying your role. Try again.");
        window.location.href = "index.html";
      }
    });
  };

  // ✅ Updated Logout Function
  document.getElementById("logout")?.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out successfully.");
        window.location.href = "index.html"; // Redirect AFTER successful logout
      })
      .catch((error) => {
        console.error("Logout failed:", error);
        alert("Error logging out. Try again.");
      });
  });

  checkAdminAccess();
});
