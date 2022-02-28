<template>
  <main class="main">
    <ScoreController/>
  </main>
</template>

<script>
import ScoreController from "../components/ScoreController.vue";

/**
 * The main editor view
 * additional views can be added in the same folder, and need to be registered to the router
 * @displayName Main View
 */
export default {
  name: 'Main',
  components: {
    ScoreController,
  }
}
</script>

<style>

</style>