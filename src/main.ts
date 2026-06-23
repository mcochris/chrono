// This code is partially adapted from https://codepen.io/imvpn22/pen/RwPvOgQ

import { DateTime, IANAZone } from 'luxon';
import tzCountries from './assets/tz-countries.json';
import timezones from './assets/tz-zones.json';

type TzRegion = keyof typeof tzCountries;

const deg = 6;
const primaryClockHeader = document.getElementById("primary-clock-header") as HTMLAnchorElement;
const secondaryClockHeader = document.getElementById("secondary-clock-header") as HTMLAnchorElement;
const localHour = document.querySelector("#primary-clock .hour") as HTMLDivElement;
const localMin = document.querySelector("#primary-clock .min") as HTMLDivElement;
const localSec = document.querySelector("#primary-clock .sec") as HTMLDivElement;
const secondaryHour = document.querySelector("#secondary-clock .hour") as HTMLDivElement;
const secondaryMin = document.querySelector("#secondary-clock .min") as HTMLDivElement;
const secondarySec = document.querySelector("#secondary-clock .sec") as HTMLDivElement;
const TZselector = document.getElementById("secondary-time") as HTMLDivElement;
const TZRegionButtons = document.querySelectorAll("#region-list-buttons button") as NodeListOf<HTMLButtonElement>;
const regionListButtons = document.getElementById("region-list-buttons") as HTMLDivElement;
const countryList = document.getElementById("country-list") as HTMLDivElement;
const countryListButtons = document.getElementById("country-list-buttons") as HTMLDivElement;
const tzList = document.getElementById("tz-list") as HTMLDivElement;
const tzPicker = document.getElementById("tz-picker") as HTMLDialogElement;
const tzListButtons = document.getElementById("tz-list-buttons") as HTMLDivElement;
const primaryClockTZ = document.getElementById("primary-clock-tz") as HTMLSpanElement;
const tzPickerExitButton = document.getElementById("tz-picker-exit-button") as HTMLButtonElement;
const tzPickerDoneButton = document.getElementById("tz-picker-done-button") as HTMLButtonElement;
const primaryDateLegend = document.getElementById("primary-date-legend") as HTMLDivElement;
const secondaryDateLegend = document.getElementById("secondary-date-legend") as HTMLDivElement;
const timeDiffDiv = document.getElementById("time-diff") as HTMLDivElement;
const primaryTimeLegend = document.getElementById("primary-time-legend") as HTMLDivElement;
const secondaryTimeLegend = document.getElementById("secondary-time-legend") as HTMLDivElement;
const countryListHeader = document.getElementById("country-list-header") as HTMLDivElement;
const themeToggle = document.getElementById("theme-toggle") as HTMLButtonElement;

const THEME_STORAGE_KEY = "chrono-theme";

var primaryTZ: string = DateTime.now().zoneName;
var secondaryTZ: string = "UTC";

clearTZPicker();
setClock();
setInterval(setClock, 1000);
setTZDiff(primaryTZ, secondaryTZ || "UTC");
applyTheme(getPreferredTheme());

//=============================================================================
// Returns the user's last explicitly chosen theme, falling back to the OS
// dark/light preference if the user has never made a choice on this site.
//=============================================================================
function getPreferredTheme(): "light" | "dark" {
	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	if (stored === "light" || stored === "dark") return stored;
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

//=============================================================================
// Applies the given theme by setting data-theme on the document root, which
// drives the CSS custom property overrides.
//=============================================================================
function applyTheme(theme: "light" | "dark") {
	document.documentElement.setAttribute("data-theme", theme);
}

//=============================================================================
// Add click event listener to the theme toggle button. Flips the active
// theme and remembers the user's explicit choice for future visits.
//=============================================================================
themeToggle.addEventListener("click", () => {
	const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
	applyTheme(next);
	localStorage.setItem(THEME_STORAGE_KEY, next);
});

//=============================================================================
// If the user hasn't made an explicit choice, keep following the OS
// dark/light preference as it changes.
//=============================================================================
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
	if (localStorage.getItem(THEME_STORAGE_KEY)) return;
	applyTheme(event.matches ? "dark" : "light");
});

