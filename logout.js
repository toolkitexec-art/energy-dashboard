// Logout.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase config sesuai dashboard
const SUPABASE_URL = "https://otzxkvdkpbsyrbiqtbjd.supabase.co";
const SUPABASE_KEY = "sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Ambil tombol logout dan span welcome
const logoutBtn = document.getElementById("logout-btn");
const welcomeSpan = document.getElementById("user-welcome");

// Fungsi untuk menampilkan tombol logout jika user login
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // User login, tampilkan tombol
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (welcomeSpan) welcomeSpan.innerText = `Hello, ${session.user.email}`;
  } else {
    // User belum login, sembunyikan tombol dan redirect ke Login.html
    if (logoutBtn) logoutBtn.style.display = "none";
    if (welcomeSpan) welcomeSpan.innerText = "";
    // Optional: redirect otomatis ke login
    // window.location.href = "Login.html";
  }
}

// Bind event logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      logoutBtn.style.display = "none";
      if (welcomeSpan) welcomeSpan.innerText = "";
      window.location.href = "Login.html";
    }
  });
}

// Cek session saat load dashboard
checkSession();
