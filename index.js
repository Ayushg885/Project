const menubtn = document.querySelector(".menu-btn");
const drawMenu = document.querySelector("#draw-menu"); // ✅ FIX
let check = false;

menubtn.addEventListener("click", function () {
    console.log(`clicked, ${check}`);
    check = !check;
    drawMenu.style.display = check ? "block" : "none";
});
