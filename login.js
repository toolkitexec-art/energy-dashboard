// login.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔹 Supabase config
const SUPABASE_URL = "https://otzxkvdkpbsyrbiqtbjd.supabase.co";
const SUPABASE_KEY = "sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 🔹 Cek session, jika sudah login redirect ke dashboard
async function init() {
    const { data, error } = await supabase.auth.getSession();

    if (data?.session) {
        window.location.href = "index.html";
        return;
    }
}
init();

// 🔹 Fungsi login
window.login = async function() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please fill email and password");
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    // sukses → redirect ke dashboard
    window.location.href = "index.html";
};

// 🔹 Hubungkan tombol login
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
    loginBtn.addEventListener("click", window.login);
}

// 🔹 Enter key support
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") window.login();
});
