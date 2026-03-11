import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabase = createClient(
"https://otzxkvdkpbsyrbiqtbjd.supabase.co",
"sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"
)

let dataset = []

async function loadData(){

const { data, error } = await supabase
.from("energy_consumption")
.select("*")

if(error){
console.log(error)
return
}

dataset = data

populateDepartmentFilter()

updateDashboard()

}

function populateDepartmentFilter(){

const departments=[...new Set(dataset.map(d=>d.department))]

const select=document.getElementById("facilityFilter")

select.innerHTML='<option value="all">All Departments</option>'

departments.forEach(f=>{
select.innerHTML+="<option value="${f}">${f}</option>"
})

}

function getFilteredData(){

const department=document.getElementById("facilityFilter").value

return dataset.filter(d=>{
return department==="all" || d.department==department
})

}

function updateDashboard(){

const data=getFilteredData()

const totalEnergy=data.reduce((s,r)=>s+Number(r.quantity||0),0)
const totalEmission=data.reduce((s,r)=>s+Number(r.total_emission||0),0)

document.getElementById("kpiEnergy").innerText=Math.round(totalEnergy)
document.getElementById("kpiCO2").innerText=Math.round(totalEmission)

renderTrend(data)
renderMix(data)

}

function renderTrend(data){

const months=[...new Set(data.map(d=>d.date.substring(0,7)))]

const values=months.map(m=>{
return data
.filter(x=>x.date.startsWith(m))
.reduce((s,r)=>s+Number(r.quantity||0),0)
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

const types=[...new Set(data.map(d=>d.energy_type))]

const values=types.map(t=>{
return data
.filter(x=>x.energy_type===t)
.reduce((s,r)=>s+Number(r.quantity||0),0)
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

document.getElementById("facilityFilter").onchange=updateDashboard

loadData()
