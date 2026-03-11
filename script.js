import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL =
"https://otzxkvdkpbsyrbiqtbjd.supabase.co"

const SUPABASE_KEY =
"sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase =
createClient(SUPABASE_URL,SUPABASE_KEY)

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

document.getElementById("loading").style.display="none"

renderKPI(data)
renderStack(data)
renderTrend(data)
renderAI(data)

}

function renderKPI(data){

const totalUsage =
data.reduce((sum,r)=> sum + Number(r.total_usage),0)

const totalCost =
data.reduce((sum,r)=> sum + Number(r.total_cost),0)

const totalEmission =
data.reduce((sum,r)=> sum + Number(r.total_emission),0)

document.getElementById("kpi-container").innerHTML = `

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

const labels =
[...new Set(data.map(d=>d.energy_type_record))]

const values =
labels.map(type=>{

return data
.filter(r=>r.energy_type_record===type)
.reduce((sum,r)=> sum + Number(r.total_emission),0)

})

const ctx =
document.getElementById("stackedChart").getContext("2d")

const gradient =
ctx.createLinearGradient(0,0,0,400)

gradient.addColorStop(0,"#22c55e")
gradient.addColorStop(1,"#3b82f6")

new Chart(ctx,{

type:"bar",

data:{
labels:labels,
datasets:[{
label:"Emission by Energy Type",
data:values,
backgroundColor:gradient
}]
},

plugins:[ChartDataLabels],

options:{

plugins:{

datalabels:{
color:"#ffffff",
anchor:"end",
align:"top",
font:{
weight:"bold",
size:12
},
formatter:(value)=>{
return value.toFixed(2)
}
}

},

scales:{
y:{
beginAtZero:true
}
}

}

})

}

function renderTrend(data){

const months =
[...new Set(data.map(d=>d.month.substring(0,7)))]

const values =
months.map(m=>{

return data
.filter(r=>r.month.startsWith(m))
.reduce((sum,r)=> sum + Number(r.total_emission),0)

})

const ctx =
document.getElementById("trendChart").getContext("2d")

const gradient =
ctx.createLinearGradient(0,0,0,400)

gradient.addColorStop(0,"#60a5fa")
gradient.addColorStop(1,"#1e293b")

new Chart(ctx,{

type:"line",

data:{
labels:months,
datasets:[{
label:"Emission Trend",
data:values,
borderColor:"#60a5fa",
backgroundColor:gradient,
fill:true
}]
}

})

}

function renderAI(data){

const electricity =
data.filter(d=>d.energy_type_record==="electricity")
.reduce((sum,r)=> sum + Number(r.total_usage),0)

let message="Energy usage is efficient."

if(electricity>300){

message =
"AI Insight: Electricity usage high. Consider solar or efficiency upgrade."

}

document.getElementById("ai-recommend").innerText=message

}

loadDashboard()
