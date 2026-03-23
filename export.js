let exportLock = false;

function exportPDF(){

    if(exportLock) return;
    exportLock = true;

    // pastikan chart sudah selesai render
    requestAnimationFrame(() => {

        setTimeout(() => {

            const el = document.getElementById("kpi-container").parentElement;

            html2canvas(el, {
                scale: 3,
                useCORS: true,
                backgroundColor: "#020617",
                logging: false,
                allowTaint: false
            }).then(canvas => {

                const img = canvas.toDataURL("image/png", 1.0);

                localStorage.setItem("helixon_snapshot", img);

                window.open("preview.html", "_blank");

                exportLock = false;
            });

        }, 200); // stabilizer delay
    });
}
