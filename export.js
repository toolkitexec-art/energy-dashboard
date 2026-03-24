window.exportPDF = function(){
    console.log("EXPORT RUN");

    const payload = buildExportPayload();

    localStorage.setItem("helixonCharts", JSON.stringify(payload));

    window.location.href = "/preview.html";
}
