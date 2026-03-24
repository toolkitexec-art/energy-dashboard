window.exportPDF = function () {

    alert("EXPORT CALLED");


        const payload = window.buildExportPayload();

        alert("PAYLOAD OK");

        console.log(payload);

        localStorage.setItem("helixonCharts", JSON.stringify(payload));

        alert("REDIRECT NOW");

        window.location.href = "/preview.html";

    } catch (err) {
        alert("ERROR: " + err.message);
        console.error(err);
    }
};
