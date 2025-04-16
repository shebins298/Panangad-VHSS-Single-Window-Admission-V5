document.getElementById("googleLogin").addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;

    const userRef = db.collection("users").doc(user.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({ role: "pending" });
      alert("Login request sent to admin. Please wait for approval.");
      auth.signOut();
      return;
    }

    const role = doc.data().role;
    if (role === "pending") {
      alert("Login approval pending.");
      auth.signOut();
    } else if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "user.html";
    }
  } catch (error) {
    console.error("Login Error:", error.message);
  }
});
