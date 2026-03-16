async function exportPDF(){

const { jsPDF } = window.jspdf;

const dashboard = document.getElementById("dashboard-content");

const canvas = await html2canvas(dashboard,{
scale:2,
backgroundColor:"#ffffff"
});

const img = canvas.toDataURL("image/png");

const pdf = new jsPDF({
orientation:"portrait",
unit:"mm",
format:"a4"
});

const width = 210;
const height = canvas.height * width / canvas.width;

pdf.addImage(img,"PNG",0,0,width,height);

pdf.save("helixon-carbon-report.pdf");

}
