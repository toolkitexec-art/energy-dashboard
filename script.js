import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = "https://otzxkvdkpbsyrbiqtbjd.supabase.co"

const SUPABASE_KEY = "sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function loadDashboard() {

  const { data, error } = await supabase
    .from("helixon_dashboard_fast")
    .select("*")

  if (error) {
    console.log(error)
    document.getElementById("loading").innerText = "Error loading data"
    return
  }

  if (!data || data.length === 0) {
    document.getElementById("loading").innerText = "No data found"
    return
  }

  document.getElementById("loading").style.display = "none"

  renderKPI(data)
  renderEnergyComparison(data)
  renderTrend(data)

}

function renderKPI(data){

  const totalUsage =
    data.reduce((sum,r)=> sum + Number(r.total_usage),0)

  const totalEmission =
    data.reduce((sum,r)=> sum + Number(r.total_emission),0)

  document.getElementById("kpi-container").innerHTML = `
    <div class="kpi-card">
      <b>Total Energy Usage</b><br>${totalUsage.toFixed(2)}
    </div>

    <div class="kpi-card">
      <b>Total Emission</b><br>${totalEmission.toFixed(2)}
    </div>

    <div class="kpi-card">
      <b>Total Records</b><br>${data.length}
    </div>
  `
}

function renderEnergyComparison(data){

  const labels = [...new Set(data.map(d=>d.energy_type))]

  const values = labels.map(type=>{
    return data
      .filter(r=>r.energy_type===type)
      .reduce((sum,r)=> sum + Number(r.total_emission),0)
  })

  new Chart(document.getElementById("energyChart"),{
    type:"bar",
    data:{
      labels:labels,
      datasets:[{
        label:"Emission by Energy Type",
        data:values
      }]
    }
  })

}

function renderTrend(data){

  const months =
  [...new Set(data.map(d=>d.month.substring(0,7)))]

  const values = months.map(m=>{
    return data
      .filter(r=>r.month.startsWith(m))
      .reduce((sum,r)=> sum + Number(r.total_emission),0)
  })

  new Chart(document.getElementById("trendChart"),{
    type:"line",
    data:{
      labels:months,
      datasets:[{
        label:"Emission Trend",
        data:values
      }]
    }
  })

}

loadDashboard()
