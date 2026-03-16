async function exportPDF(){

const { jsPDF } = window.jspdf;

const pdf = new jsPDF("p","mm","a4");

const charts = document.querySelectorAll("canvas");

let y = 20;

for(let canvas of charts){

const img = canvas.toDataURL("image/png",1.0);

pdf.addImage(img,"PNG",15,y,180,80);

y += 90;

if(y > 250){
pdf.addPage();
y = 20;
}

}

pdf.save("helixon-carbon-report.pdf");

}
