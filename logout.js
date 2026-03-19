import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://otzxkvdkpbsyrbiqtbjd.supabase.co";
const SUPABASE_KEY = "sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

window.addEventListener("DOMContentLoaded", async () => {
  const btn = document.getElementById("logout-btn");
  const userSpan = document.getElementById("user-welcome");

  let session = null;

  try {
    const res = await supabase.auth.getSession();
    session = res?.data?.session;
  } catch (e) {
    console.log("Session check error:", e);
  }

  // ❗ JANGAN redirect langsung (biar dashboard tetap render)
  if (!session) {
    console.log("No session (dashboard tetap jalan)");
  } else {
    if (userSpan) userSpan.innerText = session.user.email;
  }

  // tombol tetap muncul
  if (btn) {
    btn.style.display = "inline-block";

    btn.addEventListener("click", async () => {
      try {
        await supabase.auth.signOut();
      } catch (e) {}

      window.location.href = "/Login.html";
    });
  }
});
