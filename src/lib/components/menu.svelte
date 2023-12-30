<!-- menu.svelte -->

<script>
  import Fullscreen from "./Fullscreen.svelte";
</script>

<style>
  h2 {
    text-align: center;
    font-size: 2rem;
  }
</style>

<Fullscreen let:isFull>
  <div>
    <img
      src="https://media.giphy.com/media/vCKC987OpQAco/giphy.gif"
      alt="Yes you are!" />
    <h2>
      {#if isFull}I am now in fullscreen!{/if}
    </h2>
  </div>
</Fullscreen>

