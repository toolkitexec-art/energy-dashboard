import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = "https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY = "sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

let rawData=[]

async function loadDashboard(){

const { data, error } = await supabase
.from("dashboard_phase2_final_named")
.select("*")

if(error){
console.log(error)
document.getElementById("loading").innerText="Error loading data"
return
}

if(!data || data.length===0){
document.getElementById("loading").innerText="No data found"
return
}

rawData=data

initFacilityFilter(data)

updateDashboard(data)

document.getElementById("loading").style.display="none"

}

function initFacilityFilter(data){

const facilities=[...new Set(data.map(d=>d.facility_name_display))]

const select=document.getElementById("facilityFilter")

select.innerHTML='<option value="all">All Facilities</option>'

facilities.forEach(f=>{
select.innerHTML+=`<option value="${f}">${f}</option>`
})

select.addEventListener("change",()=>{

let filtered=data

if(select.value!=="all"){
filtered=data.filter(d=>d.facility_name_display===select.value)
}

updateDashboard(filtered)

})

}

function updateDashboard(data){

renderKPI(data)
renderEnergyMix(data)
renderTrend(data)
renderCost(data)
renderIntensity(data)

}

function renderKPI(data){

const totalUsage=data.reduce((s,r)=>s+Number(r.total_usage),0)
const totalCost=data.reduce((s,r)=>s+Number(r.total_cost),0)
const totalEmission=data.reduce((s,r)=>s+Number(r.total_emission),0)

document.getElementById("kpi-container").innerHTML=`

<div class="kpi-card">
<div class="kpi-title">Energy Usage</div>
<div class="kpi-value">${totalUsage.toFixed(0)}</div>
</div>

<div class="kpi-card">
<div class="kpi-title">Energy Cost</div>
<div class="kpi-value">$${totalCost.toFixed(0)}</div>
</div>

<div class="kpi-card">
<div class="kpi-title">Carbon Emission</div>
<div class="kpi-value">${totalEmission.toFixed(2)}</div>
</div>

`

}

function renderEnergyMix(data){

const labels=[...new Set(data.map(d=>d.energy_type_record))]

const values=labels.map(type=>{
return data
.filter(r=>r.energy_type_record===type)
.reduce((s,r)=>s+Number(r.total_emission),0)
})

new Chart(document.getElementById("stackedChart"),{
type:"bar",
data:{labels:labels,datasets:[{label:"Emission",data:values}]}
})

}

function renderTrend(data){

const months=[...new Set(data.map(d=>d.month.substring(0,7)))]

const values=months.map(m=>{
return data
.filter(r=>r.month.startsWith(m))
.reduce((s,r)=>s+Number(r.total_emission),0)
})

new Chart(document.getElementById("trendChart"),{
type:"line",
data:{labels:months,datasets:[{label:"Emission",data:values}]}
})

}

function renderCost(data){

const labels=[...new Set(data.map(d=>d.energy_type_record))]

const values=labels.map(type=>{
return data
.filter(r=>r.energy_type_record===type)
.reduce((s,r)=>s+Number(r.total_cost),0)
})

new Chart(document.getElementById("costChart"),{
type:"pie",
data:{labels:labels,datasets:[{data:values}]}
})

}

function renderIntensity(data){

const months=[...new Set(data.map(d=>d.month.substring(0,7)))]

const values=months.map(m=>{

const usage=data
.filter(r=>r.month.startsWith(m))
.reduce((s,r)=>s+Number(r.total_usage),0)

const emission=data
.filter(r=>r.month.startsWith(m))
.reduce((s,r)=>s+Number(r.total_emission),0)

return emission/usage

})

new Chart(document.getElementById("intensityChart"),{
type:"line",
data:{labels:months,datasets:[{label:"Carbon Intensity",data:values}]}
})

}

loadDashboard()
