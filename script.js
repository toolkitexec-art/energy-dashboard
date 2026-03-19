import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL="https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY="sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)

// SAFE ELEMENT (anti null)
const facilitySelect=document.getElementById("facility-select") || { value:"all", innerHTML:"", addEventListener:()=>{} }
const monthSelect=document.getElementById("month-select") || { value:"all", innerHTML:"", addEventListener:()=>{} }

let energyChart
let trendChart
let facilityChart

const INDUSTRY_AVG=0.42
const CARBON_PRICE=85

async function loadDashboard(){
    console.log("START LOAD DASHBOARD")

    const {data,error}=await supabase
        .from("dashboard_phase2_final_named")
        .select("*")

    console.log("DATA:", data)
    console.log("ERROR:", error)

    if(error){
        console.log("SUPABASE ERROR:", error)
        return
    }

    if(!data || data.length===0){
        console.log("DATA KOSONG")
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

/* KPI */
function renderKPI(data){
    const el=document.getElementById("kpi-container")
    if(!el) return

    const usage=sum(data,"total_usage")
    const cost=sum(data,"total_cost")
    const emission=sum(data,"total_emission")

    el.innerHTML=
    `<div class="kpi-card"><b>Total Usage</b><br>${usage.toFixed(2)}</div>
     <div class="kpi-card"><b>Total Cost</b><br>$${cost.toFixed(2)}</div>
     <div class="kpi-card"><b>Total Emission</b><br>${emission.toFixed(2)}</div>`
}

/* PANELS */
function renderBenchmark(data){
    const el=document.getElementById("benchmark-value")
    if(!el) return

    const usage=sum(data,"total_usage")
    const emission=sum(data,"total_emission")
    const intensity=safeDivide(emission,usage)
    const diff=((intensity-INDUSTRY_AVG)/INDUSTRY_AVG)*100

    el.innerHTML=`<b>${intensity.toFixed(3)}</b><br>Diff ${diff.toFixed(1)}%`
}

function renderEfficiency(data){
    const el=document.getElementById("efficiency-score")
    if(!el) return

    const usage=sum(data,"total_usage")
    const emission=sum(data,"total_emission")
    let score=100-(safeDivide(emission,usage)*100)
    score=Math.min(Math.max(score,0),100)

    el.innerHTML=`<b>${score.toFixed(1)}</b>`
}

function renderReduction(data){
    const el=document.getElementById("reduction-ai")
    if(!el) return

    const emission=sum(data,"total_emission")
    const reduction=emission*0.12

    el.innerHTML=`${reduction.toFixed(2)}`
}

function renderSaving(data){
    const el=document.getElementById("saving-ai")
    if(!el) return

    const emission=sum(data,"total_emission")
    const saving=(emission*0.12)*CARBON_PRICE

    el.innerHTML=`$${saving.toFixed(2)}`
}

/* CHARTS SAFE */
function renderEnergyChart(data){
    const canvas=document.getElementById("stackedChart")
    if(!canvas) return

    const ctx=canvas.getContext("2d")

    const labels=[...new Set(data.map(d=>d.energy_type_record))]
    const values=labels.map(type=>{
        return data.filter(r=>r.energy_type_record===type)
            .reduce((s,r)=>s+Number(r.total_emission||0),0)
    })

    if(energyChart) energyChart.destroy()

    energyChart=new Chart(ctx,{
        type:"bar",
        data:{labels,datasets:[{data:values}]},
        options:{plugins:{legend:{display:false}}}
    })
}

function renderTrendChart(data){
    const canvas=document.getElementById("trendChart")
    if(!canvas) return

    const ctx=canvas.getContext("2d")

    const months=[...new Set(data.map(d=>d.month))].sort()
    const values=months.map(m=>data.filter(r=>r.month===m)
        .reduce((s,r)=>s+Number(r.total_emission||0),0))

    if(trendChart) trendChart.destroy()

    trendChart=new Chart(ctx,{
        type:"line",
        data:{labels:months,datasets:[{data:values}]}
    })
}

function renderFacilityChart(data){
    const canvas=document.getElementById("facilityChart")
    if(!canvas) return

    const ctx=canvas.getContext("2d")

    const facilities=[...new Set(data.map(d=>d.facility_name))]
    const values=facilities.map(f=>data.filter(r=>r.facility_name===f)
        .reduce((s,r)=>s+Number(r.total_emission||0),0))

    if(facilityChart) facilityChart.destroy()

    facilityChart=new Chart(ctx,{
        type:"bar",
        data:{labels:facilities,datasets:[{data:values}]}
    })
}

/* EXPORT SAFE */
function createExportButton(){
    if(document.getElementById("export-btn")) return

    const btn=document.createElement("button")
    btn.id="export-btn"
    btn.innerText="Export PDF"
    btn.style.position="fixed"
    btn.style.top="20px"
    btn.style.right="20px"
    btn.style.zIndex="999"

    btn.addEventListener("click",()=>alert("Export ready"))

    document.body.appendChild(btn)
}

loadDashboard()
