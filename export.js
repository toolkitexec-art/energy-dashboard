btn.addEventListener("click", () => {
    try {
        console.log("STEP 1");
        alert("CLICK OK");

        console.log("STEP 2");
        console.log("typeof exportPDF:", typeof exportPDF);
        console.log("typeof window.exportPDF:", typeof window.exportPDF);

        console.log("STEP 3");
        window.exportPDF();

        console.log("STEP 4");
    } catch (e) {
        console.error("CLICK ERROR:", e);
        alert("ERROR: " + e.message);
    }
});