//=============================================================================
// Updates the rotation of the clock hands based on the current time in the
// local timezone and the selected secondary timezone. Also updates the
// timezone label for the primary clock.
//=============================================================================
function setClock() {
	primaryTZ = DateTime.now().zoneName;
	primaryClockHeader.textContent = primaryTZ + " (" + DateTime.now().toFormat("ZZZZ") + ")";
	primaryTimeLegend.textContent = DateTime.now().toFormat("hh:mm:ss a");
	primaryDateLegend.textContent = DateTime.now().toFormat("DDDD");
	secondaryTZ = secondaryTZ || "UTC";
	secondaryTimeLegend.textContent = DateTime.now().setZone(secondaryTZ).toFormat("hh:mm:ss a");
	secondaryDateLegend.textContent = DateTime.now().setZone(secondaryTZ).toFormat("DDDD");

	const lhh = DateTime.now().hour * 30;
	const lmm = DateTime.now().minute * deg;
	const lss = DateTime.now().second * deg;
	localHour.style.transform = `rotateZ(${lhh + lmm / 12}deg)`;
	localMin.style.transform = `rotateZ(${lmm}deg)`;
	localSec.style.transform = `rotateZ(${lss}deg)`;

	const uhh = DateTime.now().setZone(secondaryTZ).hour * 30;
	const umm = DateTime.now().setZone(secondaryTZ).minute * deg;
	const uss = DateTime.now().setZone(secondaryTZ).second * deg;
	secondaryHour.style.transform = `rotateZ(${uhh + umm / 12}deg)`;
	secondaryMin.style.transform = `rotateZ(${umm}deg)`;
	secondarySec.style.transform = `rotateZ(${uss}deg)`;
};

//=============================================================================
// Resets the timezone picker to its initial state by hiding the country and
// timezone lists, clearing the buttons, and removing the active button styles.
//=============================================================================
function clearTZPicker() {
	countryList.style.display = "none";
	tzList.style.display = "none";
	countryListButtons.innerHTML = "";
	tzListButtons.innerHTML = "";
	TZRegionButtons.forEach(btn => btn.classList.remove("active-button"));
	countryListButtons.querySelectorAll("button").forEach(btn => btn.classList.remove("active-button"));
	tzListButtons.querySelectorAll("button").forEach(btn => btn.classList.remove("active-button"));
	tzPickerDoneButton.classList.add("disabled-button");
}

//=============================================================================
// Add click event listener to the timezone selector div. Toggles the
// visibility of the timezone picker div.
//=============================================================================
TZselector.addEventListener("click", () => {
	tzPicker.open ? tzPicker.close() : tzPicker.showModal();
	clearTZPicker();
});

tzPicker.addEventListener("cancel", () => {
	clearTZPicker();
});

//=============================================================================
// Add click event listeners to the region buttons
//=============================================================================
TZRegionButtons.forEach(button => {
	button.addEventListener("click", () => {
		TZRegionButtons.forEach(btn => btn.classList.remove("active-button"));
		button.classList.add("active-button");
		countryListButtons.innerHTML = "";
		tzListButtons.innerHTML = "";
		countryList.style.display = "none";
		tzList.style.display = "none";
		const region = button.getAttribute("data-region");
		if (region) {
			if (region === "UTC") {
				tzPickerDoneButton.classList.remove("disabled-button");
				countryListHeader.textContent = "UTC is a single timezone with no country associations.";
			} else {
				countryListHeader.textContent = "Select country:";
			}
			const countries = getCountriesByRegion(region);
			countryListButtons.innerHTML = "";
			countries.forEach(country => {
				const btn = document.createElement("button");
				btn.type = "button";
				btn.setAttribute("data-country", country);
				btn.textContent = country;
				countryListButtons.appendChild(btn);
			});
			countryList.style.display = "";
		}
	});
});

//=============================================================================
// Add click event listener to the country list
//=============================================================================
countryList.addEventListener("click", (event) => {
	tzListButtons.innerHTML = "";
	tzList.style.display = "none";
	const target = event.target as HTMLElement;
	if (target.tagName === "BUTTON") {
		const country = target.getAttribute("data-country");
		countryListButtons.querySelectorAll("button").forEach(btn => btn.classList.remove("active-button"));
		target.classList.add("active-button");
		if (country) {
			const region = regionListButtons.querySelector("button.active-button")?.getAttribute("data-region") || "";
			const timezones = getTZByCountryAndRegion(country, region);
			if (timezones.length > 0) {
				tzListButtons.innerHTML = "";
				timezones.forEach(tz => {
					const btn = document.createElement("button");
					btn.type = "button";
					btn.setAttribute("data-tz", tz);
					btn.textContent = tz.split('/').pop()!.replace(/_/g, ' ');
					tzListButtons.appendChild(btn);
				});
				tzList.style.display = "";
			}
		}
	}
});

