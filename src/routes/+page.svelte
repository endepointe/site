<script lang="ts">
import Navigation from '../lib/components/navigation.svelte';
import { onMount } from 'svelte';

let canvas;

onMount(() => {
    const ctx = canvas.getContext('2d');
    /*
    let frame;

    (function loop() {
        frame = requestAnimationFrame(loop);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let p = 0; p < imageData.data.length; p += 4) {
            const i = p / 4;
            const x = i % canvas.width;
            const y = (i / canvas.height) >>> 0;

            const t = window.performance.now();

            const r = 64 + (128 * x) / canvas.width + 64 * Math.sin(t / 1000);
            const g = 64 + (128 * y) / canvas.height + 64 * Math.cos(t / 1400);
            const b = 128;

            imageData.data[p + 0] = r;
            imageData.data[p + 1] = g;
            imageData.data[p + 2] = b;
            imageData.data[p + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);
    })();

    return () => {
        cancelAnimationFrame(frame);
    };
    */
});
</script>

<Navigation/>
<h1>Home</h1>

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


