import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://otzxkvdkpbsyrbiqtbjd.supabase.co";
const SUPABASE_KEY = "sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx";
const supabase = createClient(SUPABASE_URL,SUPABASE_KEY);

const facilitySelect = document.getElementById('facility-select');
const monthSelect = document.getElementById('month-select');
const exportBtn = document.getElementById('export-kpi');

let stackedChart;
let trendChart;

async function loadDashboard(){
  const { data, error } = await supabase
    .from("dashboard_phase2_final_named")
    .select("*");

  if(error){
    console.log(error);
    document.getElementById("loading").innerText="Error loading data";
    return;
  }

  if(!data || data.length===0){
    document.getElementById("loading").innerText="No data found";
    return;
  }

  document.getElementById("loading").style.display="none";

  populateFilters(data);
  renderKPI(data);
  renderStack(data);
  renderTrend(data);
  renderAI(data);
}

function populateFilters(data){
  // Facility options
  const facilities = [...new Set(data.map(d=>d.facility_id))];
  facilitySelect.innerHTML = facilities.map(f=>`<option value="${f}">${f}</option>`).join('');

  // Month options (YYYY-MM)
  const months = [...new Set(data.map(d=>d.month))].sort();
  monthSelect.innerHTML = months.map(m=>`<option value="${m}">${m}</option>`).join('');

  // Default current month
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  monthSelect.value = months.includes(currentMonth)? currentMonth : months[months.length-1];

  // Auto-update on filter change
  facilitySelect.addEventListener('change', ()=>applyFilters(data));
  monthSelect.addEventListener('change', ()=>applyFilters(data));
}

function applyFilters(data){
  const selectedFacilities = Array.from(facilitySelect.selectedOptions).map(o=>o.value);
  const selectedMonth = monthSelect.value;

  const filteredData = data.filter(d=>selectedFacilities.includes(d.facility_id) && d.month===selectedMonth);

  renderKPI(filteredData);
  renderStack(filteredData);
  renderTrend(filteredData);
  renderAI(filteredData);
}

function renderKPI(data){
  const totalUsage = data.reduce((sum,r)=> sum + Number(r.total_usage),0);
  const totalCost = data.reduce((sum,r)=> sum + Number(r.total_cost),0);
  const totalEmission = data.reduce((sum,r)=> sum + Number(r.total_emission),0);

  document.getElementById("kpi-container").innerHTML = `
  <div class="kpi-card"><b>Total Usage</b><br>${totalUsage.toFixed(2)}</div>
  <div class="kpi-card"><b>Total Cost</b><br>$${totalCost.toFixed(2)}</div>
  <div class="kpi-card"><b>Total Emission</b><br>${totalEmission.toFixed(2)}</div>`;
}

function renderStack(data){
  const labels = [...new Set(data.map(d=>d.energy_type_record))];
  const datasets = [];

  const facilities = [...new Set(data.map(d=>d.facility_id))];
  const colors = ['#4F46E5','#6366F1','#818CF8','#A5B4FC','#22c55e','#f97316'];

  facilities.forEach((fac,i)=>{
    const values = labels.map(l=>{
      return data
        .filter(d=>d.facility_id===fac && d.energy_type_record===l)
        .reduce((sum,r)=> sum + Number(r.total_emission),0);
    });
    datasets.push({
      label: fac,
      data: values,
      backgroundColor: colors[i%colors.length],
      borderRadius:6
    });
  });

  const ctx = document.getElementById("stackedChart").getContext("2d");
  if(stackedChart) stackedChart.destroy();
  stackedChart = new Chart(ctx,{
    type:"bar",
    data:{ labels, datasets },
    plugins:[ChartDataLabels],
    options:{
      plugins:{
        datalabels:{
          color:"#ffffff",
          anchor:"end",
          align:"top",
          font:{ weight:"bold", size:12 },
          formatter:(value)=> value.toFixed(2)
        }
      },
      scales:{ x:{ stacked:true }, y:{ stacked:true, beginAtZero:true } }
    }
  });
}

function renderTrend(data){
  const months = [...new Set(data.map(d=>d.month))].sort();
  const values = months.map(m=> data.filter(r=>r.month===m).reduce((sum,r)=> sum+Number(r.total_emission),0));

  const ctx = document.getElementById("trendChart").getContext("2d");
  if(trendChart) trendChart.destroy();

  const gradient = ctx.createLinearGradient(0,0,0,400);
  gradient.addColorStop(0,"#60a5fa");
  gradient.addColorStop(1,"#1e293b");

  trendChart = new Chart(ctx,{
    type:"line",
    data:{ labels:months, datasets:[{ label:"Emission Trend", data:values, borderColor:"#60a5fa", backgroundColor:gradient, fill:true }] }
  });
}

function renderAI(data){
  const electricity = data.filter(d=>d.energy_type_record==="electricity").reduce((sum,r)=> sum+Number(r.total_usage),0);
  let message="Energy usage is efficient.";
  if(electricity>300) message="AI Insight: Electricity usage high. Consider solar or efficiency upgrade.";
  document.getElementById("ai-recommend").innerText=message;
}

exportBtn.addEventListener('click', ()=>{
  const selectedFacilities = Array.from(facilitySelect.selectedOptions).map(o=>o.value);
  const selectedMonth = monthSelect.value;

  supabase.from("dashboard_phase2_final_named")
    .select("*")
    .in('facility_id',selectedFacilities)
    .eq('month',selectedMonth)
    .then(({data,error})=>{
      if(error || !data) return;

      const headers = ["Facility","Month","Energy Type","Total Usage","Total Cost","Total Emission"];
      const rows = data.map(r=>[r.facility_id,r.month,r.energy_type_record,r.total_usage,r.total_cost,r.total_emission]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r=>r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `KPI_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
});

loadDashboard();
