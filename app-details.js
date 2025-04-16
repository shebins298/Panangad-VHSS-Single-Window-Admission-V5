import {
  auth,
  db,
  collection,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  onAuthStateChanged,
  query,
  orderBy,
  serverTimestamp,
} from "./firebase-config.js";

const appDetailsContainer = document.getElementById("app-details-container");
const backButton = document.getElementById("back-button");

let currentUser;

// ✅ Check if the user is logged in and authorized
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (
      userDoc.exists() &&
      (userDoc.data().role === "admin" || userDoc.data().role === "normal")
    ) {
      loadAllStudents(); // Load all student details
    } else {
      alert("Access Denied! Only authorized users can access this page.");
      window.location.href = "index.html"; // Redirect unauthorized users
    }
  } else {
    alert("Please log in first.");
    window.location.href = "index.html"; // Redirect if not logged in
  }
});

// ✅ Fetch and display all students in a table (latest data first)
async function loadAllStudents() {
  const studentsCollection = collection(db, "students");

  // 🔥 Order students by timestamp (latest first)
  const studentsQuery = query(studentsCollection, orderBy("timestamp", "desc"));
  const studentsSnapshot = await getDocs(studentsQuery);

  if (studentsSnapshot.empty) {
    appDetailsContainer.innerHTML = "<p>No student data found.</p>";
    return;
  }

  let tableHTML = `
            <table class="students-table">
              <thead>
                <tr>
                  <th>Entered By</th>
                  <th>Timestamp</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Application No.</th>
                  <th>Science Option</th>
                  <th>Commerce Option</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
          `;

  studentsSnapshot.forEach((doc) => {
    const data = doc.data();
    const studentId = doc.id;

    const timestamp = data.timestamp
      ? new Date(data.timestamp.toDate()).toLocaleString()
      : "N/A";

    const lastUpdatedTime = data.lastUpdatedTime
      ? new Date(data.lastUpdatedTime.toDate()).toLocaleString()
      : "Not updated";

    tableHTML += `
              <tr>
                <td>${data.submittedBy || data.email}</td>
                <td>${timestamp}</td>
                <td>${data.name}</td>
                <td>${data.contact}</td>
                <td><input type="text" id="application-number-${studentId}" value="${
      data.applicationNumber || ""
    }"></td>
                <td><input type="text" id="option-science-${studentId}" value="${
      data.pvhssOptionScience || ""
    }"></td>
                <td><input type="text" id="option-commerce-${studentId}" value="${
      data.pvhssOptionCommerce || ""
    }"></td>
                <td><textarea id="remarks-${studentId}">${
      data.remarks || ""
    }</textarea></td>
                <td>
                  <button class="update-student" data-id="${studentId}">Update</button>
                  <div class="last-updated">
                    <small><strong>Last updated by:</strong> ${
                      data.lastUpdatedBy || "N/A"
                    }</small><br>
                    <small><strong>Updated at:</strong> ${lastUpdatedTime}</small>
                  </div>
                </td>
              </tr>
            `;
  });

  tableHTML += `</tbody></table>`;
  appDetailsContainer.innerHTML = tableHTML; // Insert table in container

  // ✅ Attach event listeners to update buttons
  document.querySelectorAll(".update-student").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const studentId = event.target.getAttribute("data-id");
      await updateStudentData(studentId);
    });
  });
}

// ✅ Update student data in Firebase
async function updateStudentData(studentId) {
  const studentRef = doc(db, "students", studentId);
  const updatedData = {
    applicationNumber: document.getElementById(
      `application-number-${studentId}`
    ).value,
    pvhssOptionScience: document.getElementById(`option-science-${studentId}`)
      .value,
    pvhssOptionCommerce: document.getElementById(`option-commerce-${studentId}`)
      .value,
    remarks: document.getElementById(`remarks-${studentId}`).value,
    lastUpdatedBy: currentUser.email, // ✅ Save logged-in user's email
    lastUpdatedTime: serverTimestamp(), // ✅ Save timestamp
  };

  try {
    await updateDoc(studentRef, updatedData);
    alert(`Student Data updated successfully!`);
    loadAllStudents(); // ✅ Refresh the data after update
  } catch (error) {
    console.error("Error updating document:", error);
    alert(`Failed to update data for Student ID ${studentId}.`);
  }
}

// ✅ Back button functionality
backButton.addEventListener("click", () => {
  history.back(); // Moves back without reloading
});
