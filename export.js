async function loadPDFLibrary() {
    if (window.html2pdf) return;
    return new Promise(resolve => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
    });
}

function createPDFPage(title, elements) {
    const page = document.createElement("div");
    page.className = "pdf-page";

    const wrapper = document.createElement("div");
    wrapper.className = "pdf-chart-wrapper";

    if(title){
        const h3 = document.createElement("h3");
        h3.innerText = title;
        wrapper.appendChild(h3);
    }

    elements.forEach(el => wrapper.appendChild(el.cloneNode(true)));
    page.appendChild(wrapper);
    return page;
}

async function exportPDF() {
    await loadPDFLibrary();

    const container = document.createElement("div");

    // Page 1: KPI + Energy Type
    const page1 = createPDFPage(null, [
        document.getElementById("kpi-container"),
        document.getElementById("stackedChart")
    ]);
    const h3Energy = document.createElement("h3");
    h3Energy.innerText = "Energy Type Comparison";
    page1.querySelector(".pdf-chart-wrapper").insertBefore(h3Energy, page1.querySelector(".pdf-chart-wrapper").children[1]);
    container.appendChild(page1);

    // Page 2: Emission Trend + Facility Comparison
    const page2 = createPDFPage(null, [
        document.getElementById("trendChart"),
        document.getElementById("facilityChart")
    ]);
    const h3Trend = document.createElement("h3");
    h3Trend.innerText = "Emission Trend";
    page2.querySelector(".pdf-chart-wrapper").insertBefore(h3Trend, page2.querySelector(".pdf-chart-wrapper").children[0]);

    const h3Facility = document.createElement("h3");
    h3Facility.innerText = "Facility Comparison";
    page2.querySelector(".pdf-chart-wrapper").appendChild(h3Facility);
    container.appendChild(page2);

    // Show preview
    const preview = document.getElementById("pdf-preview-container");
    preview.innerHTML = "";
    preview.appendChild(container);
    preview.style.display = "block";

    // Download after preview (optional)
    const opt = {
        margin:0.3,
        filename:"helixon-energy-report.pdf",
        image:{type:"jpeg",quality:0.98},
        html2canvas:{scale:2,useCORS:true},
        jsPDF:{unit:"in",format:"a4",orientation:"portrait"}
    };

    html2pdf().set(opt).from(container).save();
}
