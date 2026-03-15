/* =========================
HELIXON PROFESSIONAL PDF EXPORT
========================= */

async function exportPDF(){
  // Pastikan html2pdf tersedia
  if(!window.html2pdf){
    console.error("html2pdf.js library not loaded");
    return;
  }

  const pdfContainer = document.createElement("div");
  pdfContainer.style.background = "#fff";
  pdfContainer.style.padding = "25px";
  pdfContainer.style.color = "#1f2937";
  pdfContainer.style.fontFamily = "Inter, sans-serif";

  // HEADER
  const header = document.createElement("div");
  header.innerHTML = `<h1 style="text-align:center;margin-bottom:20px;">Helixon Energy Intelligence Report</h1>
                      <div style="font-size:14px;opacity:0.7;margin-bottom:20px;">
                        Report Date: ${new Date().toLocaleDateString()}<br>
                        Facility: ${document.getElementById("facility-select").value}<br>
                        Month: ${document.getElementById("month-select").value}
                      </div>`;
  pdfContainer.appendChild(header);

  // KPI SECTION
  const kpiClone = document.getElementById("kpi-container").cloneNode(true);
  kpiClone.style.display = "grid";
  kpiClone.style.gridTemplateColumns = "repeat(auto-fit,minmax(250px,1fr))";
  kpiClone.style.gap = "15px";
  kpiClone.style.marginBottom = "25px";
  pdfContainer.appendChild(kpiClone);

  // ANALYTICS SECTION
  const analyticsClone = document.querySelector(".analytics-grid").cloneNode(true);
  analyticsClone.style.display = "grid";
  analyticsClone.style.gridTemplateColumns = "repeat(auto-fit,minmax(250px,1fr))";
  analyticsClone.style.gap = "15px";
  analyticsClone.style.marginBottom = "25px";
  pdfContainer.appendChild(analyticsClone);

  // CHARTS
  ["stackedChart","trendChart","facilityChart"].forEach(id=>{
    const canvas = document.getElementById(id);
    if(canvas){
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/jpeg", 1);
      img.style.width = "100%";
      img.style.marginBottom = "25px";
      pdfContainer.appendChild(img);
    }
  });

  // PDF OPTIONS
  const opt = {
    margin: 0.4,
    filename: "helixon-energy-report.pdf",
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 3, useCORS: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] }
  };

  html2pdf().set(opt).from(pdfContainer).save();
}

/* Bind button */
const exportBtn = document.getElementById("export-pdf");
if(exportBtn){
  exportBtn.onclick = exportPDF;
}
