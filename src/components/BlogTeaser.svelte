<script>
  export let blog;
  export let helpers;
</script>

<style>
  .entry {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 1rem;
    margin-bottom: 1rem;
    background: white;
  }
</style>

<div class="entry">
  <a href={helpers.permalinks.blog({ slug: blog.slug })}>{blog.frontmatter.title}</a>
  <p>{blog.frontmatter.excerpt}</p>
</div>
