// Logout.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://otzxkvdkpbsyrbiqtbjd.supabase.co";
const SUPABASE_KEY = "sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Bind tombol logout
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      logoutBtn.style.display = "none";
      const welcome = document.getElementById("user-welcome");
      if (welcome) welcome.innerText = "";
      window.location.href = "Login.html";
    }
  });
}

// Tampilkan tombol logout otomatis jika user sudah login
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    const welcome = document.getElementById("user-welcome");
    if (welcome) welcome.innerText = `Hello, ${session.user.email}`;
  }
})();
