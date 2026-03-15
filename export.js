async function loadPDFLibrary() {
    if (window.html2pdf) return;
    return new Promise(resolve => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
    });
}

function generatePDFContainer() {
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

    return container;
}

async function exportPDF() {
    await loadPDFLibrary();

    const container = generatePDFContainer();

    // Tampilkan preview scrollable
    const previewContainer = document.getElementById("pdf-preview-container");
    previewContainer.innerHTML = "<h3 style='margin-bottom:15px'>PDF Preview (Scroll untuk lihat semua halaman)</h3>";
    previewContainer.appendChild(container.cloneNode(true));

    // Download PDF
    const opt = {
        margin: 0.3,
        filename: "helixon-energy-report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(container).save();
}
