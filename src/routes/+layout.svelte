<script lang="ts">
import {state_intro} from "$lib/store.ts";
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

let hasRun = 0;
let currentTheme: string;

// https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia 
const prefersDarkThemes = () => window.matchMedia(DARK_PREFERENCE).matches;

const applyTheme = () => {
    const preferredTheme = prefersDarkThemes() ? THEMES.DARK : THEMES.LIGHT;
    currentTheme = localStorage.getItem(STORAGE_KEY) ?? preferredTheme;
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
        localStorage
            .setItem(STORAGE_KEY, prefersDarkThemes() ? 
                THEMES.LIGHT : THEMES.DARK);
    }
    applyTheme();
};

const runIntro = () => {
    const intro = document.querySelector("#Introduction");
    setTimeout(() => {
        intro.style.opacity = 0;
        state_intro.set(1);
        setTimeout(() => {
            intro.remove();
        },2000);
    }, 1000);
}

onMount(() => {
    applyTheme();
    window.matchMedia(DARK_PREFERENCE).addEventListener("change", applyTheme);
    state_intro.subscribe((val) => {
        console.log(val);
    });
    // run this only once. should be controlled by the store.
    if (hasRun === 0) {
        runIntro();
    }
});
</script>

<div id="Introduction">Introduction box</div>

<div class="mask">
    <div class="mask-top"></div>
    <div class="mask-bottom"></div>
</div>

<section class="frame">
    <div class="frame-line frame-line-left"></div>
    <div class="frame-line frame-line-right"></div>
    <div class="frame-line frame-line-top"></div>
    <div class="frame-line frame-line-bottom"></div>
</section>

<nav>
    <div>
        <input type="checkbox" 
               checked={currentTheme !== THEMES.DARK} 
               on:click={toggleTheme}/>
    </div>
	<a href="/">home</a>
	<a href="/projects">projects</a>
</nav>

<slot></slot>

<style>
#Introduction {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    will-change: opacity;
    background-color: var(--bg-dark);
    color: var(--c-text);
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: .5em;
    font-size: 30px;
    opacity: 1;
    transition: opacity 1.5s ease;
}

/*media queries first, then everything else*/
@media (prefers-color-scheme: dark) {
    :global(body) {
        background: var(--bg-dark);
        color: white;
    }
}
:global(body.dark) {
    background: var(--bg-dark);
    color: white;
}
:global(body.light) {
    background: #ededed;
    color: black;
}
:global(:root) {
    --pad: max(20px, 4vmin);
    --bg-dark: rgb(32, 34, 43);
}

:global(*) {
    margin: 0; padding: 0;
}
:global(*),:global(*:before),:global(*:after) {
    margin: 0; padding: 0;
    box-sizing: inherit;
    -webkit-user-select: inherit;
    user-select: inherit;
    -webkit-user-drag: inherit;
    -webkit-tap-highlight-color: inherit;
    backface-visibility: inherit;
}

nav {
    z-index: 10;
    position: absolute;
    top:0; bottom:0; right:0;
    display:flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: nowrap;
    width: 100%;
    height: 40px;
}
nav a {
    text-decoration: none;
    padding: var(--pad);
    color: white;
}

/* https://helpx.adobe.com/indesign/using/frames-objects.html */
.mask {
    position: fixed;
    z-index: 3;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
}
.mask-top {
    top: 0;
}
.mask-bottom {
    bottom: 0;
}
.mask-top, .mask-bottom {
    position: absolute;
    left: 0;
    width: 100%;
    height: var(--pad);
    /*background-color: black;*/ /*design me differently*/
    transition-property: background-color;
    transition-duration: .9s;
    transition-timing-function: cubic-bezier(0.1, 0.4, 0.2, 1);
    opacity: .9;
}

.frame {
    position: fixed;
    z-index: 10;
    left: var(--pad);
    right: var(--pad);
    top: var(--pad);
    bottom: var(--pad);
    mix-blend-mode: difference;
    pointer-events: none;
}
.frame-line {
    position: absolute;
    background-color: white;
    opacity: 0.5;
}
.frame-line-left {
    left: 0;
    top: 0;
    width: 1px;
    height: 100%;
}
.frame-line-right {
    right: 0;
    top: 0;
    width: 1px;
    height: 100%;
}
.frame-line-top {
    left: 0;
    top: 0;
    width: 36%;
    height: 1px;
}
.frame-line-bottom {
    right: 0;
    bottom: 0;
    width: 36%;
    height: 1px;
}
</style>


