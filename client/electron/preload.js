localStorage.setItem("standalone", "true")
window.addEventListener("DOMContentLoaded", () => {
  const drag = document.createElement("div");
  drag.id = "drag-area";
  drag.className = "fixed w-full h-6 hover:cursor-move top-0 left-0";

  document.documentElement.appendChild(drag);
});
