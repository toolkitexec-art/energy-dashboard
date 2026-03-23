function exportPDF(){

    // HARD GATE: pastikan chart sudah siap
    if(!isSystemReady()){
        console.error("SYSTEM NOT READY");
        return;
    }

    // optional safety delay untuk canvas flush terakhir
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {

            const payload = buildExportPayload();

            // SINGLE SOURCE STORAGE
            localStorage.setItem(
                "helixonCharts",
                JSON.stringify(payload));

            // OPEN STRICT PREVIEW
            window.open("preview.html", "_blank");
        });
    });
}
