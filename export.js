function exportPDF(){

   
    // pastikan chart sudah fully render
    energyChart.update('none');
    trendChart.update('none');
    facilityChart.update('none
    
    
    // 🔥 ambil canvas sesuai ID (bukan random)
    const energyCanvas = document.getElementById("stackedChart");
    const trendCanvas = document.getElementById("trendChart");
    const facilityCanvas = document.getElementById("facilityChart");

    const images = {
        energy: energyCanvas.toDataURL("image/png",1.0),
        trend: trendCanvas.toDataURL("image/png",1.0),
        facility: facilityCanvas.toDataURL("image/png",1.0)
    };

    localStorage.setItem("helixonCharts", JSON.stringify(images));

    window.open("preview.html","_blank");
}
