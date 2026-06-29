import { DateTime, IANAZone } from 'luxon';
import tzCountries from './assets/tz-countries.json';
import timezones from './assets/tz-zones.json';

type TzRegion = keyof typeof tzCountries;
type ClockTarget = "primary" | "secondary";

const primaryClockHeader = document.getElementById("primary-clock-header") as HTMLAnchorElement;
const secondaryClockHeader = document.getElementById("secondary-clock-header") as HTMLAnchorElement;
const TZRegionButtons = document.querySelectorAll("#region-list-buttons button") as NodeListOf<HTMLButtonElement>;
const regionListButtons = document.getElementById("region-list-buttons") as HTMLDivElement;
const countryList = document.getElementById("country-list") as HTMLDivElement;
const countryListButtons = document.getElementById("country-list-buttons") as HTMLDivElement;
const countryListHeader = document.getElementById("country-list-header") as HTMLDivElement;
const tzList = document.getElementById("tz-list") as HTMLDivElement;
const tzListButtons = document.getElementById("tz-list-buttons") as HTMLDivElement;
const tzPicker = document.getElementById("tz-picker") as HTMLDialogElement;
const tzPickerExitButton = document.getElementById("tz-picker-exit-button") as HTMLButtonElement;
const tzPickerDoneButton = document.getElementById("tz-picker-done-button") as HTMLButtonElement;

export let primaryTZ: string = DateTime.now().zoneName;
export let secondaryTZ: string = "UTC";

// Tracks which clock's header was clicked to open the picker, so the Done
// button knows whether to update primaryTZ or secondaryTZ.
let activeTarget: ClockTarget = "secondary";

//=============================================================================
// Resets the timezone picker to its initial state by hiding the country and
// timezone lists, clearing the buttons, and removing the active button styles.
//=============================================================================
export function clearTZPicker() {
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
// Returns a sorted, unique list of timezones in the given IANA country.
//=============================================================================
export function getTZByCountry(country: string): string[] {
	return Object.prototype.hasOwnProperty.call(timezones, country)
		? (timezones as Record<string, string[]>)[country]
		: [];
}

//=============================================================================
// Returns timezones for a country filtered to only those valid under the given
// IANA region prefix (e.g. "Pacific" + "Honolulu" → "Pacific/Honolulu").
//=============================================================================
export function getTZByCountryAndRegion(country: string, region: string): string[] {
	return getTZByCountry(country).filter(tz =>
		IANAZone.isValidZone(region + '/' + tz.replace(/ /g, '_'))
	);
}

//=============================================================================
// Returns a sorted, unique list of countries in the given IANA region.
//=============================================================================
export function getCountriesByRegion(region: string): string[] {
	const key = region as TzRegion;
	return Object.prototype.hasOwnProperty.call(tzCountries, key)
		? [...tzCountries[key]].sort()
		: [];
}

//=============================================================================
// Wires up all event listeners for the timezone picker dialog. `onApply` is
// invoked once the picker closes, so the caller can refresh anything that
// depends on the (possibly new) secondaryTZ, e.g. the time difference and
// clock faces.
//=============================================================================
export function initTZPicker(onApply: () => void) {
	//=============================================================================
	// Add click event listeners to the timezone selector headers. Toggles the
	// visibility of the timezone picker dialog and records which clock's
	// timezone is being changed.
	//=============================================================================
	function openPicker(target: ClockTarget) {
		activeTarget = target;
		tzPicker.open ? tzPicker.close() : tzPicker.showModal();
		clearTZPicker();
	}

	primaryClockHeader.addEventListener("click", () => openPicker("primary"));
	secondaryClockHeader.addEventListener("click", () => openPicker("secondary"));

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
				} else if (region === "Local") {
					tzPickerDoneButton.classList.remove("disabled-button");
					countryListHeader.textContent = "Local time is time zone your computer us set to.";
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
		const header = activeTarget === "primary" ? primaryClockHeader : secondaryClockHeader;
		const activeTZButton = tzListButtons.querySelector("button.active-button");
		if (activeTZButton) {
			const tz = activeTZButton.getAttribute("data-tz");
			if (tz) {
				let ianaTZ = regionListButtons.querySelector("button.active-button")?.getAttribute("data-region") + "/" + tz.replace(/ /g, '_');
				const TZname = tz.split('/').pop()!.replace(/ /g, '_');
				const TZcode = DateTime.now().setZone(ianaTZ).toFormat("ZZZZ");
				header.textContent = `${TZname} (${TZcode})`;
				if (activeTarget === "primary") {
					primaryTZ = ianaTZ || tz;
				} else {
					secondaryTZ = ianaTZ || tz;
				}
				tzPicker.close();
				clearTZPicker();
			}
		} else {
			for (var i = 0; i < TZRegionButtons.length; i++) {
				if (TZRegionButtons[i].classList.contains("active-button")) {
					const customRegion = TZRegionButtons[i].getAttribute("data-region");
					switch (customRegion) {
						case "UTC":
							header.textContent = "UTC";
							if (activeTarget === "primary") {
								primaryTZ = "UTC";
							} else {
								secondaryTZ = "UTC";
							}
							break;
						case "Local":
							header.textContent = DateTime.now().toFormat("ZZZZ");
							if (activeTarget === "primary") {
								primaryTZ = DateTime.now().zoneName;
							} else {
								secondaryTZ = DateTime.now().zoneName;
							}
							break;
					}
				}
			}
			tzPicker.close();
			clearTZPicker();
		}
	});

	//=============================================================================
	// Once the TZ picker is closed, update the time difference and refresh the
	// clocks.
	//=============================================================================
	tzPicker.addEventListener("close", () => {
		onApply();
	});
}
