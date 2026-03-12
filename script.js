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

renderBenchmark(filtered)
renderEfficiency(filtered)
renderReduction(filtered)
renderSaving(filtered)

renderEnergyChart(filtered)
renderTrendChart(filtered)
renderFacilityChart(filtered)

}


function sum(data,field){
return data.reduce((s,r)=>s+Number(r[field]||0),0)
}

function safeDivide(a,b){
if(!b||b===0) return 0
return a/b
}


/* KPI FIXED LAYOUT */

function renderKPI(data){

const usage=sum(data,"total_usage")
const cost=sum(data,"total_cost")
const emission=sum(data,"total_emission")

document.getElementById("kpi-container").innerHTML=

`
<div style="display:flex;flex-direction:column;gap:14px;margin-bottom:30px">

<div style="
padding:18px;
border-radius:12px;
background:linear-gradient(135deg,#1e293b,#020617);
border:1px solid #334155;
box-shadow:0 10px 30px rgba(0,0,0,.4);
font-size:16px;
">
<b>Total Usage</b><br>${usage.toFixed(2)}
</div>

<div style="
padding:18px;
border-radius:12px;
background:linear-gradient(135deg,#1e293b,#020617);
border:1px solid #334155;
box-shadow:0 10px 30px rgba(0,0,0,.4);
font-size:16px;
">
<b>Total Cost</b><br>$${cost.toFixed(2)}
</div>

<div style="
padding:18px;
border-radius:12px;
background:linear-gradient(135deg,#1e293b,#020617);
border:1px solid #334155;
box-shadow:0 10px 30px rgba(0,0,0,.4);
font-size:16px;
">
<b>Total Emission</b><br>${emission.toFixed(2)}
</div>

</div>
`

}


function renderBenchmark(data){

const usage=sum(data,"total_usage")
const emission=sum(data,"total_emission")

const intensity=safeDivide(emission,usage)
const diff=((intensity-INDUSTRY_AVG)/INDUSTRY_AVG)*100

const el=document.getElementById("benchmark-value")

el.innerHTML=`<b>${intensity.toFixed(3)}</b> tCO₂ / unit<br>
Industry Avg: ${INDUSTRY_AVG}<br>
Difference: ${diff.toFixed(1)}%`

}


function renderEfficiency(data){

const usage=sum(data,"total_usage")
const emission=sum(data,"total_emission")

const intensity=safeDivide(emission,usage)

let score=100-(intensity*100)

if(score<0) score=0
if(score>100) score=100

const el=document.getElementById("efficiency-score")

el.innerHTML=`<b>${score.toFixed(1)} / 100</b>`

}


function renderReduction(data){

const emission=sum(data,"total_emission")
const reduction=emission*0.12

const el=document.getElementById("reduction-ai")

el.innerHTML=`<b>${reduction.toFixed(2)} tCO₂</b><br>Potential reduction`

}


function renderSaving(data){

const emission=sum(data,"total_emission")
const reduction=emission*0.12
const saving=reduction*CARBON_PRICE

const el=document.getElementById("saving-ai")

el.innerHTML=`<b>$${saving.toFixed(2)}</b><br>Potential cost saving`

}


function renderEnergyChart(data){

const labels=[...new Set(data.map(d=>d.energy_type_record))]

const values=labels.map(type=>{
return data
.filter(r=>r.energy_type_record===type)
.reduce((s,r)=>s+Number(r.total_emission||0),0)
})

const total=values.reduce((a,b)=>a+b,0)

document.getElementById("energy-total").innerText=total.toFixed(2)

const ctx=document.getElementById("stackedChart").getContext("2d")

if(energyChart) energyChart.destroy()

const gradient=ctx.createLinearGradient(0,0,0,400)
gradient.addColorStop(0,"#60a5fa")
gradient.addColorStop(1,"#1e293b")

energyChart=new Chart(ctx,{
type:"bar",
data:{
labels:labels,
datasets:[{
data:values,
backgroundColor:gradient,
borderRadius:6
}]
},
plugins:[ChartDataLabels],
options:{
plugins:{
legend:{display:false},
datalabels:{
color:"#e5e7eb",
anchor:"end",
align:"top",
formatter:(v)=>v.toFixed(2)
}
},
scales:{y:{beginAtZero:true}}
}
})

}


function renderTrendChart(data){

const months=[...new Set(data.map(d=>d.month))].sort()

const values=months.map(m=>{
return data.filter(r=>r.month===m)
.reduce((s,r)=>s+Number(r.total_emission||0),0)
})

const ctx=document.getElementById("trendChart").getContext("2d")

if(trendChart) trendChart.destroy()

trendChart=new Chart(ctx,{
type:"line",
data:{
labels:months,
datasets:[{
data:values,
borderColor:"#22c55e",
fill:false,
tension:0.4
}]
},
options:{
plugins:{legend:{display:false}}
}
})

}


function renderFacilityChart(data){

const facilities=[...new Set(data.map(d=>d.facility_name))]

const values=facilities.map(f=>{
return data.filter(r=>r.facility_name===f)
.reduce((s,r)=>s+Number(r.total_emission||0),0)
})

const ctx=document.getElementById("facilityChart").getContext("2d")

if(facilityChart) facilityChart.destroy()

facilityChart=new Chart(ctx,{
type:"bar",
data:{
labels:facilities,
datasets:[{
data:values,
backgroundColor:"#fb923c",
borderRadius:6
}]
},
options:{
plugins:{legend:{display:false}},
scales:{y:{beginAtZero:true}}
}
})

}

loadDashboard()
