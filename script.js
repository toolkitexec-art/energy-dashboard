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
const INDUSTRY_AVG=0.42

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

const facilities=[...new Set(data.map(d=>d.facility_name))]

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

renderBenchmark(filtered)
renderEfficiency(filtered)
renderReduction(filtered)
renderSaving(filtered)

renderAI(filtered)

}

function renderKPI(data){

const usage=data.reduce((s,r)=>s+Number(r.total_usage),0)
const cost=data.reduce((s,r)=>s+Number(r.total_cost),0)
const emission=data.reduce((s,r)=>s+Number(r.total_emission),0)

document.getElementById("kpi-container").innerHTML=

`<div class="kpi-card">Total Usage<br>${usage.toFixed(2)}</div>
<div class="kpi-card">Total Cost<br>$${cost.toFixed(2)}</div>
<div class="kpi-card">Total Emission<br>${emission.toFixed(2)}</div>`

}

function renderCarbonImpact(data){

const emission=data.reduce((s,r)=>s+Number(r.total_emission),0)

const cost=emission*CARBON_PRICE

document.getElementById("carbon-impact").innerHTML=
`Estimated Carbon Cost: <b>$${cost.toFixed(2)}</b>`

}

function renderBenchmark(data){

const usage=data.reduce((s,r)=>s+Number(r.total_usage),0)
const emission=data.reduce((s,r)=>s+Number(r.total_emission),0)

const intensity=emission/usage

const compare=((intensity-INDUSTRY_AVG)/INDUSTRY_AVG)*100

document.getElementById("benchmark-value").innerHTML=
`Emission Intensity: ${intensity.toFixed(2)}<br>
Industry Avg: ${INDUSTRY_AVG}<br>
Difference: ${compare.toFixed(1)}%`

}

function renderEfficiency(data){

const usage=data.reduce((s,r)=>s+Number(r.total_usage),0)
const emission=data.reduce((s,r)=>s+Number(r.total_emission),0)

const score=100-(emission/usage*100)

document.getElementById("efficiency-score").innerHTML=
`Score: ${Math.max(0,score).toFixed(1)}/100`

}

function renderReduction(data){

const emission=data.reduce((s,r)=>s+Number(r.total_emission),0)

const potential=emission*0.12

document.getElementById("reduction-ai").innerHTML=
`Potential Reduction: ${potential.toFixed(2)} tCO₂`

}

function renderSaving(data){

const emission=data.reduce((s,r)=>s+Number(r.total_emission),0)

const potential=emission*0.12

const saving=potential*CARBON_PRICE

document.getElementById("saving-ai").innerHTML=
`Potential Saving: $${saving.toFixed(2)}`

}

function renderStack(data){

const labels=[...new Set(data.map(d=>d.energy_type_record))]

const values=labels.map(type=>{
return data
.filter(r=>r.energy_type_record===type)
.reduce((s,r)=>s+Number(r.total_emission),0)
})

const total=values.reduce((a,b)=>a+b,0)

document.getElementById("energy-total").innerText=total.toFixed(2)

const ctx=document.getElementById("stackedChart").getContext("2d")

if(stackedChart) stackedChart.destroy()

stackedChart=new Chart(ctx,{
type:"bar",
data:{labels:labels,datasets:[{data:values,backgroundColor:"#6366f1"}]},
plugins:[ChartDataLabels]
})

}

function renderTrend(data,facility,month){

if(facility!=="all"){
data=data.filter(d=>d.facility_name===facility)
}

if(month!=="all"){
data=data.filter(d=>d.month===month)
}

const months=[...new Set(data.map(d=>d.month))].sort()

const values=months.map(m=>{
return data.filter(r=>r.month===m)
.reduce((s,r)=>s+Number(r.total_emission),0)
})

const ctx=document.getElementById("trendChart").getContext("2d")

if(trendChart) trendChart.destroy()

trendChart=new Chart(ctx,{
type:"line",
data:{labels:months,datasets:[{data:values,borderColor:"#22c55e"}]}
})

}

function renderFacilityComparison(data){

const facilities=[...new Set(data.map(d=>d.facility_name))]

const values=facilities.map(f=>{
return data.filter(r=>r.facility_name===f)
.reduce((s,r)=>s+Number(r.total_emission),0)
})

const ctx=document.getElementById("facilityChart").getContext("2d")

if(facilityChart) facilityChart.destroy()

facilityChart=new Chart(ctx,{
type:"bar",
data:{labels:facilities,datasets:[{data:values,backgroundColor:"#f97316"}]}
})

}

function renderAI(data){

const electricity=data
.filter(d=>d.energy_type_record==="electricity")
.reduce((s,r)=>s+Number(r.total_usage),0)

let message="Energy usage efficient."

if(electricity>300){
message="AI Insight: electricity consumption high. Consider renewable transition."
}

document.getElementById("ai-recommend").innerText=message

}

loadDashboard()
