import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL="https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY="sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)

const facilitySelect=document.getElementById("facility-select")
const monthSelect=document.getElementById("month-select")

let stackedChart
let trendChart

async function loadDashboard(){

const {data,error}=await supabase
.from("dashboard_phase2_final_named")
.select("*")

if(error){
console.log(error)
document.getElementById("loading").innerText="Error loading data"
return
}

document.getElementById("loading").style.display="none"

populateFilters(data)
applyFilters(data)

}

function populateFilters(data){

const facilities=[...new Set(
data
.map(d=>d.facility_name)
.filter(v=>v && v!=="undefined")
)]

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
renderStack(filtered)
renderTrend(data,facility)

renderAI(filtered)

}

function renderKPI(data){

const totalUsage=data.reduce((sum,r)=>sum+Number(r.total_usage),0)
const totalCost=data.reduce((sum,r)=>sum+Number(r.total_cost),0)
const totalEmission=data.reduce((sum,r)=>sum+Number(r.total_emission),0)

document.getElementById("kpi-container").innerHTML=`

<div class="kpi-card">
<b>Total Usage</b><br>${totalUsage.toFixed(2)}
</div>

<div class="kpi-card">
<b>Total Cost</b><br>$${totalCost.toFixed(2)}
</div>

<div class="kpi-card">
<b>Total Emission</b><br>${totalEmission.toFixed(2)}
</div>

`

}

function renderStack(data){

const labels=[...new Set(data.map(d=>d.energy_type_record))]

const values=labels.map(type=>{
return data
.filter(r=>r.energy_type_record===type)
.reduce((sum,r)=>sum+Number(r.total_emission),0)
})

const ctx=document.getElementById("stackedChart").getContext("2d")

if(stackedChart) stackedChart.destroy()

stackedChart=new Chart(ctx,{
type:"bar",
data:{
labels:labels,
datasets:[{
label:"Emission by Energy Type",
data:values,
backgroundColor:"#6366f1"
}]
},
plugins:[ChartDataLabels],
options:{
plugins:{
datalabels:{
color:"#ffffff",
anchor:"end",
align:"top",
formatter:v=>v.toFixed(2)
}
},
scales:{y:{beginAtZero:true}}
}
})

}

function renderTrend(data,facility){

if(facility!=="all"){
data=data.filter(d=>d.facility_name===facility)
}

const months=[...new Set(data.map(d=>d.month))].sort()

const values=months.map(m=>{
return data
.filter(r=>r.month===m)
.reduce((sum,r)=>sum+Number(r.total_emission),0)
})

const ctx=document.getElementById("trendChart").getContext("2d")

if(trendChart) trendChart.destroy()

trendChart=new Chart(ctx,{
type:"line",
data:{
labels:months.map(m=>{
const d=new Date(m)
return d.toLocaleString("en",{month:"short"})
}),
datasets:[{
label:"Emission Trend",
data:values,
borderColor:"#60a5fa",
fill:false
}]
}
})

}

function renderAI(data){

const electricity=data
.filter(d=>d.energy_type_record==="electricity")
.reduce((sum,r)=>sum+Number(r.total_usage),0)

let message="Energy usage is efficient."

if(electricity>300){
message="AI Insight: Electricity usage high. Consider solar or efficiency upgrade."
}

document.getElementById("ai-recommend").innerText=message

}

loadDashboard()
