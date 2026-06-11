// This code is adapted from https://codepen.io/imvpn22/pen/RwPvOgQ
// Just noticed accessing localStorage is banned from codepen, so disabling saving theme to localStorage
import Swal from 'sweetalert2'
import { DateTime } from 'luxon';
import tzCountries from './assets/tz-countries.json';

type TzRegion = keyof typeof tzCountries;

const deg = 6;
const localHour = document.querySelector(".local-time .hour") as HTMLDivElement;
const localMin = document.querySelector(".local-time .min") as HTMLDivElement;
const localSec = document.querySelector(".local-time .sec") as HTMLDivElement;
const utcHour = document.querySelector(".utc-time .hour") as HTMLDivElement;
const utcMin = document.querySelector(".utc-time .min") as HTMLDivElement;
const utcSec = document.querySelector(".utc-time .sec") as HTMLDivElement;
const TZselector = document.querySelector(".clock-label.calc-time") as HTMLDivElement;
const TZRegionButtons = document.querySelectorAll(".tz-regions button") as NodeListOf<HTMLButtonElement>;
const countryList = document.querySelector(".country-list") as HTMLDivElement;

const setClock = () => {
    const now = DateTime.now();

    const lhh = now.hour * 30;
    const lmm = now.minute * deg;
    const lss = now.second * deg;
    localHour.style.transform = `rotateZ(${lhh + lmm / 12}deg)`;
    localMin.style.transform = `rotateZ(${lmm}deg)`;
    localSec.style.transform = `rotateZ(${lss}deg)`;

    const uhh = now.toUTC().hour * 30;
    const umm = now.toUTC().minute * deg;
    const uss = now.toUTC().second * deg;
    utcHour.style.transform = `rotateZ(${uhh + umm / 12}deg)`;
    utcMin.style.transform = `rotateZ(${umm}deg)`;
    utcSec.style.transform = `rotateZ(${uss}deg)`;
};

// first time
setClock();
// Update every 1000 ms
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
        const region = button.getAttribute("data-region");
        if (region) {
            if (region === "UTC") {
                countryList.innerHTML = "";
                return; // Skip the "UTC" region as it not a country
            }
            const countries = getCountriesByRegion(region);
            countryList.innerHTML = "";
            countries.forEach(country => {
                countryList.innerHTML += `<button type="button" data-country="${country}">${country}</button>`;
            });
        }
    });
});

countryList.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "BUTTON") {
        const country = target.getAttribute("data-country");
        if (country) {
            console.log(`Selected country: ${country}`);
        }
    }
});

//=============================================================================
// Returns a sorted, unique list of country names whose timezones belong to the given IANA region.
//=============================================================================
function getCountriesByRegion(region: string): string[] {
    const key = region as TzRegion;
    return Object.prototype.hasOwnProperty.call(tzCountries, key)
        ? [...tzCountries[key]].sort()
        : [];
}
