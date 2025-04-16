import {
  auth,
  db,
  onAuthStateChanged,
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  getDoc,
} from "./firebase-config.js";

const studentListTable = document.getElementById("student-list");
const backButton = document.getElementById("back-button");

// ✅ Ensure only admins can access
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists() || userDoc.data().role !== "admin") {
      alert("Access Denied! Only admins can access this page.");
      window.location.href = "index.html"; // Redirect unauthorized users
      return;
    }

    loadStudentData();
  } else {
    alert("Please log in first.");
    window.location.href = "index.html"; // Redirect if not logged in
  }
});

// ✅ Load Student Data Ordered by Timestamp
async function loadStudentData() {
  try {
    const studentsRef = collection(db, "students");
    const q = query(studentsRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);

    let serialNo = 1;
    studentListTable.innerHTML = ""; // Clear previous data

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = `
              <tr>
                  <td>${serialNo++}</td>
                  <td>${
                    new Date(data.timestamp?.seconds * 1000).toLocaleString() ||
                    "N/A"
                  }</td>
                  <td>${data.name || "N/A"}</td>
                  <td>${data.contact || "N/A"}</td>
                  <td>${data.applicationNumber || "N/A"}</td>
                  <td>${data.pvhssOptionScience || "N/A"}</td>
                  <td>${data.pvhssOptionCommerce || "N/A"}</td>
                  <td>${data.remarks || "N/A"}</td>
              </tr>
          `;
      studentListTable.innerHTML += row;
    });
  } catch (error) {
    console.error("Error loading student data:", error);
    alert("Failed to load student list.");
  }
}

// ✅ Back Button
backButton.addEventListener("click", () => {
  history.back(); // Go back to the previous page
});
