import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL="https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY="sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)

const params=new URLSearchParams(window.location.search)

const facility=params.get("facility")
const month=params.get("month")

async function buildReport(){

const {data}=await supabase
.from("dashboard_phase2_final_named")
.select("*")

let filtered=data

if(facility!=="all"){
filtered=filtered.filter(d=>d.facility_name===facility)
}

if(month!=="all"){
filtered=filtered.filter(d=>d.month===month)
}

renderCharts(filtered)

setTimeout(generatePDF,1500)

}

function renderCharts(data){

const energyTotals={}

data.forEach(r=>{
energyTotals[r.energy_type]=(energyTotals[r.energy_type]||0)+Number(r.total_emission||0)
})

new Chart(document.getElementById("energyChart"),{
type:"bar",
data:{
labels:Object.keys(energyTotals),
datasets:[{data:Object.values(energyTotals)}]
}
})

}

function generatePDF(){

const { jsPDF } = window.jspdf

const pdf=new jsPDF("p","mm","a4")

pdf.text("Helixon ESG Report",20,20)

const canvas=document.querySelector("canvas")

const img=canvas.toDataURL()

pdf.addImage(img,"PNG",15,40,180,100)

pdf.save("helixon-esg-report.pdf")

}

buildReport()
