import {
  auth,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  collection,
  getDocs,
} from "./firebase-config.js";

async function checkAdminRole(user) {
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);
  return userDocSnap.exists() && userDocSnap.data().role === "admin";
}

async function getStudentData() {
  const studentRef = collection(db, "students");
  const snapshot = await getDocs(studentRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      name: data.name || "",
      contact: data.contact || "",
      applicationNumber: data.applicationNumber || "",
      remarks: data.remarks || "",
      submittedBy: data.submittedBy || "",
      lastUpdatedBy: data.lastUpdatedBy || "",
      timestamp: data.timestamp?.toDate().toISOString() || "",
      lastUpdatedTime: data.lastUpdatedTime?.toDate().toISOString() || "",
      commerce_option: parseInt(data.pvhssOptionCommerce) || 0,
      science_option: parseInt(data.pvhssOptionScience) || 0,
    };
  });
}

async function sendToFlask(students) {
  const response = await fetch(
    "https://admissiondataanalysis-989444157242.us-central1.run.app/analyze", // ✅ Replace if needed
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(students),
    }
  );
  return await response.json(); // Expected: { insights: [...] }
}

function displayAnalysis(results) {
  const container = document.getElementById("insights-container");
  container.innerHTML = "";

  results.insights.forEach((item) => {
    const col = document.createElement("div");
    col.className = "col-md-6";

    const card = document.createElement("div");
    card.className = "card shadow-sm border-0 h-100";

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = item.title;

    const desc = document.createElement("p");
    desc.className = "card-text";
    desc.innerHTML = item.description.replace(/\n/g, "<br>");

    body.appendChild(title);
    body.appendChild(desc);
    card.appendChild(body);
    col.appendChild(card);
    container.appendChild(col);
  });
}

function showAccessDenied() {
  const container = document.getElementById("insights-container");
  container.innerHTML = `
    <div class="alert alert-danger text-center" role="alert">
      ❌ Access Denied: Admins Only
    </div>`;
}

async function runAnalysisFlow() {
  try {
    const students = await getStudentData();
    const results = await sendToFlask(students);
    displayAnalysis(results);
  } catch (error) {
    console.error("Error running analysis:", error);
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const isAdmin = await checkAdminRole(user);
    if (isAdmin) {
      runAnalysisFlow();
    } else {
      showAccessDenied();
    }
  } else {
    window.location.href = "login.html";
  }
});
