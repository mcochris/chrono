// This code is adapted from https://codepen.io/imvpn22/pen/RwPvOgQ
// Just noticed accessing localStorage is banned from codepen, so disabling saving theme to localStorage

const deg = 6;
const localHour = document.querySelector(".local-time .hour") as HTMLDivElement;
const localMin = document.querySelector(".local-time .min") as HTMLDivElement;
const localSec = document.querySelector(".local-time .sec") as HTMLDivElement;
const utcHour = document.querySelector(".utc-time .hour") as HTMLDivElement;
const utcMin = document.querySelector(".utc-time .min") as HTMLDivElement;
const utcSec = document.querySelector(".utc-time .sec") as HTMLDivElement;

const setClock = () => {
	const now = new Date();

	const lhh = now.getHours() * 30;
	const lmm = now.getMinutes() * deg;
	const lss = now.getSeconds() * deg;
	localHour.style.transform = `rotateZ(${lhh + lmm / 12}deg)`;
	localMin.style.transform = `rotateZ(${lmm}deg)`;
	localSec.style.transform = `rotateZ(${lss}deg)`;

	const uhh = now.getUTCHours() * 30;
	const umm = now.getUTCMinutes() * deg;
	const uss = now.getUTCSeconds() * deg;
	utcHour.style.transform = `rotateZ(${uhh + umm / 12}deg)`;
	utcMin.style.transform = `rotateZ(${umm}deg)`;
	utcSec.style.transform = `rotateZ(${uss}deg)`;
};

// first time
setClock();
// Update every 1000 ms
setInterval(setClock, 1000);

const switchTheme = (evt: MouseEvent) => {
	const switchBtn = evt.currentTarget as HTMLButtonElement;
	if (switchBtn.textContent.toLowerCase() === "light") {
		switchBtn.textContent = "dark";
		// localStorage.setItem("theme", "dark");
		document.documentElement.setAttribute("data-theme", "dark");
	} else {
		switchBtn.textContent = "light";
		// localStorage.setItem("theme", "light"); //add this
		document.documentElement.setAttribute("data-theme", "light");
	}
};

const switchModeBtn = document.querySelector(".switch-btn") as HTMLButtonElement;
switchModeBtn.addEventListener("click", switchTheme, false);

let currentTheme = "dark";
// currentTheme = localStorage.getItem("theme")
// 	? localStorage.getItem("theme")
// 	: null;

if (currentTheme) {
	document.documentElement.setAttribute("data-theme", currentTheme);
	switchModeBtn.textContent = currentTheme;
}
