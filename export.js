// export.js

async function loadPDFLibrary() {
    if (window.html2pdf) return;
    return new Promise(resolve => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
    });
}

function createPreviewContainer() {
    const oldPreview = document.getElementById("pdf-preview");
    if (oldPreview) oldPreview.remove();

    const previewContainer = document.createElement("div");
    previewContainer.id = "pdf-preview";
    previewContainer.innerHTML = "<h2>PDF Preview</h2>";
    document.body.appendChild(previewContainer);

    return previewContainer;
}

async function exportPDF(previewOnly = false) {
    await loadPDFLibrary();

    const container = document.createElement("div");

    // KPI Page
    const kpiPage = document.createElement("div");
    kpiPage.className = "page";
    kpiPage.appendChild(document.getElementById("kpi-container").cloneNode(true));
    container.appendChild(kpiPage);

    // Analytics Page
    const analyticsPage = document.createElement("div");
    analyticsPage.className = "page";
    analyticsPage.appendChild(document.querySelector(".analytics-grid").cloneNode(true));
    container.appendChild(analyticsPage);

    // Energy Type Page
    const energyPage = document.createElement("div");
    energyPage.className = "page";
    const energyWrapper = document.createElement("div");
    energyWrapper.className = "chart-wrapper";
    const energyTitle = document.createElement("h3");
    energyTitle.innerText = "Energy Type Comparison";
    energyWrapper.appendChild(energyTitle);
    energyWrapper.appendChild(document.getElementById("stackedChart").cloneNode(true));
    energyPage.appendChild(energyWrapper);
    container.appendChild(energyPage);

    // Emission Trend + Facility Comparison Page
    const trendFacilityPage = document.createElement("div");
    trendFacilityPage.className = "page";

    const trendWrapper = document.createElement("div");
    trendWrapper.className = "chart-wrapper";
    const trendTitle = document.createElement("h3");
    trendTitle.innerText = "Emission Trend";
    trendWrapper.appendChild(trendTitle);
    trendWrapper.appendChild(document.getElementById("trendChart").cloneNode(true));
    trendFacilityPage.appendChild(trendWrapper);

    const facilityWrapper = document.createElement("div");
    facilityWrapper.className = "chart-wrapper";
    const facilityTitle = document.createElement("h3");
    facilityTitle.innerText = "Facility Comparison";
    facilityWrapper.appendChild(facilityTitle);
    facilityWrapper.appendChild(document.getElementById("facilityChart").cloneNode(true));
    trendFacilityPage.appendChild(facilityWrapper);

    container.appendChild(trendFacilityPage);

    if (previewOnly) {
        const preview = createPreviewContainer();
        preview.appendChild(container);
        return;
    }

    // PDF Options
    const opt = {
        margin: 0.3,
        filename: "helixon-energy-report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(container).save();
}

// Tombol preview PDF
const previewBtn = document.createElement("button");
previewBtn.innerText = "Preview PDF";
previewBtn.style.position = "fixed";
previewBtn.style.top = "80px";
previewBtn.style.right = "40px";
previewBtn.style.padding = "10px 16px";
previewBtn.style.borderRadius = "10px";
previewBtn.style.border = "1px solid #334155";
previewBtn.style.background = "linear-gradient(135deg,#facc15,#dc2626)";
previewBtn.style.color = "white";
previewBtn.style.fontWeight = "600";
previewBtn.style.cursor = "pointer";
previewBtn.style.zIndex = "999";
previewBtn.onclick = () => exportPDF(true);
document.body.appendChild(previewBtn);
