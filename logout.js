import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://otzxkvdkpbsyrbiqtbjd.supabase.co";
const SUPABASE_KEY = "sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "Login.html";
});
