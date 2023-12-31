<script lang="ts">
import {setContext} from "svelte";
import {writable} from "svelte/store";
import type {LayoutData} from "./$types";
import {onMount} from "svelte";

const STORAGE_KEY = "theme";
const DARK_PREFERENCE = "(prefers-color-scheme: dark)";
const THEMES = {
    DARK: "dark",
    LIGHT: "light",
};
let currentTheme: string;
const prefersDarkThemes = () => window.matchMedia(DARK_PREFERENCE).matches;

const applyTheme = () => {
    const preferredTheme = prefersDarkThemes() ? THEMES.DARK : THEMES.LIGHT;
    currentTheme = localStorage.getItem(STORAGE_KEY) ?? preferredTheme;
    console.log(currentTheme);
    if (currentTheme === THEMES.DARK) {
        document.body.classList.remove(THEMES.LIGHT);
        document.body.classList.add(THEMES.DARK);
    } else {
        document.body.classList.remove(THEMES.DARK);
        document.body.classList.add(THEMES.LIGHT);
    }
};

const toggleTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
		// clear storage
		localStorage.removeItem(STORAGE_KEY);
    } else {
		// store opposite of preference
		localStorage.setItem(STORAGE_KEY, prefersDarkThemes() ? THEMES.LIGHT : THEMES.DARK);
    }

    applyTheme();
};

onMount(() => {
    applyTheme();
    window.matchMedia(DARK_PREFERENCE).addEventListener("change", applyTheme);
});
</script>

<nav>
	<a href="/">EP</a>
    <div>
        <input type="checkbox" 
               checked={currentTheme !== THEMES.DARK} 
               on:click={toggleTheme}/>
    </div>
</nav>

<slot></slot>

<style>
@media (prefers-color-scheme: dark) {
    :global(body) {
        background: black;
        color: white;
    }
}
:global(body.dark) {
    background: black;
    color: white;
}
:global(body.light) {
    background: #ededed;
    color: black;
}
</style>

