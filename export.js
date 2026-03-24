window.exportPDF = function () {
    alert("EXPORT CALLED");

    const payload = buildExportPayload();

    localStorage.setItem("helixonCharts", JSON.stringify(payload));

    window.location.href = "/preview.html";
};
