import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL="https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY="sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)

let dashboardData=[]

async function loadDashboard(){

const {data,error}=await supabase
.from("dashboard_phase2_final_named")
.select("*")

if(error){
console.log(error)
return
}

dashboardData=data

populateFilters(data)

applyFilters()

}

function populateFilters(data){

const facilitySelect=document.getElementById("facility-select")
const monthSelect=document.getElementById("month-select")

const facilities=[...new Set(data.map(d=>d.facility_name))]
const months=[...new Set(data.map(d=>d.month))]

facilities.forEach(f=>{
const opt=document.createElement("option")
opt.value=f
opt.textContent=f
facilitySelect.appendChild(opt)
})

months.forEach(m=>{
const opt=document.createElement("option")
opt.value=m
opt.textContent=m
monthSelect.appendChild(opt)
})

facilitySelect.onchange=applyFilters
monthSelect.onchange=applyFilters

}

function applyFilters(){

const facility=document.getElementById("facility-select").value
const month=document.getElementById("month-select").value

let filtered=dashboardData

if(facility!=="all"){
filtered=filtered.filter(d=>d.facility_name===facility)
}

if(month!=="all"){
filtered=filtered.filter(d=>d.month===month)
}

renderKPI(filtered)
renderCharts(filtered)

}

function renderKPI(data){

const totalUsage=data.reduce((s,r)=>s+Number(r.total_usage||0),0)
const totalCost=data.reduce((s,r)=>s+Number(r.total_cost||0),0)
const totalEmission=data.reduce((s,r)=>s+Number(r.total_emission||0),0)

document.getElementById("kpi-container").innerHTML=
`
<div class="analytics-card">Total Usage<br>${totalUsage.toFixed(2)}</div>
<div class="analytics-card">Total Cost<br>$${totalCost.toFixed(2)}</div>
<div class="analytics-card">Total Emission<br>${totalEmission.toFixed(2)}</div>
`

}

let stackedChart
let trendChart
let facilityChart

function renderCharts(data){

const energyTotals={}

data.forEach(r=>{
energyTotals[r.energy_type]=(energyTotals[r.energy_type]||0)+Number(r.total_emission||0)
})

const energyLabels=Object.keys(energyTotals)
const energyValues=Object.values(energyTotals)

if(stackedChart) stackedChart.destroy()

stackedChart=new Chart(
document.getElementById("stackedChart"),
{
type:"bar",
data:{
labels:energyLabels,
datasets:[{data:energyValues}]
}
})

const months=[...new Set(data.map(d=>d.month))]

const trendValues=months.map(m=>{
return data
.filter(d=>d.month===m)
.reduce((s,r)=>s+Number(r.total_emission||0),0)
})

if(trendChart) trendChart.destroy()

trendChart=new Chart(
document.getElementById("trendChart"),
{
type:"line",
data:{
labels:months,
datasets:[{data:trendValues}]
}
})

const facilities=[...new Set(data.map(d=>d.facility_name))]

const facilityValues=facilities.map(f=>{
return data
.filter(d=>d.facility_name===f)
.reduce((s,r)=>s+Number(r.total_emission||0),0)
})

if(facilityChart) facilityChart.destroy()

facilityChart=new Chart(
document.getElementById("facilityChart"),
{
type:"bar",
data:{
labels:facilities,
datasets:[{data:facilityValues}]
}
})

}

loadDashboard()
