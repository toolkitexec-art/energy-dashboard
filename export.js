window.exportPDF = async function () {

    try {

        await window.delay(400); // STEP 3: stabilisasi DOM

        lockChartSize(window.energyChart);
        lockChartSize(window.trendChart);
        lockChartSize(window.facilityChart);
  
        const payload = window.buildExportPayload();

        localStorage.setItem("helixonCharts", JSON.stringify(payload));

        window.location.href = "/preview.html";

    } catch (err) {
        alert("ERROR: " + err.message);
        console.error(err);
    }
};
