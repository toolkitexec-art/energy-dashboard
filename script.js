/* ===== HELIXON PDF EXPORT (APPEND AT BOTTOM OF script.js) ===== */

function exportHelixonPDF(){

  const report=document.createElement("div")

  report.style.background="#020617"
  report.style.color="#e5e7eb"
  report.style.padding="40px"
  report.style.fontFamily="Inter, sans-serif"
  report.style.width="100%"

  /* HEADER */

  const title=document.createElement("h2")
  title.textContent="Helixon Energy Intelligence Report"

  const date=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})
  const facility=document.getElementById("facility-select")?.value || "All Facilities"
  const month=document.getElementById("month-select")?.value || "All Months"

  const meta=document.createElement("div")
  meta.innerHTML=`Report Date: ${date}<br>Facility Filter: ${facility}<br>Month Filter: ${month}`
  meta.style.marginBottom="25px"

  report.appendChild(title)
  report.appendChild(meta)

  /* KPI */

  const kpi=document.getElementById("kpi-container")
  if(kpi){
    const clone=kpi.cloneNode(true)
    clone.style.marginBottom="30px"
    report.appendChild(clone)
  }

  /* ANALYTICS */

  const analytics=document.querySelector(".analytics-grid")
  if(analytics){
    const clone=analytics.cloneNode(true)
    clone.style.marginBottom="30px"
    report.appendChild(clone)
  }

  /* CHARTS -> IMAGE (HIGH RESOLUTION) */

  const canvases=document.querySelectorAll("canvas")

  canvases.forEach((canvas,index)=>{

    const section=document.createElement("div")

    section.style.pageBreakBefore="always"
    section.style.marginTop="20px"
    section.style.textAlign="center"

    const img=document.createElement("img")

    img.src=canvas.toDataURL("image/png",1.0)

    img.style.width="100%"
    img.style.maxWidth="900px"
    img.style.height="auto"

    section.appendChild(img)

    report.appendChild(section)

  })

  /* PDF GENERATION */

  html2pdf().set({

    margin:[0.5,0.5,0.5,0.5],

    filename:"helixon-energy-report.pdf",

    image:{type:"jpeg",quality:1},

    html2canvas:{
      scale:3,
      useCORS:true
    },

    jsPDF:{
      unit:"in",
      format:"a4",
      orientation:"portrait"
    }

  }).from(report).save()

}


/* BUTTON BINDING */

window.addEventListener("load",function(){

  const btn=document.getElementById("export-pdf")

  if(btn){
    btn.addEventListener("click",exportHelixonPDF)
  }

})
