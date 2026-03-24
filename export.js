function exportPDF(){

    console.log("EXPORT RUN");

    const payload = buildExportPayload();

    localStorage.setItem(
        "helixonCharts",
        JSON.stringify(payload)
    );

    window.location.href = window.location.origin + "/preview.html";
}
