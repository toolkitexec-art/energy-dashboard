import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL="https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY="sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)

const facilitySelect=document.getElementById("facility-select")
const monthSelect=document.getElementById("month-select")

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

}

function sum(data,field){
return data.reduce((s,r)=>s+Number(r[field]||0),0)
}

function safeDivide(a,b){
if(!b || b===0) return 0
return a/b
}

function renderKPI(data){

const usage=sum(data,"total_usage")
const cost=sum(data,"total_cost")
const emission=sum(data,"total_emission")

document.getElementById("kpi-container").innerHTML=

`<div class="kpi-card"><b>Total Usage</b><br>${usage.toFixed(2)}</div>
<div class="kpi-card"><b>Total Cost</b><br>$${cost.toFixed(2)}</div>
<div class="kpi-card"><b>Total Emission</b><br>${emission.toFixed(2)}</div>`

}

function renderBenchmark(data){

const usage=sum(data,"total_usage")
const emission=sum(data,"total_emission")

const intensity=safeDivide(emission,usage)

const diff=((intensity-INDUSTRY_AVG)/INDUSTRY_AVG)*100

const element=document.getElementById("benchmark-value")

if(!element) return

element.innerHTML=

`<b>${intensity.toFixed(3)}</b> tCO₂ / unit<br>
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

const element=document.getElementById("efficiency-score")

if(!element) return

element.innerHTML=`<b>${score.toFixed(1)} / 100</b>`

}

function renderReduction(data){

const emission=sum(data,"total_emission")

const reduction=emission*0.12

const element=document.getElementById("reduction-ai")

if(!element) return

element.innerHTML=

`<b>${reduction.toFixed(2)} tCO₂</b><br>Potential reduction`

}

function renderSaving(data){

const emission=sum(data,"total_emission")

const reduction=emission*0.12

const saving=reduction*CARBON_PRICE

const element=document.getElementById("saving-ai")

if(!element) return

element.innerHTML=

`<b>$${saving.toFixed(2)}</b><br>Potential cost saving`

}

loadDashboard()
