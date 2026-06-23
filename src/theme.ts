const THEME_STORAGE_KEY = "chrono-theme";

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
// Sets up the theme toggle button and OS preference listener, then applies
// the user's preferred theme immediately.
//=============================================================================
export function initTheme(themeToggle: HTMLButtonElement) {
	applyTheme(getPreferredTheme());

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
}
