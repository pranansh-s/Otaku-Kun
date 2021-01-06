var s = document.getElementById('bar');
var sb = document.getElementById('s-bar');
var dropd = document.getElementById('dropd');

var dwn_c = document.getElementById('dwn-page');
var overlay = document.getElementById('overlay');

var toSearchfor = "anime";
var searched = false;

sb.style.width = "60px";

//js animations for search bar
document.getElementById('iconR').addEventListener("mouseover", () => {
  document.getElementById('iconR').style.borderRadius = "0px 7px 7px 0px";
  sb.style.width = "500px";
  sb.style.textShadow = "0 0 0 #000000";
});

sb.addEventListener("mouseout", () => {
  if(sb.value == "" && !searched){
    sb.style.width = "60px";
    document.getElementById('iconR').style.borderRadius = "7px";
  }
});

document.getElementById('close').addEventListener('click', () => {
  document.querySelector('body').style.overflow = "scroll";
  document.getElementById("border").scrollTo(0, 0);
  overlay.style.display = "none";
});

sb.addEventListener('blur', () => { if(!searched) sb.style.width = "60px"; });

function toggleDropdown(){
  document.getElementById("choose").classList.toggle("active");
  document.getElementById("dropArrow").classList.toggle("fa-angle-down");
}

dropd.addEventListener("click", toggleDropdown);

document.getElementById("optionAnime").addEventListener('click', () => {
  toSearchfor = "anime";
  toggleDropdown();
});

document.getElementById("optionManga").addEventListener('click', () => {
  toSearchfor = "manga";
  toggleDropdown();
});
