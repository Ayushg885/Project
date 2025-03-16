let check='0'
var menu = document.querySelector(".menu-btn");
menu.addEventListener("click",function(){
    console.log(`clickd,${check}`)
    if(check==='0'){
        document.querySelector('#draw-menu').style.display="block";
        check='1'}
    else{
        document.querySelector('#draw-menu').style.display="none";
        check='0'}
})
