async function loadPDFLibrary() {
    if (window.html2pdf) return;
    return new Promise(resolve => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
    });
}

async function exportPDF() {
    await loadPDFLibrary();

    const container = document.createElement("div");

    // ===============================
    // Halaman 1: KPI + Energy Type
    // ===============================
    const page1 = document.createElement("div");
    page1.className = "page";

    // KPI
    page1.appendChild(document.getElementById("kpi-container").cloneNode(true));

    // Energy Type
    const energyWrapper = document.createElement("div");
    energyWrapper.className = "chart-wrapper";
    const energyTitle = document.createElement("h3");
    energyTitle.innerText = "Energy Type Comparison";
    energyWrapper.appendChild(energyTitle);
    energyWrapper.appendChild(document.getElementById("stackedChart").cloneNode(true));
    page1.appendChild(energyWrapper);

    container.appendChild(page1);

    // ===============================
    // Halaman 2: Emission Trend + Facility Comparison
    // ===============================
    const page2 = document.createElement("div");
    page2.className = "page";

    // Emission Trend
    const trendWrapper = document.createElement("div");
    trendWrapper.className = "chart-wrapper";
    const trendTitle = document.createElement("h3");
    trendTitle.innerText = "Emission Trend";
    trendWrapper.appendChild(trendTitle);
    trendWrapper.appendChild(document.getElementById("trendChart").cloneNode(true));
    page2.appendChild(trendWrapper);

    // Facility Comparison
    const facilityWrapper = document.createElement("div");
    facilityWrapper.className = "chart-wrapper";
    const facilityTitle = document.createElement("h3");
    facilityTitle.innerText = "Facility Comparison";
    facilityWrapper.appendChild(facilityTitle);
    facilityWrapper.appendChild(document.getElementById("facilityChart").cloneNode(true));
    page2.appendChild(facilityWrapper);

    container.appendChild(page2);

    // ===============================
    // PDF Options
    // ===============================
    const opt = {
        margin: 0.3,
        filename: "helixon-energy-report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(container).save();
}
