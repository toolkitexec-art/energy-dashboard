// Logout.js SAFE MODE (tidak ganggu dashboard)

window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("logout-btn");
  const userSpan = document.getElementById("user-welcome");

  if (userSpan) userSpan.innerText = "Hello, user";

  if (btn) {
    btn.style.display = "inline-block";

    btn.addEventListener("click", () => {
      window.location.href = "/Login.html";
    });
  }
});
