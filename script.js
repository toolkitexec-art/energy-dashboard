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
console.log("ERROR:", error)
return
}

dataset = data

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

return dataset.filter(d=>{
return facility==="all" || d.facility_id==facility
})

}

function updateDashboard(){

const data=getFilteredData()

const totalEnergy=data.reduce((s,r)=>s+Number(r.energy_used||0),0)
const totalCost=data.reduce((s,r)=>s+Number(r.energy_cost||0),0)

document.getElementById("kpiEnergy").innerText=Math.round(totalEnergy)
document.getElementById("kpiCost").innerText="$"+Math.round(totalCost)

renderTrend(data)

}

function renderTrend(data){

const months=[...new Set(data.map(d=>d.month))]

const values=months.map(m=>{
return data
.filter(x=>x.month===m)
.reduce((s,r)=>s+Number(r.energy_used||0),0)
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

document.getElementById("facilityFilter").onchange=updateDashboard

loadData()
