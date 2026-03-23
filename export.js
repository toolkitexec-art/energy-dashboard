function exportPDF(){

    // HARD GATE: pastikan chart sudah siap
    if(!window.energyChart || !window.trendChart || !window.facilityChart){
        console.error("EXPORT BLOCKED: CHART NOT READY");
        return;
    }

    // optional safety delay untuk canvas flush terakhir
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {

            const payload = buildExportPayload();

            if(!payload || !payload.charts){
                console.error("EXPORT FAILED: INVALID PAYLOAD");
                return;
            }

            // SINGLE SOURCE STORAGE
            localStorage.setItem(
                "helixonCharts",
                JSON.stringify(payload)
            );

            // OPEN STRICT PREVIEW
            window.open("preview.html", "_blank");
        });
    });
}
