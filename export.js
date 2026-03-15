/* =========================
HELIXON PROFESSIONAL PDF EXPORT
========================= */

async function exportPDF() {

    // Buat container sementara
    const container = document.createElement("div");

    // Wrap setiap section ke dalam div.page
    const sections = [
        document.getElementById("kpi-container"),
        document.querySelector(".analytics-grid"),
        document.getElementById("stackedChart"),
        document.getElementById("trendChart"),
        document.getElementById("facilityChart")
    ];

    sections.forEach(section => {
        const pageDiv = document.createElement("div");
        pageDiv.classList.add("page");
        pageDiv.appendChild(section.cloneNode(true));
        container.appendChild(pageDiv);
    });

    // Atur opsi html2pdf
    const opt = {
        margin: 0.4,
        filename: "helixon-energy-report.pdf",
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] }
    };

    html2pdf().set(opt).from(container).save();
}

/* Tambahkan tombol export di pojok kanan, tidak mengubah dashboard */
function createExportButton() {
    if (document.getElementById("helixon-export-btn")) return;

    const btn = document.createElement("button");
    btn.id = "helixon-export-btn";
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

// Auto-create tombol
createExportButton();
