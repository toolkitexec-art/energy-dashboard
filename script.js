import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabase = createClient(
"https://otzxkvdkpbsyrbiqtbjd.supabase.co",
"sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"
)

let dataset=[]

async function loadData(){

const {data,error} = await supabase
.from("dashboard_phase2_final_named")
.select("*")

if(error){
console.log(error)
return
}

dataset=data

populateFacilityFilter()

updateDashboard()

}

function populateFacilityFilter(){

const facilities=[...new Set(dataset.map(d=>d.facility_id))]

const select=document.getElementById("facilityFilter")

select.innerHTML='<option value="all">All Facilities</option>'

facilities.forEach(f=>{
select.innerHTML+="<option value="${f}">${f}</option>"
})

}

function getFilteredData(){

const facility=document.getElementById("facilityFilter").value
const energy=document.getElementById("energyFilter").value

return dataset.filter(d=>{
return (facility==="all"||d.facility_id==facility) &&
(energy==="all"||d.energy_type_record==energy)
})

}

function updateDashboard(){

const data=getFilteredData()

const totalEnergy=data.reduce((s,r)=>s+Number(r.total_usage),0)
const totalCost=data.reduce((s,r)=>s+Number(r.total_cost),0)
const totalCO2=data.reduce((s,r)=>s+Number(r.total_emission),0)

document.getElementById("kpiEnergy").innerText=Math.round(totalEnergy)
document.getElementById("kpiCost").innerText="$"+Math.round(totalCost)
document.getElementById("kpiCO2").innerText=Math.round(totalCO2)

const efficiency=Math.round((totalEnergy/(totalEnergy+totalCO2))*100)

document.getElementById("kpiEfficiency").innerText=efficiency+"%"

renderTrend(data)
renderMix(data)
renderCost(data)
renderCarbon(data)

}

function renderTrend(data){

const months=[...new Set(data.map(d=>d.month.substring(0,7)))]

const values=months.map(m=>{
return data
.filter(x=>x.month.startsWith(m))
.reduce((s,r)=>s+Number(r.total_usage),0)
})

new Chart(document.getElementById("trendChart"),{

type:'line',

data:{
labels:months,
datasets:[{
data:values,
borderColor:'#24E0C7',
tension:.4
}]
}

})

}

function renderMix(data){

const types=[...new Set(data.map(d=>d.energy_type_record))]

const values=types.map(t=>{
return data
.filter(x=>x.energy_type_record===t)
.reduce((s,r)=>s+Number(r.total_usage),0)
})

new Chart(document.getElementById("mixChart"),{

type:'doughnut',

data:{
labels:types,
datasets:[{
data:values
}]
}

})

}

function renderCost(data){

const months=[...new Set(data.map(d=>d.month.substring(0,7)))]

const values=months.map(m=>{
return data
.filter(x=>x.month.startsWith(m))
.reduce((s,r)=>s+Number(r.total_cost),0)
})

new Chart(document.getElementById("costChart"),{

type:'bar',

data:{
labels:months,
datasets:[{
data:values,
backgroundColor:'#FF8C2B'
}]
}

})

}

function renderCarbon(data){

const months=[...new Set(data.map(d=>d.month.substring(0,7)))]

const values=months.map(m=>{
return data
.filter(x=>x.month.startsWith(m))
.reduce((s,r)=>s+Number(r.total_emission),0)
})

new Chart(document.getElementById("carbonChart"),{

type:'line',

data:{
labels:months,
datasets:[{
data:values,
borderColor:'#FF4D6D'
}]
}

})

}

document.getElementById("facilityFilter").onchange=updateDashboard
document.getElementById("energyFilter").onchange=updateDashboard

loadData()
