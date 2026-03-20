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

Chart.defaults.devicePixelRatio = 3;

function initRealtime(){
    supabase
        .channel("energy-live")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "energy_records_phase1"
            },
            (payload) => {
                console.log("REALTIME EVENT:", payload);

                // reload dashboard dari VIEW
                loadDashboard();
            }
        )
        .subscribe();
}

/* =========================
LOAD DASHBOARD (VIEW ONLY)
========================= */
async function loadDashboard(){

    console.log("LOADING FROM VIEW...");

    const {data,error}=await supabase
        .from("dashboard_phase2_final_named")
        .select("*");

    if(error){
        console.log("VIEW ERROR:",error);
        return;
    }

    if(!data || data.length===0){
        console.log("VIEW EMPTY");
        return;
    }

    console.log("VIEW DATA:",data);

    populateFilters(data);
    applyFilters(data);
    createExportButton();
}


/* =========================
FILTERS
========================= */
function populateFilters(data){

    const facilities=[...new Set(
        data.map(d=>d.facility_name_display).filter(Boolean)
    )];

    facilities.forEach(f=>{
        facilitySelect.innerHTML+=`<option value="${f}">${f}</option>`
    });

    const months=[...new Set(data.map(d=>d.month))].sort();

    months.forEach(m=>{
        const date=new Date(m);
        const label=date.toLocaleString("en",{month:"long",year:"numeric"});
        monthSelect.innerHTML+=`<option value="${m}">${label}</option>`;
    });

    facilitySelect.addEventListener("change",()=>applyFilters(data));
    monthSelect.addEventListener("change",()=>applyFilters(data));
}

/* =========================
UTILS
========================= */
function sum(data,field){
    return data.reduce((s,r)=>s+Number(r[field]||0),0);
}

function safeDivide(a,b){
    if(!b||b===0) return 0;
    return a/b;
}
/* =========================
AI ENGINE
========================= */
function generateAIInsight(data){

    data = Array.isArray(data) ? data : [];

    const totalUsage = sum(data, "total_usage");
    const totalEmission = sum(data, "total_emission");
    const totalCost = sum(data, "total_cost");

    return {
        summary: `Emission ${totalEmission.toFixed(2)}`,
        diagnosis: `Usage ${totalUsage.toFixed(2)}`,
        anomaly: "-",
        cost: `Cost ${totalCost.toFixed(2)}`,
        action: "Optimize high emission sources"
    };
}
/* =========================
RENDER AI
========================= */

function renderAIInsight(data){

    const el = document.getElementById("ai-insight-panel");
    if(!el) return;

    let insight = {
        summary: "-",
        diagnosis: "-",
        anomaly: "-",
        cost: "-",
        action: "-"
    };

    try {
        insight = generateAIInsight(data || []) || insight;
    } catch (e) {
        console.log("AI ERROR:", e);
    }

    el.innerHTML = `
        <div class="ai-single-card">

            <div class="ai-title">
                🤖 AI Insight Engine
            </div>

            <div class="ai-content">

                <div class="ai-section">
                    <span class="ai-label">Performance Summary</span>
                    <p>${insight.summary}</p>
                </div>

                <div class="ai-section">
                    <span class="ai-label">Efficiency Diagnosis</span>
                    <p>${insight.diagnosis}</p>
                </div>

                <div class="ai-section">
                    <span class="ai-label">Anomaly Detection</span>
                    <p>${insight.anomaly}</p>
                </div>

                <div class="ai-section">
                    <span class="ai-label">Cost Impact Insight</span>
                    <p>${insight.cost}</p>
                </div>

                <div class="ai-section highlight">
                    <span class="ai-label">Action Recommendation</span>
                    <p>${insight.action}</p>
                </div>

            </div>

        </div>
    `;
}


/* =========================
APPLY FILTER
========================= */
function applyFilters(data){

    let facility=facilitySelect.value;
    let month=monthSelect.value;

    let filtered=data;

    if(facility!=="all"){
        filtered=filtered.filter(d=>d.facility_name_display===facility);
    }

    if(month!=="all"){
        filtered=filtered.filter(d=>d.month===month);
    }

    renderKPI(filtered);
    renderBenchmark(filtered);
    renderEfficiency(filtered);
    renderReduction(filtered);
    renderSaving(filtered);
    renderEnergyChart(filtered);
    renderTrendChart(filtered);
    renderFacilityChart(filtered);

      // 🔥 ADD THIS
    renderAIInsight(filtered);
}

/* =========================
KPI
========================= */
function renderKPI(data){

    const usage=sum(data,"total_usage");
    const cost=sum(data,"total_cost");
    const emission=sum(data,"total_emission");

    const kpiGradient="linear-gradient(135deg,#7c2d12,#020617)";

    document.getElementById("kpi-container").innerHTML=
    `<div class="kpi-card" style="background:${kpiGradient}">
        <b>Total Usage</b><br>${usage.toFixed(2)}
    </div>
    <div class="kpi-card" style="background:${kpiGradient}">
        <b>Total Cost</b><br>$${cost.toFixed(2)}
    </div>
    <div class="kpi-card" style="background:${kpiGradient}">
        <b>Total Emission</b><br>${emission.toFixed(2)}
    </div>`;
}


