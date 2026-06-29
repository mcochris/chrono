import { DateTime } from 'luxon';
import { initTheme } from './theme';
import { clearTZPicker, initTZPicker, primaryTZ, secondaryTZ } from './setTZ';

const deg = 6;
const primaryClockHeader = document.getElementById("primary-clock-header") as HTMLAnchorElement;
const secondaryClockHeader = document.getElementById("secondary-clock-header") as HTMLAnchorElement;
const primaryClockTime = document.getElementById("primary-clock-time") as HTMLDivElement;
const primaryClockDate = document.getElementById("primary-clock-date") as HTMLDivElement;
const secondaryClockTime = document.getElementById("secondary-clock-time") as HTMLDivElement;
const secondaryClockDate = document.getElementById("secondary-clock-date") as HTMLDivElement;
const primaryHour = document.querySelector("#primary-clock .hour") as HTMLDivElement;
const primaryMin = document.querySelector("#primary-clock .min") as HTMLDivElement;
const primarySec = document.querySelector("#primary-clock .sec") as HTMLDivElement;
const secondaryHour = document.querySelector("#secondary-clock .hour") as HTMLDivElement;
const secondaryMin = document.querySelector("#secondary-clock .min") as HTMLDivElement;
const secondarySec = document.querySelector("#secondary-clock .sec") as HTMLDivElement;
const timeDiff = document.getElementById("time-diff") as HTMLDivElement;
const themeToggle = document.getElementById("theme-toggle") as HTMLButtonElement;

clearTZPicker();
setClock();
setInterval(setClock, 1000);
setTZDiff(primaryTZ, secondaryTZ);
initTheme(themeToggle);
initTZPicker(() => {
	setTZDiff(primaryTZ, secondaryTZ);
	setClock();
});

//=============================================================================
// Updates the rotation of the clock hands based on the current time in the
// local timezone and the selected secondary timezone. Also updates the
// timezone label for the primary clock. This code is partially adapted from
// https://codepen.io/imvpn22/pen/RwPvOgQ
//=============================================================================
function setClock() {
	if (primaryTZ === "UTC")
		primaryClockHeader.textContent = primaryTZ;
	else
		primaryClockHeader.textContent = primaryTZ + " (" + DateTime.now().setZone(primaryTZ).toFormat("ZZZZ") + ")";
	primaryClockTime.textContent = DateTime.now().setZone(primaryTZ).toFormat("hh:mm:ss a");
	primaryClockDate.textContent = DateTime.now().setZone(primaryTZ).toFormat("DDDD");

	if (secondaryTZ === "UTC")
		secondaryClockHeader.textContent = secondaryTZ;
	else
		secondaryClockHeader.textContent = secondaryTZ + " (" + DateTime.now().setZone(secondaryTZ).toFormat("ZZZZ") + ")";
	secondaryClockTime.textContent = DateTime.now().setZone(secondaryTZ).toFormat("hh:mm:ss a");
	secondaryClockDate.textContent = DateTime.now().setZone(secondaryTZ).toFormat("DDDD");

	const lhh = DateTime.now().setZone(primaryTZ).hour * 30;
	const lmm = DateTime.now().setZone(primaryTZ).minute * deg;
	const lss = DateTime.now().setZone(primaryTZ).second * deg;
	primaryHour.style.transform = `rotateZ(${lhh + lmm / 12}deg)`;
	primaryMin.style.transform = `rotateZ(${lmm}deg)`;
	primarySec.style.transform = `rotateZ(${lss}deg)`;

	const uhh = DateTime.now().setZone(secondaryTZ).hour * 30;
	const umm = DateTime.now().setZone(secondaryTZ).minute * deg;
	const uss = DateTime.now().setZone(secondaryTZ).second * deg;
	secondaryHour.style.transform = `rotateZ(${uhh + umm / 12}deg)`;
	secondaryMin.style.transform = `rotateZ(${umm}deg)`;
	secondarySec.style.transform = `rotateZ(${uss}deg)`;
};

//=============================================================================
// Calculates the time difference between two timezones and updates the display
//=============================================================================
function setTZDiff(tz1: string, tz2: string) {
	const offsetDiffMinutes = DateTime.now().setZone(tz2).offset - DateTime.now().setZone(tz1).offset;
	const hours = Math.trunc(offsetDiffMinutes / 60);
	const minutes = Math.abs(offsetDiffMinutes % 60);
	if (hours === 0 && minutes === 0) {
		timeDiff.innerHTML = "No time difference";
		return;
	}

	if (minutes === 0) {
		timeDiff.innerHTML = String(Math.abs(hours)) + " hour" + (Math.abs(hours) === 1 ? "" : "s");
	} else {
		timeDiff.innerHTML = String(Math.abs(hours)) + " hour" + (Math.abs(hours) === 1 ? "" : "s") + " " + String(minutes) + " minutes";
	}
}
