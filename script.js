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

/* =========================
EMISSION TREND CHART
ORANGE GRADIENT
========================= */

function renderTrendChart(data){

    const months=[...new Set(data.map(d=>d.month))].sort()

    const values=months.map(m=>{
        return data.filter(r=>r.month===m)
            .reduce((s,r)=>s+Number(r.total_emission||0),0)
    })

    const monthLabels=months.map(m=>{
        const date=new Date(m)
        return date.toLocaleString("en",{month:"long"})
    })

    const ctx=document.getElementById("trendChart").getContext("2d")

    if(trendChart) trendChart.destroy()

    const gradient=ctx.createLinearGradient(0,0,0,400)

    gradient.addColorStop(0,"rgba(251,146,60,0.9)")
    gradient.addColorStop(0.5,"rgba(249,115,22,0.7)")
    gradient.addColorStop(1,"rgba(2,6,23,0.9)")

    trendChart=new Chart(ctx,{
        type:"line",
        data:{
            labels:monthLabels,
            datasets:[{
                data:values,
                borderColor:"#fb923c",
                backgroundColor:gradient,
                fill:true,
                tension:0.4,
                borderWidth:3,
                pointBackgroundColor:"#fb923c",
                pointBorderColor:"#ffffff",
                pointRadius:4
            }]
        },
        options:{
            plugins:{legend:{display:false}}
        }
    })
}

/* =========================
FACILITY CHART
========================= */

function renderFacilityChart(data){

    const facilities=[...new Set(data.map(d=>d.facility_name))]

    const values=facilities.map(f=>{
        return data.filter(r=>r.facility_name===f)
            .reduce((s,r)=>s+Number(r.total_emission||0),0)
    })

    const ctx=document.getElementById("facilityChart").getContext("2d")

    if(facilityChart) facilityChart.destroy()

    const gradient=ctx.createLinearGradient(0,0,0,400)

    gradient.addColorStop(0,"#fb923c")
    gradient.addColorStop(1,"#7c2d12")

    facilityChart=new Chart(ctx,{
        type:"bar",
        data:{
            labels:facilities,
            datasets:[{
                data:values,
                backgroundColor:gradient,
                borderRadius:6
            }]
        },
        options:{
            plugins:{legend:{display:false}},
            scales:{y:{beginAtZero:true}}
        }
    })
}

/* =========================
EXPORT PDF
========================= */

function createExportButton(){

    const btn=document.createElement("button")

    btn.innerText="Export PDF"

    btn.style.position="fixed"
    btn.style.top="30px"
    btn.style.right="40px"
    btn.style.padding="10px 16px"
    btn.style.borderRadius="10px"
    btn.style.border="1px solid #334155"
    btn.style.background="linear-gradient(135deg,#3b82f6,#1e3a8a)"
    btn.style.color="white"
    btn.style.fontWeight="600"
    btn.style.cursor="pointer"
    btn.style.zIndex="999"

    btn.addEventListener("click",exportPDF)

    document.body.appendChild(btn)
}

function loadPDFLibrary(){

    return new Promise((resolve)=>{

        if(window.html2pdf){
            resolve()
            return
        }

        const script=document.createElement("script")

        script.src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"

        script.onload=()=>resolve()

        document.body.appendChild(script)

    })
}

async function exportPDF(){

    await loadPDFLibrary()

    const container=document.createElement("div")

    container.appendChild(document.getElementById("kpi-container").cloneNode(true))
    container.appendChild(document.querySelector(".analytics-grid").cloneNode(true))
    container.appendChild(document.getElementById("stackedChart").cloneNode(true))
    container.appendChild(document.getElementById("trendChart").cloneNode(true))
    container.appendChild(document.getElementById("facilityChart").cloneNode(true))

    const opt={
        margin:0.3,
        filename:"helixon-energy-report.pdf",
        image:{type:"jpeg",quality:0.98},
        html2canvas:{scale:2,useCORS:true},
        jsPDF:{unit:"in",format:"a4",orientation:"portrait"}
    }

    html2pdf().set(opt).from(container).save()
}

loadDashboard()
