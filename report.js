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

renderCharts(data)

setTimeout(generatePDF,1500)

}

function renderCharts(data){

const ctx=document.getElementById("energyChart")

new Chart(ctx,{
type:"bar",
data:{
labels:["Energy"],
datasets:[{data:[10]}]
}
})

}

function generatePDF(){

const { jsPDF } = window.jspdf

const pdf=new jsPDF("p","mm","a4")

pdf.setFontSize(18)

pdf.text("Helixon Energy Intelligence Report",20,20)

const canvas=document.querySelector("canvas")

const img=canvas.toDataURL()

pdf.addImage(img,"PNG",15,40,180,100)

pdf.save("helixon-esg-report.pdf")

}

buildReport()
