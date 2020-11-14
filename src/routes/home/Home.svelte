<script>
  import BlogTeaser from '../../components/BlogTeaser.svelte';
  export let data, helpers;
</script>

<style>
</style>

<svelte:head>
  <title>Home</title>
</svelte:head>

<h1>Blog</h1>
{#each data.markdown.blog as blog}
  <BlogTeaser {helpers} {blog} />
{/each}