//=============================================================================
// Add click event listener to the timezone list
//=============================================================================
tzList.addEventListener("click", (event) => {
	const target = event.target as HTMLElement;
	if (target.tagName === "BUTTON") {
		const tz = target.getAttribute("data-tz");
		tzListButtons.querySelectorAll("button").forEach(btn => btn.classList.remove("active-button"));
		target.classList.add("active-button");
		if (tz) {
			tzPickerDoneButton.classList.remove("disabled-button");
		}
	}
});

//=============================================================================
// Returns a sorted, unique list of timezones in the given IANA country.
//=============================================================================
function getTZByCountry(country: string): string[] {
	return Object.prototype.hasOwnProperty.call(timezones, country)
		? (timezones as Record<string, string[]>)[country]
		: [];
}

//=============================================================================
// Returns timezones for a country filtered to only those valid under the given
// IANA region prefix (e.g. "Pacific" + "Honolulu" → "Pacific/Honolulu").
//=============================================================================
function getTZByCountryAndRegion(country: string, region: string): string[] {
	return getTZByCountry(country).filter(tz =>
		IANAZone.isValidZone(region + '/' + tz.replace(/ /g, '_'))
	);
}

//=============================================================================
// Returns a sorted, unique list of countries in the given IANA region.
//=============================================================================
function getCountriesByRegion(region: string): string[] {
	const key = region as TzRegion;
	return Object.prototype.hasOwnProperty.call(tzCountries, key)
		? [...tzCountries[key]].sort()
		: [];
}

//=============================================================================
// Add click event listener to the exit button. Resets the timezone picker to
// its initial state and hides the TZ picker div.
//=============================================================================
tzPickerExitButton.addEventListener("click", () => {
	tzPicker.close();
	clearTZPicker();
});

//=============================================================================
// Click handler for "Done" button in TZ selector. Selects the specified TZ, 
// updates the display, and closes the TZ picker.
//=============================================================================
tzPickerDoneButton.addEventListener("click", () => {
	const activeTZButton = tzListButtons.querySelector("button.active-button");
	if (activeTZButton) {
		const tz = activeTZButton.getAttribute("data-tz");
		if (tz) {
			let ianaTZ = regionListButtons.querySelector("button.active-button")?.getAttribute("data-region") + "/" + tz.replace(/ /g, '_');
			const cityName = tz.split('/').pop()!.replace(/ /g, '_');
			TZselector.textContent = cityName + " (" + DateTime.now().setZone(ianaTZ).toFormat("ZZZZ") + ")";
			secondaryTZ = ianaTZ || tz;
			tzPicker.close();
			clearTZPicker();
		}
	} else {
		TZselector.textContent = "UTC";
		secondaryTZ = "UTC";
		tzPicker.close();
		clearTZPicker();
	}
});

//=============================================================================
// Once the TZ picker is closed, update the time difference and refresh the
// clocks.
//=============================================================================
tzPicker.addEventListener("close", () => {
	setTZDiff(primaryTZ, secondaryTZ || "UTC");
	setClock();
});

//=============================================================================
// Calculates the time difference between two timezones and updates the display
//=============================================================================
function setTZDiff(tz1: string, tz2: string) {
	const offsetDiffMinutes = DateTime.now().setZone(tz2).offset - DateTime.now().setZone(tz1).offset;
	const hours = Math.trunc(offsetDiffMinutes / 60);
	const minutes = Math.abs(offsetDiffMinutes % 60);
	if (hours === 0 && minutes === 0) {
		timeDiffDiv.innerHTML = "No time difference";
		return;
	}

	if (minutes === 0) {
		timeDiffDiv.innerHTML = String(Math.abs(hours)) + " hour" + (Math.abs(hours) === 1 ? "" : "s");
	} else {
		timeDiffDiv.innerHTML = String(Math.abs(hours)) + " hour" + (Math.abs(hours) === 1 ? "" : "s") + " " + String(minutes) + " minutes";
	}
}