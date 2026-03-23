import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL="https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY="sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)

const facilitySelect=document.getElementById("facility-select")
const monthSelect=document.getElementById("month-select")

window.ChartThemeEngine = {
    mode: "dark",

    get() {
        const mode = this.mode;
        const isExport = mode === "export" || mode === "print";

        return {
            mode,
            isExport,
            textColor: isExport ? "#000" : "#fff",
            mutedText: isExport ? "#111" : "#e5e7eb",
            gridColor: isExport ? "#ddd" : "#1f2937",
       
            energyBar: isExport ? "#2563eb" : "#60a5fa",
            trendLine: isExport ? "#f97316" : "#fb923c",
            facilityBar: isExport ? "#7c2d12" : "#fb923c",

            gradientBase: isExport
                ? [
                    "rgba(37,99,235,0.9)",
                    "rgba(30,58,138,0.7)",
                    "rgba(255,255,255,0.2)"
                ]
                : [
                    "rgba(59,130,246,0.9)",
                    "rgba(30,41,59,0.7)",
                    "rgba(2,6,23,0.9)"
                ]
        };
},

    applyToChart(chart) {
        const theme = this.get();

        chart.options.scales.x.ticks.color = theme.textColor;
        chart.options.scales.y.ticks.color = theme.textColor;

        chart.options.scales.x.grid.color = theme.gridColor;
        chart.options.scales.y.grid.color = theme.gridColor;
        
        if (chart.options.plugins?.datalabels) {
            chart.options.plugins.datalabels.color = theme.mutedText;
        }

        chart.update();
    }
};

let energyChart;
let trendChart;
let facilityChart;
let renderLock = false; 

function setChartTheme(mode){
    window.ChartThemeEngine.mode = mode;
    
    if (!DashboardCache.filtered.length) return;

    renderEnergyChart();
    renderTrendChart();
    renderFacilityChart();
}

const INDUSTRY_AVG=0.42
const CARBON_PRICE=85

Chart.defaults.devicePixelRatio = window.devicePixelRatio || 2;
/* =========================
STEP 7.1 - CACHE SYSTEM
========================= */
const DashboardCache = {
    raw: [],
    filtered: [],
    energy: null,
    trend: null,
    facility: null,
    kpi: null
};

function buildCache(data){
    DashboardCache.raw = data;
    DashboardCache.filtered = data;
    recomputeDerived(data);
}

function recomputeDerived(data){
    DashboardCache.energy = computeEnergy(data);
    DashboardCache.trend = computeTrend(data);
    DashboardCache.facility = computeFacility(data);
    DashboardCache.kpi = computeKPI(data);
}
function computeEnergy(data){

    const map = {};

    for(const r of data){
        const k = r.energy_type_record;
        if(!k) continue;

        map[k] = (map[k] || 0) + Number(r.total_emission || 0);
    }

    const labels = Object.keys(map);
    const values = Object.values(map);
    const total = values.reduce((a,b)=>a+b,0);

    return { labels, values, total };
        }
function computeTrend(data){

    const map = {};

    for(const r of data){
        const m = r.month;
        if(!m) continue;

        map[m] = (map[m] || 0) + Number(r.total_emission || 0);
    }

    const sorted = Object.entries(map)
        .sort((a,b)=>new Date(a[0]) - new Date(b[0]));

    return {
        labels: sorted.map(d =>
            new Date(d[0]).toLocaleString("en",{month:"long",year:"numeric"})
        ),
        values: sorted.map(d => d[1])
    };
}
function computeFacility(data){

    const map = {};

    for(const r of data){
        const f = r.facility_name_display;
        if (!f || f.trim() === "") continue;

        map[f] = (map[f] || 0) + Number(r.total_emission || 0);
    }

    const sorted = Object.entries(map)
        .sort((a,b)=>b[1]-a[1]);

    return {
        labels: sorted.map(d=>d[0]),
        values: sorted.map(d=>d[1])
    };
   }
function computeKPI(data){

    let usage = 0;
    let cost = 0;
    let emission = 0;

    for(const r of data){

        const u = Number(r.total_usage || 0);
        const c = Number(r.total_cost || 0);
        const e = Number(r.total_emission || 0);
       
        usage += u;
        cost += c;
        emission += e;
    }

    return { usage, cost, emission };
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
    buildCache(data);
    applyFilters();
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

    facilitySelect.addEventListener("change",triggerApplyFilters);
    monthSelect.addEventListener("change",triggerApplyFilters);
    }


