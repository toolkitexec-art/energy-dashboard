import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL="https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY="sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)

const facilitySelect=document.getElementById("facility-select")
const monthSelect=document.getElementById("month-select")

let energyChart
let trendChart
let facilityChart

const INDUSTRY_AVG=0.42
const CARBON_PRICE=85


async function loadDashboard(){

const {data,error}=await supabase
.from("dashboard_phase2_final_named")
.select("*")

if(error){
console.log(error)
return
}

populateFilters(data)
applyFilters(data)

}


function populateFilters(data){

const facilities=[...new Set(data.map(d=>d.facility_name).filter(Boolean))]

facilities.forEach(f=>{
facilitySelect.innerHTML+=`<option value="${f}">${f}</option>`
})

const months=[...new Set(data.map(d=>d.month))].sort()

months.forEach(m=>{
const date=new Date(m)
const label=date.toLocaleString("en",{month:"long",year:"numeric"})
monthSelect.innerHTML+=`<option value="${m}">${label}</option>`
})

facilitySelect.addEventListener("change",()=>applyFilters(data))
monthSelect.addEventListener("change",()=>applyFilters(data))

}


function applyFilters(data){

let facility=facilitySelect.value
let month=monthSelect.value
let filtered=data

if(facility!=="all"){
filtered=filtered.filter(d=>d.facility_name===facility)
}

if(month!=="all"){
filtered=filtered.filter(d=>d.month===month)
}

renderKPI(filtered)
renderEnergyChart(filtered)
renderTrendChart(filtered)
renderFacilityChart(filtered)

}


function sum(data,field){
return data.reduce((s,r)=>s+Number(r[field]||0),0)
}


/* KPI */

function renderKPI(data){

const usage=sum(data,"total_usage")
const cost=sum(data,"total_cost")
const emission=sum(data,"total_emission")

document.getElementById("kpi-container").innerHTML=

`<div>Total Usage ${usage}</div>
<div>Total Cost $${cost}</div>
<div>Total Emission ${emission}</div>`

}


/* ENERGY CHART */

function renderEnergyChart(data){

const labels=[...new Set(data.map(d=>d.energy_type_record))]

const values=labels.map(type=>{
return data.filter(r=>r.energy_type_record===type)
.reduce((s,r)=>s+Number(r.total_emission||0),0)
})

const total=values.reduce((a,b)=>a+b,0)

document.getElementById("energy-total").innerText=total

const ctx=document.getElementById("stackedChart")

if(energyChart) energyChart.destroy()

energyChart=new Chart(ctx,{
type:"bar",
data:{
labels,
datasets:[{data:values}]
},
options:{
plugins:{legend:{display:false}}
}
})

}


/* TREND */

function renderTrendChart(data){

const months=[...new Set(data.map(d=>d.month))].sort()

const values=months.map(m=>{
return data.filter(r=>r.month===m)
.reduce((s,r)=>s+Number(r.total_emission||0),0)
})

const ctx=document.getElementById("trendChart")

if(trendChart) trendChart.destroy()

trendChart=new Chart(ctx,{
type:"line",
data:{
labels:months,
datasets:[{data:values}]
}
})

}


/* FACILITY */

function renderFacilityChart(data){

const facilities=[...new Set(data.map(d=>d.facility_name))]

const values=facilities.map(f=>{
return data.filter(r=>r.facility_name===f)
.reduce((s,r)=>s+Number(r.total_emission||0),0)
})

const ctx=document.getElementById("facilityChart")

if(facilityChart) facilityChart.destroy()

facilityChart=new Chart(ctx,{
type:"bar",
data:{
labels:facilities,
datasets:[{data:values}]
}
})

}


/* PDF EXPORT */

function exportPDF(){

const dashboard=document.body

html2pdf().set({

margin:0.5,

filename:"helixon-energy-report.pdf",

image:{type:"jpeg",quality:1},

html2canvas:{scale:2,useCORS:true},

jsPDF:{unit:"in",format:"a4",orientation:"portrait"}

}).from(dashboard).save()

}


/* BUTTON BIND */

const exportBtn=document.getElementById("export-pdf")

if(exportBtn){
exportBtn.onclick=exportPDF
}


loadDashboard()
