/* ===== HELIXON PDF EXPORT (PROFESSIONAL ESG LAYOUT) ===== */

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

    // ===== Halaman 1: KPI + Analytics =====
    ["kpi-container", ".analytics-grid"].forEach(sel => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("page");
        const el = document.querySelector(sel);
        if (el) wrapper.appendChild(el.cloneNode(true));
        container.appendChild(wrapper);
    });

    // ===== Halaman 2: Emission Trend + Facility Comparison =====
    [
        ["trendChart", "Emission Trend"],
        ["facilityChart", "Facility Comparison"]
    ].forEach(([id, title]) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("page");

        const h3 = document.createElement("h3");
        h3.innerText = title;
        wrapper.appendChild(h3);

        const chartEl = document.getElementById(id);
        if (chartEl) wrapper.appendChild(chartEl.cloneNode(true));

        container.appendChild(wrapper);
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
