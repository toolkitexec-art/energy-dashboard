import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL="https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY="sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)

const params=new URLSearchParams(window.location.search)

const facility=params.get("facility")
const month=params.get("month")

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

const total=filtered.reduce((s,r)=>s+Number(r.total_emission||0),0)

const ctx=document.getElementById("reportChart")

const chart=new Chart(ctx,{
type:"bar",
data:{
labels:["Total Emission"],
datasets:[{
data:[total]
}]
}
})

setTimeout(()=>exportPDF(chart),1200)

}

function exportPDF(chart){

const { jsPDF } = window.jspdf

const pdf=new jsPDF("p","mm","a4")

pdf.text("Helixon ESG Report",20,20)

const img=chart.toBase64Image()

pdf.addImage(img,"PNG",15,40,180,100)

pdf.save("helixon-report.pdf")

}

buildReport()
