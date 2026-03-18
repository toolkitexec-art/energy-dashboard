import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://otzxkvdkpbsyrbiqtbjd.supabase.co";
const SUPABASE_KEY = "sb_publishable_r5rzVpoDYvd3TkrseKi4jw_QnE-Ekvx";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const loginBtn = document.getElementById("login-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorDiv = document.getElementById("login-error");

loginBtn.addEventListener("click", async () => {
    const { email, password } = { email: emailInput.value, password: passwordInput.value };

    if (!email || !password) {
        errorDiv.textContent = "Please enter email and password";
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        errorDiv.textContent = error.message;
        return;
    }

    window.location.href = "index.html";
});
