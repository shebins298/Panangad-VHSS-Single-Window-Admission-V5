import {
  auth,
  db,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  doc,
  getDoc,
  setDoc,
} from "./firebase-config.js";

const googleLoginButton = document.getElementById("googleLogin");
const loginContainer = document.getElementById("login-container");
const indexLoginContainer = document.getElementById("indexLoginLoading");

const googleLogin = async () => {
  googleLoginButton.disabled = true; // Disable button during login to prevent multiple clicks
  const provider = new GoogleAuthProvider();

  //Hides the Lgin Container to prevent flicker
  loginContainer.style.display = "none";
  //show the loading message in index page
  indexLoginContainer.style.display = "block";

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Save the user's Gmail ID to the user document
      await setDoc(userRef, { email: user.email }, { merge: true });

      //show login again
      loginContainer.style.display = "block"; // Makes it visible again

      alert("Login request sent to admin. Please wait for approval.");
      await signOut(auth);
      return;
    }

    const userData = userDoc.data();

    // If the admin hasn't assigned a role yet, deny access
    if (!userData.role) {
      //show login again
      loginContainer.style.display = "block"; // Makes it visible again
      alert("Your account is not approved yet. Please contact the admin.");
      await signOut(auth);
      return;
    }

    // Redirect user based on role
    window.location.href =
      userData.role === "admin" ? "admin.html" : "user.html";
  } catch (error) {
    //show login again
    loginContainer.style.display = "block"; // Makes it visible again
    console.error("Login Error:", error);
    alert("Login failed. Please try again.");
  } finally {
    googleLoginButton.disabled = false; // Re-enable button after login attempt
  }
};

googleLoginButton.addEventListener("click", googleLogin);
