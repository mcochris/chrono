// This code is partially adapted from https://codepen.io/imvpn22/pen/RwPvOgQ

import Swal from 'sweetalert2'
import { DateTime } from 'luxon';
import tzCountries from './assets/tz-countries.json';
import tzCities from './assets/tz-cities.json';

type TzRegion = keyof typeof tzCountries;

const deg = 6;
const localHour = document.querySelector(".primary-clock .hour") as HTMLDivElement;
const localMin = document.querySelector(".primary-clock .min") as HTMLDivElement;
const localSec = document.querySelector(".primary-clock .sec") as HTMLDivElement;
const utcHour = document.querySelector(".secondary-clock .hour") as HTMLDivElement;
const utcMin = document.querySelector(".secondary-clock .min") as HTMLDivElement;
const utcSec = document.querySelector(".secondary-clock .sec") as HTMLDivElement;
const TZselector = document.querySelector(".clock-label.secondary-time") as HTMLDivElement;
const TZRegionButtons = document.querySelectorAll(".region-list-buttons button") as NodeListOf<HTMLButtonElement>;
const countryList = document.querySelector(".country-list") as HTMLDivElement;
const countryListButtons = countryList.querySelector(".country-list-buttons") as HTMLDivElement;
const cityList = document.querySelector(".city-list") as HTMLDivElement;
const cityListButtons = cityList.querySelector(".city-list-buttons") as HTMLDivElement;
const tzList = document.querySelector(".tz-list") as HTMLDivElement;
const tzListButtons = tzList.querySelector(".tz-list-buttons") as HTMLDivElement;
var selectedTZ: string | null = "UTC";

countryListButtons.innerHTML = "";
cityListButtons.innerHTML = "";
tzListButtons.innerHTML = "";
countryList.style.display = "none";
cityList.style.display = "none";
tzList.style.display = "none";

const setClock = () => {
    const now = DateTime.now();
    const rezoned = now.setZone(selectedTZ || "UTC");

    const lhh = now.hour * 30;
    const lmm = now.minute * deg;
    const lss = now.second * deg;
    localHour.style.transform = `rotateZ(${lhh + lmm / 12}deg)`;
    localMin.style.transform = `rotateZ(${lmm}deg)`;
    localSec.style.transform = `rotateZ(${lss}deg)`;

    const uhh = rezoned.hour * 30;
    const umm = rezoned.minute * deg;
    const uss = rezoned.second * deg;
    utcHour.style.transform = `rotateZ(${uhh + umm / 12}deg)`;
    utcMin.style.transform = `rotateZ(${umm}deg)`;
    utcSec.style.transform = `rotateZ(${uss}deg)`;
};

setClock();
setInterval(setClock, 1000);

//=============================================================================
// Add click event listener to the timezone selector
//=============================================================================
TZselector.addEventListener("click", () => {
    Swal.fire({
        title: 'Error!',
        text: 'Do you want to continue',
        icon: 'error',
        confirmButtonText: 'Cool'
    })
});

//=============================================================================
// Add click event listeners to the region buttons
//=============================================================================
TZRegionButtons.forEach(button => {
    button.addEventListener("click", () => {
        TZRegionButtons.forEach(btn => btn.classList.remove("active-button"));
        button.classList.add("active-button");
        countryListButtons.innerHTML = "";
        cityListButtons.innerHTML = "";
        tzListButtons.innerHTML = "";
        countryList.style.display = "none";
        cityList.style.display = "none";
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
    cityListButtons.innerHTML = "";
    tzListButtons.innerHTML = "";
    cityList.style.display = "none";
    tzList.style.display = "none";
    const target = event.target as HTMLElement;
    if (target.tagName === "BUTTON") {
        const country = target.getAttribute("data-country");
        countryListButtons.querySelectorAll("button").forEach(btn => btn.classList.remove("active-button"));
        target.classList.add("active-button");
        if (country) {
            const cities = getCitiesByCountry(country);
            if (cities.length > 0) {
                cityListButtons.innerHTML = "";
                cities.forEach(city => {
                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.setAttribute("data-city", city);
                    btn.textContent = city;
                    cityListButtons.appendChild(btn);
                });
                cityList.style.display = "";
            }
        }
    }
});

//=============================================================================
// Add click event listener to the city list
//=============================================================================
cityList.addEventListener("click", (event) => {
    tzListButtons.innerHTML = "";
    tzList.style.display = "none";
    const target = event.target as HTMLElement;
    if (target.tagName === "BUTTON") {
        const city = target.getAttribute("data-city");
        cityListButtons.querySelectorAll("button").forEach(btn => btn.classList.remove("active-button"));
        target.classList.add("active-button");
        if (city) {
            const timezones = getTimezonesByCity(city);
            tzListButtons.innerHTML = "";
            timezones.forEach(tz => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.setAttribute("data-tz", tz);
                btn.textContent = tz;
                tzListButtons.appendChild(btn);
            });
            tzList.style.display = "";
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
            selectedTZ = tz;
            TZselector.textContent = tz + " (" + DateTime.now().setZone(tz).toFormat("ZZZZ") + ")";
        }
    }
});

//=============================================================================
// Returns a sorted, unique list of city names in the given IANA country.
//=============================================================================
function getCitiesByCountry(country: string): string[] {
    return Object.prototype.hasOwnProperty.call(tzCities, country)
        ? (tzCities as Record<string, string[]>)[country]
        : [];
}

//=============================================================================
// Returns IANA timezone identifiers whose city component matches the given name.
//=============================================================================
function getTimezonesByCity(city: string): string[] {
    const cityKey = city.replace(/ /g, '_');
    return (Intl as unknown as { supportedValuesOf(key: string): string[] })
        .supportedValuesOf('timeZone')
        .filter(tz => tz.split('/').pop() === cityKey);
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
