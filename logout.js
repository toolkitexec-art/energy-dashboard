window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("logout-btn");

  if (!btn) return;

  btn.style.display = "inline-block";

  btn.addEventListener("click", () => {
    window.location.href = "Login.html";
  });
});
