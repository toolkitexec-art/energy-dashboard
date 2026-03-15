/* export.js - PDF Export Profesional Helixon */

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

    // Buat container sementara untuk PDF
    const container = document.createElement("div");

    // Clone tiap section dashboard ke container
    const sections = [
        document.getElementById("kpi-container"),
        document.querySelector(".analytics-grid"),
        document.getElementById("stackedChart"),
        document.getElementById("trendChart"),
        document.getElementById("facilityChart")
    ];

    sections.forEach((el, idx) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("page"); // setiap page
        wrapper.appendChild(el.cloneNode(true));
        container.appendChild(wrapper);
    });

    // PDF options
    const opt = {
        margin: 0.4,
        filename: "helixon-energy-report.pdf",
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 3, useCORS: true, logging: false },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] } // memaksa page break per .page
    };

    html2pdf().set(opt).from(container).save();
}

// Tambahkan tombol export di pojok kanan atas
function createExportButton() {
    const btn = document.createElement("button");
    btn.innerText = "Export PDF";
    btn.style.position = "fixed";
    btn.style.top = "30px";
    btn.style.right = "40px";
    btn.style.padding = "10px 16px";
    btn.style.borderRadius = "10px";
    btn.style.border = "1px solid #334155";
    btn.style.background = "linear-gradient(135deg,#3b82f6,#1e3a8a)";
    btn.style.color = "white";
    btn.style.fontWeight = "600";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "999";
    btn.onclick = exportPDF;
    document.body.appendChild(btn);
}

// Jalankan otomatis setelah page load
window.addEventListener("DOMContentLoaded", () => {
    createExportButton();
});
