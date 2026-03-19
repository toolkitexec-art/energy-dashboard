import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL="https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY="sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)

const form=document.getElementById("energy-form")

form.addEventListener("submit", async (e)=>{
    e.preventDefault()

    const facility=document.getElementById("facility_id").value
    const energy=document.getElementById("energy_type").value
    const month=document.getElementById("month").value
    const cost=document.getElementById("total_cost").value

    const {error}=await supabase
        .from("dashboard_phase2_final_named")
        .insert([{
            facility_name: facility,
            energy_type_record: energy,
            month: month,
            total_cost: cost
        }])

    if(error){
        alert("Error saving data")
        console.log(error)
        return
    }

    alert("Data saved!")
    form.reset()
})
