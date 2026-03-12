import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL="https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY="sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)

const facilitySelect=document.getElementById("facility-select")
const monthSelect=document.getElementById("month-select")

let stackedChart
let trendChart
let facilityChart

const CARBON_PRICE=85

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
data.map(d=>d.facility_name).filter(v=>v && v!=="undefined")
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
renderTrend(data,facility,month)
renderFacilityComparison(filtered)
renderCarbonImpact(filtered)
renderAI(filtered)

}

function renderKPI(data){

const totalUsage=data.reduce((sum,r)=>sum+Number(r.total_usage),0)
const totalCost=data.reduce((sum,r)=>sum+Number(r.total_cost),0)
const totalEmission=data.reduce((sum,r)=>sum+Number(r.total_emission),0)

document.getElementById("kpi-container").innerHTML=`

<div class="kpi-card"><b>Total Usage</b><br>${totalUsage.toFixed(2)}</div>

<div class="kpi-card"><b>Total Cost</b><br>$${totalCost.toFixed(2)}</div>

<div class="kpi-card"><b>Total Emission</b><br>${totalEmission.toFixed(2)}</div>

`

}

function renderCarbonImpact(data){

const emission=data.reduce((sum,r)=>sum+Number(r.total_emission),0)

const carbonCost=emission*CARBON_PRICE

document.getElementById("carbon-impact").innerHTML=
`Estimated Carbon Cost Impact: <b>$${carbonCost.toFixed(2)}</b>`

}

function renderStack(data){

const labels=[...new Set(data.map(d=>d.energy_type_record))]

const values=labels.map(type=>{
return data
.filter(r=>r.energy_type_record===type)
.reduce((sum,r)=>sum+Number(r.total_emission),0)
})

const totalEmission=values.reduce((a,b)=>a+b,0)

document.getElementById("energy-total").innerText=totalEmission.toFixed(2)

const ctx=document.getElementById("stackedChart").getContext("2d")

if(stackedChart) stackedChart.destroy()

const gradient=ctx.createLinearGradient(0,0,0,400)
gradient.addColorStop(0,"#60a5fa")
gradient.addColorStop(1,"#1e293b")

stackedChart=new Chart(ctx,{
type:"bar",
data:{
labels:labels,
datasets:[{
label:"Emission by Energy",
data:values,
backgroundColor:gradient
}]
},
plugins:[ChartDataLabels],
options:{
plugins:{
datalabels:{
color:"#fff",
anchor:"end",
align:"top",
formatter:v=>v.toFixed(2)
}
},
scales:{y:{beginAtZero:true}}
}
})

}

function renderTrend(data,facility,month){

if(facility!=="all"){
data=data.filter(d=>d.facility_name===facility)
}

if(month!=="all"){

const value=data
.filter(r=>r.month===month)
.reduce((sum,r)=>sum+Number(r.total_emission),0)

drawTrend([month],[value])

}else{

const months=[...new Set(data.map(d=>d.month))].sort()

const values=months.map(m=>{
return data
.filter(r=>r.month===m)
.reduce((sum,r)=>sum+Number(r.total_emission),0)
})

drawTrend(months,values)

}

}

function drawTrend(labels,values){

const ctx=document.getElementById("trendChart").getContext("2d")

if(trendChart) trendChart.destroy()

const gradient=ctx.createLinearGradient(0,0,0,400)
gradient.addColorStop(0,"#22c55e")
gradient.addColorStop(1,"#020617")

trendChart=new Chart(ctx,{
type:"line",
data:{
labels:labels.map(m=>{
const d=new Date(m)
return d.toLocaleString("en",{month:"short"})
}),
datasets:[{
label:"Emission Trend",
data:values,
borderColor:"#22c55e",
backgroundColor:gradient,
fill:true,
tension:0.4
}]
}
})

}

function renderFacilityComparison(data){

const facilities=[...new Set(data.map(d=>d.facility_name))]

const values=facilities.map(f=>{
return data
.filter(r=>r.facility_name===f)
.reduce((sum,r)=>sum+Number(r.total_emission),0)
})

const ctx=document.getElementById("facilityChart").getContext("2d")

if(facilityChart) facilityChart.destroy()

facilityChart=new Chart(ctx,{
type:"bar",
data:{
labels:facilities,
datasets:[{
label:"Facility Emission",
data:values,
backgroundColor:"#f97316"
}]
},
options:{scales:{y:{beginAtZero:true}}}
})

}

function renderAI(data){

const electricity=data
.filter(d=>d.energy_type_record==="electricity")
.reduce((sum,r)=>sum+Number(r.total_usage),0)

let message="Energy usage efficient."

if(electricity>300){
message="AI Insight: Electricity usage high. Consider renewable energy."
}

document.getElementById("ai-recommend").innerText=message

}

loadDashboard()
