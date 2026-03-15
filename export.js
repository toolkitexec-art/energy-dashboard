/* ===== HELIXON PDF EXPORT (RAPI + PROFESSIONAL ESG) ===== */

async function loadPDFLibrary() {
  return new Promise((resolve) => {
    if (window.html2pdf) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

async function exportPDF() {
  await loadPDFLibrary();

  const container = document.createElement("div");

  // ===== Halaman 1: KPI + Analytics Grid =====
  const page1 = document.createElement("div");
  page1.classList.add("page");
  page1.style.padding = "20px";

  const kpi = document.getElementById("kpi-container");
  const analytics = document.querySelector(".analytics-grid");

  if (kpi) page1.appendChild(kpi.cloneNode(true));
  if (analytics) page1.appendChild(analytics.cloneNode(true));

  container.appendChild(page1);

  // ===== Halaman 2: Emission Trend + Facility Comparison =====
  [
    ["trendChart", "Emission Trend"],
    ["facilityChart", "Facility Comparison"]
  ].forEach(([chartId, title]) => {
    const page = document.createElement("div");
    page.classList.add("page");
    page.style.padding = "20px";

    const h3 = document.createElement("h3");
    h3.innerText = title;
    h3.style.marginTop = "0";
    h3.style.marginBottom = "15px";
    page.appendChild(h3);

    const chartEl = document.getElementById(chartId);
    if (chartEl) page.appendChild(chartEl.cloneNode(true));

    container.appendChild(page);
  });

  // ===== PDF Options =====
  const options = {
    margin: 0.4,
    filename: "helixon-energy-report.pdf",
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 3, useCORS: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] }
  };

  html2pdf().set(options).from(container).save();
}
