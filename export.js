function exportPDF(){

    setTimeout(() => {

        const energy = document.getElementById("stackedChart");
        const trend = document.getElementById("trendChart");
        const facility = document.getElementById("facilityChart");

        const data = {
            charts: {
                energy: energy ? energy.toDataURL("image/png", 1.0) : null,
                trend: trend ? trend.toDataURL("image/png", 1.0) : null,
                facility: facility ? facility.toDataURL("image/png", 1.0) : null
            }
        };

        localStorage.setItem("helixonCharts", JSON.stringify(data));

        window.open("preview.html", "_blank");

    }, 800); // <<< penting
}
