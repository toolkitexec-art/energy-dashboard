import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = 'https://otzxkvdkpbsyrbiqtbjd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJzdXBhYmFzZSIsInJlZiI6Im90enhrdmRrcGJzeXJiaXF0YmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NTY3NDYsImV4cCI6MjA4NzEzMjc0Nn0.tmLk2MoEpRbAdZNT5tRZTRvH_laeRo5Y1t-ollBGNAQ'

const supabase = createClient(SUPABASE_URL,SUPABASE_ANON_KEY)

let allData=[], stackedChart, trendChart, donutChart

async function loadData(){
  const debug = document.getElementById("debugPanel")
  const { data,error } = await supabase.from("dashboard_phase2_final_named").select("*")
  
  if(error){
    debug.innerHTML = `<p style="color:red">Supabase Error: ${error.message}</p>`
    console.error(error)
    return
  }

  allData = data
  populateFilters()
  renderDebugPanel()
  renderDashboard()
}

function renderDebugPanel(){
  const debug = document.getElementById("debugPanel")
  if(allData.length===0){
    debug.innerHTML = `<p>No data available. Check Supabase table or RLS policy.</p>`
    return
  }
  const totalUsage = allData.reduce((s,r)=>s+Number(r.total_usage),0)
  const totalCost = allData.reduce((s,r)=>s+Number(r.total_cost),0)
  const totalEmission = allData.reduce((s,r)=>s+Number(r.total_emission),0)
  debug.innerHTML = `<p>Records fetched: ${allData.length}</p>
    <p>Total Usage: ${totalUsage.toFixed(2)}</p>
    <p>Total Cost: ${totalCost.toFixed(2)}</p>
    <p>Total Emission: ${totalEmission.toFixed(2)}</p>`
}

// ... fungsi populateFilters, renderDashboard, renderKPI, renderStack, renderTrend, renderDonut, renderMatrix, exportCSV
// Sama persis seperti versi sebelumnya
// Tinggal paste seluruh fungsi dari script.js versi terakhir yang saya buat