// Logout.js final Helixon - buat tombol Logout dinamis
window.addEventListener("load", () => {
  // Cari header dashboard
  const header = document.querySelector(".header");
  if (!header) return;

  // Cek kalau tombol belum ada
  if (!document.getElementById("logout-btn")) {
    const navbar = document.createElement("div");
    navbar.id = "navbar";
    navbar.style.marginTop = "5px";

    const welcomeSpan = document.createElement("span");
    welcomeSpan.id = "user-welcome";
    welcomeSpan.innerText = "Hello, user";

    const logoutBtn = document.createElement("button");
    logoutBtn.id = "logout-btn";
    logoutBtn.innerText = "Logout";
    logoutBtn.style.background = "red";
    logoutBtn.style.color = "white";
    logoutBtn.style.padding = "5px 10px";
    logoutBtn.style.border = "none";
    logoutBtn.style.borderRadius = "4px";
    logoutBtn.style.marginLeft = "10px";

    // Bind klik tombol
    logoutBtn.addEventListener("click", () => {
      window.location.href = "Login.html";
    });

    navbar.appendChild(welcomeSpan);
    navbar.appendChild(logoutBtn);

    // Tambahkan navbar di akhir header
    header.appendChild(navbar);
  }
});