/* =========================
APPLY FILTER
========================= */
let filterTimeout;

function triggerApplyFilters(){

    clearTimeout(filterTimeout);

    filterTimeout = setTimeout(()=>{
        applyFilters();
    }, 80);
}

function applyFilters(){

    const facility = facilitySelect.value;
    const month = monthSelect.value;

    let data = DashboardCache.raw;

    if(facility !== "all"){
        data = data.filter(d =>
            d.facility_name_display === facility
        );
    }

    if(month !== "all"){
        data = data.filter(d =>
            d.month === month
        );
    }

    DashboardCache.filtered = data;

    recomputeDerived(data);

    renderAll(data);
}

function renderAll(){

    if(renderLock) return;
    renderLock = true;

    try {
        const data = DashboardCache.filtered;

        renderKPI(data);
        renderBenchmark(data);
        renderEfficiency(data);
        renderReduction(data);
        renderSaving(data);

        renderEnergyChart();
        renderTrendChart();
        renderFacilityChart();

    } finally {
        renderLock = false;
    }
}

/* =========================
UTILS
========================= */
function safeDestroy(chart){
    if(chart){
        chart.destroy();
    }
}

function sum(data,field){
    return data.reduce((s,r)=>s+Number(r[field]||0),0);
}

function safeDivide(a,b){
    if(!b||b===0) return 0;
    return a/b;
}
function waitChartsReady(){
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
    });
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
function renderEnergyChart(){

    safeDestroy(energyChart);
    
    const { labels = [], values = [], total = 0 } = DashboardCache.energy || {};

    document.getElementById("energy-total").innerText = total.toFixed(2);

    const theme = window.ChartThemeEngine.get();
    const ctx = document.getElementById("stackedChart").getContext("2d");
    const gradient = ctx.createLinearGradient(0,0,0,400);
       
        gradient.addColorStop(0, theme.gradientBase[0]);
        gradient.addColorStop(0.5, theme.gradientBase[1]);
        gradient.addColorStop(1, theme.gradientBase[2]);

        energyChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: gradient,
                    borderRadius: 6
                }]
            },
            options: getCommonOptions()
        });

        window.ChartThemeEngine.applyToChart(energyChart);
    
    }

function renderTrendChart(){

    safeDestroy(trendChart);

const { labels = [], values = [] } = DashboardCache.trend || {};
    
const ctx = document.getElementById("trendChart").getContext("2d");

const gradient = ctx.createLinearGradient(0,0,0,400);
const theme = window.ChartThemeEngine.get();

gradient.addColorStop(0, theme.gradientBase[0]);
gradient.addColorStop(0.5, theme.gradientBase[1]);
gradient.addColorStop(1, theme.gradientBase[2]);
    
        trendChart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    data: values,
                    borderColor: theme.trendLine,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: theme.trendLine
                }]
            },
            options: getCommonOptions()
        });

        window.ChartThemeEngine.applyToChart(trendChart);
    
}
function renderFacilityChart(){

    safeDestroy(facilityChart);
    
    const { labels = [], values = [] } = DashboardCache.facility || {};
    
    const ctx = document.getElementById("facilityChart").getContext("2d");

    const gradient = ctx.createLinearGradient(0,0,0,400);
    const theme = window.ChartThemeEngine.get();

    gradient.addColorStop(0, theme.gradientBase[0]);
    gradient.addColorStop(1, theme.gradientBase[2]);
    
    facilityChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: gradient,
                borderRadius: 6
            }]
        },
        options: getCommonOptions()
    });

    window.ChartThemeEngine.applyToChart(facilityChart);
}    

function getCommonOptions(){

    const theme = window.ChartThemeEngine.get();

    return {
        plugins:{
            legend:{display:false},
            datalabels:{
                color: theme.mutedText,
                textStrokeColor: theme.isExport ? "#fff" : "#000",
                textStrokeWidth: 2,
                anchor:"end",
                align:"top",
                font:{weight:"600"},
                formatter:v=>v.toFixed(2)
            }
        },
        scales:{
            x:{ticks:{color:theme.textColor}},
            y:{beginAtZero:true,ticks:{color:theme.textColor}}
        }
    };
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

    btn.addEventListener("click", () => {
    window.open("preview.html", "_blank");
});

}

/* =========================
INIT
========================= */
loadDashboard(); 
