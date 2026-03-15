async function exportPDF(){

    const element=document.body

    const opt={
        margin:0.4,
        filename:"helixon-energy-report.pdf",
        image:{type:"jpeg",quality:0.98},
        html2canvas:{
            scale:3,
            useCORS:true
        },
        jsPDF:{
            unit:"in",
            format:"a4",
            orientation:"portrait"
        },
        pagebreak:{
            mode:["css","legacy"]
        }
    }

    html2pdf().set(opt).from(element).save()

}
