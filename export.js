function exportPDF(){

    const images = {
        energy: document.getElementById("stackedChart").toDataURL("image/png",1.0),
        trend: document.getElementById("trendChart").toDataURL("image/png",1.0),
        facility: document.getElementById("facilityChart").toDataURL("image/png",1.0)
    };

    localStorage.setItem("helixonCharts", JSON.stringify(images));

    window.open("preview.html","_blank");
}
