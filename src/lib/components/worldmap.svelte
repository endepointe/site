<script lang="ts">
import { onMount } from 'svelte';

let canvas;

onMount(() => {
    const ctx = canvas.getContext('2d');
});
</script>

<canvas bind:this={canvas} width={2000} height={857} />

<style>
	canvas {
		width: 100%;
		height: 100%;
		background-color: #666;
		-webkit-mask: url(/world.svg) 0 0 no-repeat;
		mask: url(/world.svg) 0 0 no-repeat;
	}
</style>


