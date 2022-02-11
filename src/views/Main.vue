<template>
  <main class="main">
    <InteractionMenu/>
  </main>
</template>

<script>
import InteractionMenu from "../components/ScoreController.vue";

/**
 * The main editor view
 * additional views can be added in the same folder, and need to be registered to the router
 * @displayName Main View
 */
export default {
  name: 'Main',
  components: {
    InteractionMenu,
  }
}
</script>

<style>

</style>