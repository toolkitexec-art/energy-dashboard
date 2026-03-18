// Logout.js final - tombol selalu muncul
const logoutBtn = document.getElementById("logout-btn");
const welcomeSpan = document.getElementById("user-welcome");

// Tampilkan greeting
if (welcomeSpan) welcomeSpan.innerText = "Hello, user";

// Tombol Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    // Redirect ke login page
    window.location.href = "Login.html";
  });
}
