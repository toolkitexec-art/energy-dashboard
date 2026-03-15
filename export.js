/* ===== HELIXON PDF EXPORT ADVANCED ===== */

async function loadPDFLibrary() {
  return new Promise((resolve) => {
    if (window.html2pdf) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

async function exportPDF() {
  await loadPDFLibrary();

  const container = document.createElement("div");
  container.style.width = "210mm"; // A4 width
  container.style.minHeight = "297mm"; // A4 height

  const PADDING_PAGE = "25px";

  // ===== Halaman 1: KPI + Analytics =====
  const page1 = document.createElement("div");
  page1.classList.add("page");
  page1.style.padding = PADDING_PAGE;

  const kpi = document.getElementById("kpi-container");
  const analytics = document.querySelector(".analytics-grid");

  if (kpi) page1.appendChild(kpi.cloneNode(true));
  if (analytics) page1.appendChild(analytics.cloneNode(true));

  container.appendChild(page1);

  // ===== Halaman 2: Emission Trend =====
  const page2 = document.createElement("div");
  page2.classList.add("page");
  page2.style.padding = PADDING_PAGE;

  const hTrend = document.createElement("h3");
  hTrend.innerText = "Emission Trend";
  hTrend.style.marginTop = "0";
  hTrend.style.marginBottom = "15px";
  page2.appendChild(hTrend);

  const trendChart = document.getElementById("trendChart");
  if (trendChart) page2.appendChild(trendChart.cloneNode(true));

  container.appendChild(page2);

  // ===== Halaman 3: Facility Comparison =====
  const page3 = document.createElement("div");
  page3.classList.add("page");
  page3.style.padding = PADDING_PAGE;

  const hFacility = document.createElement("h3");
  hFacility.innerText = "Facility Comparison";
  hFacility.style.marginTop = "0";
  hFacility.style.marginBottom = "15px";
  page3.appendChild(hFacility);

  const facilityChart = document.getElementById("facilityChart");
  if (facilityChart) page3.appendChild(facilityChart.cloneNode(true));

  container.appendChild(page3);

  // ===== PDF Options =====
  const options = {
    margin: [0.4, 0.4, 0.4, 0.4], // top,right,bottom,left in inches
    filename: "helixon-energy-report.pdf",
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 3, useCORS: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] }
  };

  html2pdf().set(options).from(container).save();
      }
