import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL="https://otzxkvdkpbsyrbiqtbjd.supabase.co"
const SUPABASE_KEY="sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx"

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY)

const { data } = await supabase.auth.getSession()

if(data?.session){
window.location.href = "index.html"
}

window.login = async function(){

    const email=document.getElementById("email").value
    const password=document.getElementById("password").value

    if(!email || !password){
        alert("Please fill email and password")
        return
}
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if(error){
        alert(error.message)
        return
    }

    // sukses
    window.location.href = "index.html"
}
