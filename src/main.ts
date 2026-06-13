// This code is partially adapted from https://codepen.io/imvpn22/pen/RwPvOgQ

// import Swal from 'sweetalert2'
import { DateTime } from 'luxon';
import tzCountries from './assets/tz-countries.json';
import timezones from './assets/tz-zones.json';

type TzRegion = keyof typeof tzCountries;

const deg = 6;
const localHour = document.querySelector(".primary-clock .hour") as HTMLDivElement;
const localMin = document.querySelector(".primary-clock .min") as HTMLDivElement;
const localSec = document.querySelector(".primary-clock .sec") as HTMLDivElement;
const secondaryHour = document.querySelector(".secondary-clock .hour") as HTMLDivElement;
const secondaryMin = document.querySelector(".secondary-clock .min") as HTMLDivElement;
const secondarySec = document.querySelector(".secondary-clock .sec") as HTMLDivElement;
const TZselector = document.querySelector(".clock-label.secondary-time") as HTMLDivElement;
const TZRegionButtons = document.querySelectorAll(".region-list-buttons button") as NodeListOf<HTMLButtonElement>;
const regionListButtons = document.querySelector(".region-list-buttons") as HTMLDivElement;
const countryList = document.querySelector(".country-list") as HTMLDivElement;
const countryListButtons = countryList.querySelector(".country-list-buttons") as HTMLDivElement;
const tzList = document.querySelector(".tz-list") as HTMLDivElement;
const tzPicker = document.querySelector(".tz-picker") as HTMLDialogElement;
const tzListButtons = tzList.querySelector(".tz-list-buttons") as HTMLDivElement;
const primaryClockTZ = document.querySelector(".primary-clock-tz") as HTMLSpanElement;
const tzPickerExitButton = document.querySelector(".tz-picker-exit-button") as HTMLButtonElement;
const tzPickerDoneButton = document.querySelector(".tz-picker-done-button") as HTMLButtonElement;
var selectedTZ: string | null = "UTC";

clearTZPicker();
setClock();
setInterval(setClock, 1000);

//=============================================================================
// Updates the rotation of the clock hands based on the current time in the
// local timezone and the selected secondary timezone. Also updates the
// timezone label for the primary clock.
//=============================================================================
function setClock() {
    const now = DateTime.now();
    primaryClockTZ.textContent = now.zoneName + " (" + now.toFormat("ZZZZ") + ")";
    const secondaryClock = now.setZone(selectedTZ || "UTC");

    const lhh = now.hour * 30;
    const lmm = now.minute * deg;
    const lss = now.second * deg;
    localHour.style.transform = `rotateZ(${lhh + lmm / 12}deg)`;
    localMin.style.transform = `rotateZ(${lmm}deg)`;
    localSec.style.transform = `rotateZ(${lss}deg)`;

    const uhh = secondaryClock.hour * 30;
    const umm = secondaryClock.minute * deg;
    const uss = secondaryClock.second * deg;
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
                selectedTZ = "UTC";
                TZselector.textContent = "UTC";
                return;
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
            const timezones = getTZByCountry(country);
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
            let ianaTZ = regionListButtons.querySelector("button.active-button")?.getAttribute("data-region") + "/" + tz.replace(/ /g, '_');
            const cityName = tz.split('/').pop()!.replace(/ /g, '_');
            TZselector.textContent = cityName + " (" + DateTime.now().setZone(ianaTZ).toFormat("ZZZZ") + ")";
            selectedTZ = ianaTZ || tz;
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
    countryListButtons.innerHTML = "";
    tzListButtons.innerHTML = "";
    countryList.style.display = "none";
    tzPicker.close();
    regionListButtons.querySelectorAll("button").forEach(btn => btn.classList.remove("active-button"));
});