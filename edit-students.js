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
  updateDoc,
  deleteDoc,
} from "./firebase-config.js";

const studentListTable = document.getElementById("student-list");
const backButton = document.getElementById("back-button");

// ✅ Ensure only admins can access
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Logged in user:", user.email);

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists() || userDoc.data().role !== "admin") {
      alert("Access Denied! Only admins can access this page.");
      window.location.href = "index.html";
      return;
    }

    loadStudentData();
  } else {
    alert("Please log in first.");
    window.location.href = "index.html";
  }
});

// ✅ Load Student Data with Debugging
async function loadStudentData() {
  try {
    console.log("Loading student data...");

    const studentsRef = collection(db, "students");
    const q = query(studentsRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);

    console.log("Query Snapshot size:", querySnapshot.size);

    if (querySnapshot.empty) {
      console.warn("No student data found.");
      studentListTable.innerHTML =
        "<tr><td colspan='8'>No students found.</td></tr>";
      return;
    }

    let serialNo = 1;
    studentListTable.innerHTML = ""; // Clear previous data

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const docId = docSnapshot.id;
      console.log("Student Data:", data);

      const row = document.createElement("tr");

      row.innerHTML = `
              <td>${serialNo++}</td>
              <td>${
                new Date(data.timestamp?.seconds * 1000).toLocaleString() ||
                "N/A"
              }</td>
              <td><input type="text" value="${
                data.name || ""
              }" data-field="name" data-id="${docId}"></td>
              <td><input type="text" value="${
                data.contact || ""
              }" data-field="contact" data-id="${docId}"></td>
              <td><input type="text" value="${
                data.applicationNumber || ""
              }" data-field="applicationNumber" data-id="${docId}"></td>
              <td><input type="text" value="${
                data.pvhssOptionScience || ""
              }" data-field="pvhssOptionScience" data-id="${docId}"></td>
              <td><input type="text" value="${
                data.pvhssOptionCommerce || ""
              }" data-field="pvhssOptionCommerce" data-id="${docId}"></td>
              <td><input type="text" value="${
                data.remarks || ""
              }" data-field="remarks" data-id="${docId}"></td>
              <td>
                  <button class="update-btn" data-id="${docId}">Update</button>
                  <button class="delete-btn" data-id="${docId}">Delete</button>
              </td>
          `;

      studentListTable.appendChild(row);
    });

    addEventListeners(); // Attach event listeners after rows are created
  } catch (error) {
    console.error("Error loading student data:", error);
    alert("Failed to load student list.");
  }
}

// ✅ Function to Update Student Data
async function updateStudent(studentId, field, value) {
  try {
    console.log(`Updating student ${studentId}: ${field} = ${value}`);

    const studentRef = doc(db, "students", studentId);
    await updateDoc(studentRef, { [field]: value });

    console.log("Student updated successfully.");
    alert("Student updated successfully.");
  } catch (error) {
    console.error("Error updating student:", error);
    alert("Failed to update student.");
  }
}

// ✅ Function to Delete Student Data
async function deleteStudent(studentId) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  try {
    console.log("Deleting student:", studentId);

    const studentRef = doc(db, "students", studentId);
    await deleteDoc(studentRef);

    console.log("Student deleted successfully.");
    alert("Student deleted successfully.");
    loadStudentData(); // Reload data after deletion
  } catch (error) {
    console.error("Error deleting student:", error);
    alert("Failed to delete student.");
  }
}

// ✅ Add Event Listeners for Update & Delete Buttons
function addEventListeners() {
  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", (event) => {
      const studentId = event.target.dataset.id;
      const field = event.target.dataset.field;
      const value = event.target.value;

      updateStudent(studentId, field, value);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const studentId = event.target.dataset.id;
      deleteStudent(studentId);
    });
  });
}

// ✅ Back Button
backButton.addEventListener("click", () => {
  history.back();
});
