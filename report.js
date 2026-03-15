import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL="https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY="sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)

const params=new URLSearchParams(window.location.search)

const facility=params.get("facility")
const month=params.get("month")

let energyChart
let trendChart
let facilityChart

async function buildReport(){

const {data,error}=await supabase
.from("dashboard_phase2_final_named")
.select("*")

if(error){
console.log(error)
return
}

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

const ctx1=document.getElementById("energyChart")

energyChart=new Chart(ctx1,{
type:"bar",
data:{
labels:["Emission"],
datasets:[{
data:[data.reduce((s,r)=>s+Number(r.total_emission||0),0)]
}]
}
})

const ctx2=document.getElementById("trendChart")

trendChart=new Chart(ctx2,{
type:"line",
data:{
labels:["Trend"],
datasets:[{data:[10]}]
}
})

const ctx3=document.getElementById("facilityChart")

facilityChart=new Chart(ctx3,{
type:"bar",
data:{
labels:["Facility"],
datasets:[{data:[10]}]
}
})

}

function generatePDF(){

const { jsPDF } = window.jspdf

const pdf=new jsPDF("p","mm","a4")

pdf.setFontSize(18)

pdf.text("Helixon Energy Intelligence Report",20,20)

const img=energyChart.toBase64Image()

pdf.addImage(img,"PNG",15,40,180,100)

pdf.save("helixon-esg-report.pdf")

}

buildReport()