/* =========================
ANALYTICS
========================= */
function renderBenchmark(data){

    const usage=sum(data,"total_usage");
    const emission=sum(data,"total_emission");

    const intensity=safeDivide(emission,usage);
    const diff=((intensity-INDUSTRY_AVG)/INDUSTRY_AVG)*100;

    const el=document.getElementById("benchmark-value");

    el.innerHTML=
    `<b>${intensity.toFixed(3)}</b> tCO₂ / unit<br>
     Industry Avg: ${INDUSTRY_AVG}<br>
     Difference: ${diff.toFixed(1)}%`;

    el.parentElement.style.background="linear-gradient(135deg,#14532d,#020617)";
    el.parentElement.style.border="1px solid #334155";
}

function renderEfficiency(data){

    const usage=sum(data,"total_usage");
    const emission=sum(data,"total_emission");

    const intensity=safeDivide(emission,usage);

    let score=100-(intensity*100);
    score=Math.min(Math.max(score,0),100);

    const el=document.getElementById("efficiency-score");

    el.innerHTML=`<b>${score.toFixed(1)} / 100</b>`;

    el.parentElement.style.background="linear-gradient(135deg,#1e3a8a,#020617)";
    el.parentElement.style.border="1px solid #1d4ed8";
}

function renderReduction(data){

    const emission=sum(data,"total_emission");
    const reduction=emission*0.12;

    const el=document.getElementById("reduction-ai");

    el.innerHTML=`<b>${reduction.toFixed(2)} tCO₂</b><br>Potential reduction`;

    el.parentElement.style.background="linear-gradient(135deg,#14532d,#020617)";
    el.parentElement.style.border="1px solid #22c55e";
}

function renderSaving(data){

    const emission=sum(data,"total_emission");
    const reduction=emission*0.12;
    const saving=reduction*CARBON_PRICE;

    const el=document.getElementById("saving-ai");

    el.innerHTML=`<b>$${saving.toFixed(2)}</b><br>Potential cost saving`;

    el.parentElement.style.background="linear-gradient(135deg,#14532d,#020617)";
    el.parentElement.style.border="1px solid #f97316";
}


/* =========================
CHARTS (VIEW BASED)
========================= */
function renderEnergyChart(data){

    const labels=[...new Set(data.map(d=>d.energy_type_record))];

    const values=labels.map(type=>{
        return data
            .filter(r=>r.energy_type_record===type)
            .reduce((s,r)=>s+Number(r.total_emission||0),0);
    });

    const total=values.reduce((a,b)=>a+b,0);

    document.getElementById("energy-total").innerText=total.toFixed(2);

    const ctx=document.getElementById("stackedChart").getContext("2d");

    if(energyChart) energyChart.destroy();

    const gradient=ctx.createLinearGradient(0,0,0,400);
    gradient.addColorStop(0,"#60a5fa");
    gradient.addColorStop(0.5,"#3b82f6");
    gradient.addColorStop(1,"#1e293b");

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
                    formatter:v=>v.toFixed(2)
                }
            },
            scales:{y:{beginAtZero:true}}
        }
    });
}


function renderTrendChart(data){

    const months=[...new Set(data.map(d=>d.month))].sort();

    const values=months.map(m=>
        data
        .filter(r=>r.month===m)
        .reduce((s,r)=>s+Number(r.total_emission||0),0)
    );

    const monthLabels=months.map(m=>
        new Date(m).toLocaleString("en",{month:"long"})
    );

    const ctx=document.getElementById("trendChart").getContext("2d");

    if(trendChart) trendChart.destroy();

    const gradient=ctx.createLinearGradient(0,0,0,400);
    gradient.addColorStop(0,"rgba(251,146,60,0.9)");
    gradient.addColorStop(0.5,"rgba(249,115,22,0.7)");
    gradient.addColorStop(1,"rgba(2,6,23,0.9)");

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
                pointRadius:4
            }]
        },
        options:{
            plugins:{legend:{display:false}}
        }
    });
}


