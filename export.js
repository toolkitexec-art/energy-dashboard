function exportPDF(){

const charts = document.querySelectorAll("canvas");

const images = [];

charts.forEach(canvas=>{
images.push(canvas.toDataURL("image/png",1.0));
});

localStorage.setItem("helixonCharts", JSON.stringify(images));

window.open("preview.html","_blank");

}
