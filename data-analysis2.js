
import {
  auth,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  collection,
  getDocs,
} from "./firebase-config.js";

const emailColorMap = {};
function getColorForEmail(email) {
  if (!emailColorMap[email]) {
    const hue = Object.keys(emailColorMap).length * 47 % 360;
    emailColorMap[email] = `hsl(${hue}, 70%, 60%)`;
  }
  return emailColorMap[email];
}

function createChartHeading(text) {
  const heading = document.createElement("h3");
  heading.className = "chart-heading";
  heading.innerText = text;
  return heading;
}

function createBarChart(container, labels, data, title, getColor = null) {
  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-section";
  chartContainer.appendChild(createChartHeading(title));

  const canvas = document.createElement("canvas");
  chartContainer.appendChild(canvas);
  container.appendChild(chartContainer);

  new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        backgroundColor: getColor ? labels.map(getColor) : "#ccc",
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
    }
  });
}

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
      submittedBy: data.submittedBy || "Unknown",
      lastUpdatedBy: data.lastUpdatedBy || "Unknown",
      timestamp: data.timestamp?.toDate() || new Date(),
      lastUpdatedTime: data.lastUpdatedTime?.toDate() || new Date(),
      commerce_option: parseInt(data.pvhssOptionCommerce) || 0,
      science_option: parseInt(data.pvhssOptionScience) || 0,
    };
  });
}

function analyzeAndRender(students) {
  const container = document.getElementById("analysis-results");
  container.innerHTML = "";

  const totalApplications = students.length;
  const avgScience = students.reduce((sum, s) => sum + s.science_option, 0) / totalApplications;
  const avgCommerce = students.reduce((sum, s) => sum + s.commerce_option, 0) / totalApplications;

  const sciencePrefCount = students.filter(s => s.science_option > 0).length;
  const commercePrefCount = students.filter(s => s.commerce_option > 0).length;
  const scienceRank1 = students.filter(s => s.science_option === 1).length;
  const commerceRank1 = students.filter(s => s.commerce_option === 1).length;

  const submittedByCount = {};
  const updatedByCount = {};
  const dailyCount = {};
  const hourlyCount = new Array(24).fill(0);

  students.forEach(s => {
    submittedByCount[s.submittedBy] = (submittedByCount[s.submittedBy] || 0) + 1;
    updatedByCount[s.lastUpdatedBy] = (updatedByCount[s.lastUpdatedBy] || 0) + 1;

    const day = s.timestamp.toISOString().split("T")[0];
    dailyCount[day] = (dailyCount[day] || 0) + 1;

    const hour = s.timestamp.getHours();
    hourlyCount[hour]++;
  });

  createBarChart(container, ["Science", "Commerce"], [sciencePrefCount, commercePrefCount], "Preference Count", (label) => {
    return label === "Science" ? "#4CAF50" : "#2196F3";
  });

  createBarChart(container, ["Science", "Commerce"], [scienceRank1, commerceRank1], "Rank 1 Preferences", (label) => {
    return label === "Science" ? "#4CAF50" : "#2196F3";
  });

  const submitters = Object.keys(submittedByCount);
  const submitterCounts = submitters.map(s => submittedByCount[s]);
  createBarChart(container, submitters, submitterCounts, "Applications Submitted By", getColorForEmail);

  const updaters = Object.keys(updatedByCount);
  const updaterCounts = updaters.map(s => updatedByCount[s]);
  createBarChart(container, updaters, updaterCounts, "Applications Updated By", getColorForEmail);

  const dailyDates = Object.keys(dailyCount).sort();
  const dailyApplications = dailyDates.map(date => dailyCount[date]);
  createBarChart(container, dailyDates, dailyApplications, "Applications Per Day");

  const hourLabels = hourlyCount.map((_, i) => `${i}:00`);
  createBarChart(container, hourLabels, hourlyCount, "Hourly Submission Trend");
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const isAdmin = await checkAdminRole(user);
    if (isAdmin) {
      const students = await getStudentData();
      analyzeAndRender(students);
    } else {
      document.getElementById("analysis-results").innerHTML = "<h2 style='color:red;'>Access Denied</h2>";
    }
  } else {
    window.location.href = "login.html";
  }
});
