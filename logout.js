// Logout.js testing
const logoutBtn = document.getElementById("logout-btn");
const welcomeSpan = document.getElementById("user-welcome");

// Paksa tampil tombol
if (logoutBtn) {
  logoutBtn.style.display = "inline-block";
  logoutBtn.addEventListener("click", () => {
    window.location.href = "Login.html";
  });
}

// Tampilkan greeting
if (welcomeSpan) welcomeSpan.innerText = "Hello, user";
