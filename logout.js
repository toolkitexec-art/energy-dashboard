import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://otzxkvdkpbsyrbiqtbjd.supabase.co";
const SUPABASE_KEY = "sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

window.addEventListener("DOMContentLoaded", async () => {
  const btn = document.getElementById("logout-btn");
  const userSpan = document.getElementById("user-welcome");

  const { data: { session } } = await supabase.auth.getSession();

  // 🔒 PROTECT DASHBOARD
  if (!session) {
    window.location.href = "/Login.html";
    return;
  }

  // tampilkan user
  if (userSpan) userSpan.innerText = session.user.email;

  // tampilkan tombol
  if (btn) {
    btn.style.display = "inline-block";

    btn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "/Login.html";
    });
  }
});