function renderFacilityChart(data){

    const facilities=[...new Set(data.map(d=>d.facility_name_display))];

    const values=facilities.map(f=>
        data
        .filter(r=>r.facility_name_display===f)
        .reduce((s,r)=>s+Number(r.total_emission||0),0)
    );

    const ctx=document.getElementById("facilityChart").getContext("2d");

    if(facilityChart) facilityChart.destroy();

    const gradient=ctx.createLinearGradient(0,0,0,400);
    gradient.addColorStop(0,"#fb923c");
    gradient.addColorStop(1,"#7c2d12");

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
    });
}
function renderAIInsight(data){

    const el = document.getElementById("ai-insight-panel");
    if(!el) return;

    let insight;

    try {
        insight = generateAIInsight(data || []);
    } catch (e) {
        console.log("AI ERROR:", e);
        insight = null;
    }

    if(!insight){
        el.innerHTML = `<div class="ai-single-card">AI Error</div>`;
        return;
    }

    el.innerHTML = `
        <div class="ai-single-card">
            <div class="ai-title">🤖 AI Insight Engine</div>

            <div class="ai-content">

                <div class="ai-section">
                    <span class="ai-label">Performance Summary</span>
                    <p>${insight.summary}</p>
                </div>

                <div class="ai-section">
                    <span class="ai-label">Efficiency Diagnosis</span>
                    <p>${insight.diagnosis}</p>
                </div>

                <div class="ai-section">
                    <span class="ai-label">Anomaly Detection</span>
                    <p>${insight.anomaly}</p>
                </div>

                <div class="ai-section">
                    <span class="ai-label">Cost Impact Insight</span>
                    <p>${insight.cost}</p>
                </div>

                <div class="ai-section highlight">
                    <span class="ai-label">Action Recommendation</span>
                    <p>${insight.action}</p>
                </div>

            </div>
        </div>
    `;
}

function buildSummary(emission, intensity, trend){

    let direction = "stable";

    if(trend > 5) direction = "increasing";
    else if(trend < -5) direction = "decreasing";

    return `
Performance Summary:
Facility shows ${direction} emission trend.
Total emission: ${emission.toFixed(2)} tCO2.
Emission intensity: ${intensity.toFixed(3)} per unit.
Monthly change: ${trend.toFixed(1)}%.
    `;
}

function buildDiagnosis(dieselShare, intensity){

    let level = "moderate";

    if(intensity > 0.5) level = "high inefficiency";
    if(intensity < 0.2) level = "high efficiency";

    return `
Efficiency Diagnosis:
Facility efficiency level: ${level}.
Diesel dependency: ${(dieselShare*100).toFixed(1)}% of total emission.

Primary driver of emissions:
${dieselShare > 0.5 ? "Diesel usage dominates emission output." : "Balanced energy mix observed."}
    `;
}

function detectAnomaly(data, intensity){

    const values = data.map(d => d.total_emission || 0);
    const avg = values.reduce((a,b)=>a+b,0) / (values.length || 1);

    const deviation = avg ? (intensity - avg) / avg : 0;

    let status = "normal";

    if(deviation > 0.3) status = "high spike detected";
    if(deviation < -0.3) status = "below average";

    return `
Anomaly Detection:
Status: ${status}.
Deviation from baseline: ${(deviation*100).toFixed(1)}%.
    `;
}

function buildCostInsight(emission, cost){

    const carbonPrice = 85;

    const carbonCost = emission * carbonPrice;

    const gap = cost ? carbonCost - cost : carbonCost;

    return `
Cost Impact Insight:
Estimated carbon cost: $${carbonCost.toFixed(2)}.
Actual cost: $${cost.toFixed(2)}.
Potential gap impact: $${gap.toFixed(2)}.
    `;
}

function buildRecommendation(dieselShare, intensity){

    let actions = [];

    if(dieselShare > 0.4){
        actions.push("Reduce Diesel usage by 15–25%");
    }

    if(intensity > 0.4){
        actions.push("Optimize energy efficiency per unit production");
    }

    actions.push("Shift load to low-carbon energy sources");
    actions.push("Implement peak-hour energy control");

    return `
Action Recommendation:
${actions.map((a,i)=>`${i+1}. ${a}`).join("\n")}

Expected improvement: 10–20% emission reduction potential.
    `;
}

function calculateTrend(data, prevMonthData){

    const current = sum(data, "total_emission");
    const prev = sum(prevMonthData || [], "total_emission");

    if(!prev) return 0;

    return ((current - prev) / prev) * 100;
}

function getPreviousMonth(data){

    // simple fallback (optional enhancement)
    return [];
}

function renderAIInsight(data){

    const insight = generateAIInsight(data);

    document.getElementById("ai-insight-panel").innerHTML = `
        <div class="ai-box">
            <h3>AI Insight</h3>

            <p>${insight.summary}</p>
            <p>${insight.diagnosis}</p>
            <p>${insight.anomaly}</p>
            <p>${insight.cost}</p>
            <p>${insight.action}</p>
        </div>
    `;
}

/* =========================
EXPORT
========================= */
function createExportButton(){

    const btn=document.createElement("button");

    btn.innerText="Export PDF";
    btn.style.position="fixed";
    btn.style.top="30px";
    btn.style.right="40px";
    btn.style.padding="10px 16px";
    btn.style.borderRadius="10px";
    btn.style.border="1px solid #334155";
    btn.style.background="linear-gradient(135deg,#3b82f6,#1e3a8a)";
    btn.style.color="white";
    btn.style.fontWeight="600";
    btn.style.cursor="pointer";
    btn.style.zIndex="999";

    btn.addEventListener("click",exportPDF);

    document.body.appendChild(btn);
}


/* =========================
INIT
========================= */
loadDashboard();
initRealtime();
