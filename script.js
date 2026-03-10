import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL="https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY="sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)

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

renderKPI(data)
renderTrend(data)
renderMix(data)

}

function renderKPI(data){

const totalUsage=data.reduce((s,r)=>s+Number(r.total_usage),0)
const totalCost=data.reduce((s,r)=>s+Number(r.total_cost),0)
const totalEmission=data.reduce((s,r)=>s+Number(r.total_emission),0)

const container=document.getElementById("kpi-container")

container.innerHTML=`

<div class="kpi-card">
<div class="kpi-title">Total Consumption</div>
<div class="kpi-value">${totalUsage.toFixed(0)}</div>
</div>

<div class="kpi-card">
<div class="kpi-title">Cost</div>
<div class="kpi-value">$${totalCost.toFixed(0)}</div>
</div>

<div class="kpi-card">
<div class="kpi-title">CO₂ Emission</div>
<div class="kpi-value">${totalEmission.toFixed(2)}</div>
</div>

<div class="kpi-card">
<div class="kpi-title">Efficiency</div>
<div class="kpi-value">87%</div>
</div>

`
}

function renderTrend(data){

const months=[...new Set(data.map(d=>d.month.substring(0,7)))]

const values=months.map(m=>
data
.filter(r=>r.month.startsWith(m))
.reduce((s,r)=>s+Number(r.total_usage),0)
)

new Chart(document.getElementById("trendChart"),{

type:"line",

data:{
labels:months,
datasets:[{
label:"Monthly Usage",
data:values,
borderColor:"#4cc9f0",
backgroundColor:"rgba(76,201,240,0.2)",
fill:true,
tension:0.4
}]
}

})

}

function renderMix(data){

const types=[...new Set(data.map(d=>d.energy_type_record))]

const values=types.map(t=>
data
.filter(r=>r.energy_type_record===t)
.reduce((s,r)=>s+Number(r.total_usage),0)
)

new Chart(document.getElementById("mixChart"),{

type:"doughnut",

data:{
labels:types,
datasets:[{
data:values,
backgroundColor:[
"#4cc9f0",
"#ff6b6b",
"#ffd166",
"#06d6a0",
"#9b5de5",
"#f72585"
]
}]
},

options:{
cutout:"60%"
}

})

}

loadDashboard()
