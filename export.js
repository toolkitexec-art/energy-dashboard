/* ===== HELIXON PDF EXPORT PROFESSIONAL ===== */

async function exportPDF() {
  if (!window.html2pdf) {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    await new Promise(res => { script.onload = res; document.body.appendChild(script); });
  }

  // Buat container utama PDF
  const container = document.createElement("div");

  // ================= PAGES =================

  const kpiPage = document.createElement("div");
  kpiPage.className = "page";
  kpiPage.appendChild(document.getElementById("kpi-container").cloneNode(true));
  container.appendChild(kpiPage);

  const analyticsPage = document.createElement("div");
  analyticsPage.className = "page";
  analyticsPage.appendChild(document.querySelector(".analytics-grid").cloneNode(true));
  container.appendChild(analyticsPage);

  const energyPage = document.createElement("div");
  energyPage.className = "page";
  energyPage.appendChild(document.getElementById("energy-total").cloneNode(true));
  energyPage.appendChild(document.getElementById("stackedChart").cloneNode(true));
  container.appendChild(energyPage);

  const trendPage = document.createElement("div");
  trendPage.className = "page";
  trendPage.appendChild(document.getElementById("trendChart").cloneNode(true));
  container.appendChild(trendPage);

  const facilityPage = document.createElement("div");
  facilityPage.className = "page";
  facilityPage.appendChild(document.getElementById("facilityChart").cloneNode(true));
  container.appendChild(facilityPage);

  // ================= PDF OPTIONS =================

  const opt = {
    margin: [0.4, 0.4, 0.4, 0.4], // top, left, bottom, right in inches
    filename: "helixon-energy-report.pdf",
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 3, useCORS: true }, // high res grafik
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(opt).from(container).save();
}

// Bind tombol export pojok kanan
const exportBtn = document.createElement("button");
exportBtn.innerText = "Export PDF";
exportBtn.style.position = "fixed";
exportBtn.style.top = "30px";
exportBtn.style.right = "40px";
exportBtn.style.padding = "10px 16px";
exportBtn.style.borderRadius = "10px";
exportBtn.style.border = "1px solid #334155";
exportBtn.style.background = "linear-gradient(135deg,#3b82f6,#1e3a8a)";
exportBtn.style.color = "white";
exportBtn.style.fontWeight = "600";
exportBtn.style.cursor = "pointer";
exportBtn.style.zIndex = "999";
exportBtn.onclick = exportPDF;
document.body.appendChild(exportBtn);
