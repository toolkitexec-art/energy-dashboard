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
    createExportButton()
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

/* =========================
RENDER KPI
========================= */

function renderKPI(data){

    const usage=sum(data,"total_usage")
    const cost=sum(data,"total_cost")
    const emission=sum(data,"total_emission")

    const kpiGradient="linear-gradient(135deg,#7c2d12,#020617)"

    document.getElementById("kpi-container").innerHTML=

    `<div class="kpi-card" style="background:${kpiGradient}">
        <b>Total Usage</b><br>${usage.toFixed(2)}
    </div>

    <div class="kpi-card" style="background:${kpiGradient}">
        <b>Total Cost</b><br>$${cost.toFixed(2)}
    </div>

    <div class="kpi-card" style="background:${kpiGradient}">
        <b>Total Emission</b><br>${emission.toFixed(2)}
    </div>`
}

/* =========================
ANALYTICS PANELS
========================= */

function renderBenchmark(data){

    const usage=sum(data,"total_usage")
    const emission=sum(data,"total_emission")

    const intensity=safeDivide(emission,usage)

    const diff=((intensity-INDUSTRY_AVG)/INDUSTRY_AVG)*100

    const el=document.getElementById("benchmark-value")

    el.innerHTML=
    `<b>${intensity.toFixed(3)}</b> tCO₂ / unit<br>
    Industry Avg: ${INDUSTRY_AVG}<br>
    Difference: ${diff.toFixed(1)}%`

    el.parentElement.style.background="linear-gradient(135deg,#14532d,#020617)"
    el.parentElement.style.border="1px solid #334155"
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

    el.parentElement.style.background="linear-gradient(135deg,#1e3a8a,#020617)"
    el.parentElement.style.border="1px solid #1d4ed8"
}

function renderReduction(data){

    const emission=sum(data,"total_emission")

    const reduction=emission*0.12

    const el=document.getElementById("reduction-ai")

    el.innerHTML=
    `<b>${reduction.toFixed(2)} tCO₂</b><br>
    Potential reduction`

    el.parentElement.style.background="linear-gradient(135deg,#14532d,#020617)"
    el.parentElement.style.border="1px solid #22c55e"
}

function renderSaving(data){

    const emission=sum(data,"total_emission")

    const reduction=emission*0.12

    const saving=reduction*CARBON_PRICE

    const el=document.getElementById("saving-ai")

    el.innerHTML=
    `<b>$${saving.toFixed(2)}</b><br>
    Potential cost saving`

    el.parentElement.style.background="linear-gradient(135deg,#14532d,#020617)"
    el.parentElement.style.border="1px solid #f97316"
}

/* =========================
ENERGY TYPE CHART
========================= */

function renderEnergyChart(data){

    const labels=[...new Set(data.map(d=>d.energy_type_record))]

    const values=labels.map(type=>{
        return data.filter(r=>r.energy_type_record===type)
            .reduce((s,r)=>s+Number(r.total_emission||0),0)
    })

    const total=values.reduce((a,b)=>a+b,0)

    document.getElementById("energy-total").innerText=total.toFixed(2)

    const ctx=document.getElementById("stackedChart").getContext("2d")

    if(energyChart) energyChart.destroy()

    const gradient=ctx.createLinearGradient(0,0,0,400)

    gradient.addColorStop(0,"#60a5fa")
    gradient.addColorStop(0.5,"#3b82f6")
    gradient.addColorStop(1,"#1e293b")

    energyChart=new Chart(ctx,{
        type:"bar",
        data:{
            labels,
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
                    font:{weight:"600"},
                    formatter:(v)=>v.toFixed(2)
                }
            },
            scales:{y:{beginAtZero:true}}
        }
    })
}



/if(trendImg){

const title=document.createElement("h3")
title.innerText="Emission Trend"

const img=document.createElement("img")
img.src=trendImg
img.style.width="100%"

container.appendChild(title)
container.appendChild(img)

}

/* =========================
SAFE HELIXON PDF EXPORT
PLACE AT VERY BOTTOM OF script.js
========================= */

function loadPDFLibrary(){

return new Promise(resolve=>{

if(window.html2pdf){
resolve()
return
}

const s=document.createElement("script")
s.src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"

s.onload=()=>resolve()

document.body.appendChild(s)

})

}


async function exportPDF(){

await loadPDFLibrary()

const report=document.createElement("div")

report.style.background="#020617"
report.style.color="#e5e7eb"
report.style.padding="40px"
report.style.fontFamily="Inter, sans-serif"


/* HEADER */

const title=document.createElement("h2")
title.innerText="Helixon Energy Intelligence Report"

const date=new Date().toLocaleDateString("en-US",{
year:"numeric",
month:"long",
day:"numeric"
})

const facility=document.getElementById("facility-select")?.value || "All Facilities"
const month=document.getElementById("month-select")?.value || "All Months"

const info=document.createElement("div")
info.innerHTML=`
Report Date: ${date}<br>
Facility Filter: ${facility}<br>
Month Filter: ${month}
`

report.appendChild(title)
report.appendChild(info)


/* COPY DASHBOARD SECTIONS */

const kpi=document.getElementById("kpi-container")
if(kpi) report.appendChild(kpi.cloneNode(true))

const analytics=document.querySelector(".analytics-grid")
if(analytics) report.appendChild(analytics.cloneNode(true))


/* COPY CHART CANVAS AS IMAGE */

document.querySelectorAll("canvas").forEach(canvas=>{

const img=document.createElement("img")

img.src=canvas.toDataURL("image/png")

img.style.width="100%"
img.style.marginTop="20px"

report.appendChild(img)

})


/* PDF OPTIONS */

html2pdf().set({

margin:0.5,
filename:"helixon-energy-report.pdf",

html2canvas:{
scale:2
},

jsPDF:{
unit:"in",
format:"a4",
orientation:"portrait"
}

}).from(report).save()

}


/* CREATE BUTTON */

window.addEventListener("load",()=>{

const btn=document.createElement("button")

btn.innerText="Export PDF"

btn.style.position="fixed"
btn.style.right="40px"
btn.style.top="30px"
btn.style.padding="10px 16px"
btn.style.borderRadius="10px"
btn.style.border="1px solid #334155"
btn.style.background="#1e3a8a"
btn.style.color="white"
btn.style.cursor="pointer"

btn.onclick=exportPDF

document.body.appendChild(btn)

})
