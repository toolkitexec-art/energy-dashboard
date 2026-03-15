async function exportPDF() {
  // pastikan library html2pdf sudah load
  if (!window.html2pdf) {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    document.body.appendChild(script);
    await new Promise(r => script.onload = r);
  }

  // buat container sementara untuk PDF
  const container = document.createElement("div");

  // KPI - halaman 1
  const kpiPage = document.createElement("div");
  kpiPage.classList.add("page");
  kpiPage.appendChild(document.getElementById("kpi-container").cloneNode(true));
  container.appendChild(kpiPage);

  // Analytics Grid - halaman 1
  const analyticsPage = document.createElement("div");
  analyticsPage.classList.add("page");
  analyticsPage.appendChild(document.querySelector(".analytics-grid").cloneNode(true));
  container.appendChild(analyticsPage);

  // Energy Type Chart - halaman 2
  const energyPage = document.createElement("div");
  energyPage.classList.add("page");
  const energyTitle = document.createElement("h3");
  energyTitle.innerText = "Energy Type Comparison";
  energyPage.appendChild(energyTitle);
  energyPage.appendChild(document.getElementById("stackedChart").cloneNode(true));
  container.appendChild(energyPage);

  // Emission Trend + Facility Comparison - halaman 3
  const trendPage = document.createElement("div");
  trendPage.classList.add("page");

  const trendTitle = document.createElement("h3");
  trendTitle.innerText = "Emission Trend";
  trendPage.appendChild(trendTitle);
  trendPage.appendChild(document.getElementById("trendChart").cloneNode(true));

  const facilityTitle = document.createElement("h3");
  facilityTitle.innerText = "Facility Comparison";
  trendPage.appendChild(facilityTitle);
  trendPage.appendChild(document.getElementById("facilityChart").cloneNode(true));

  container.appendChild(trendPage);

  // opsi html2pdf
  const opt = {
    margin: 0.3,
    filename: "helixon-energy-report.pdf",
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(opt).from(container).save();
}
