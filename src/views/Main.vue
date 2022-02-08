<template>
  <div class="main">
    <SignLibrary/>
    <div id="interactionBox">
      <InteractionMenu/>
      <Score/>
    </div>
  </div>
</template>

<script>
import InteractionMenu from "../components/InteractionMenu";
import SignLibrary from "../components/SignLibrary";
import Score from "../components/Score";

/**
 * The main editor view
 * additional views can be added in the same folder, and need to be registered to the router
 * @displayName Main View
 */
export default {
  name: 'Main',
  components: {
    InteractionMenu,
    SignLibrary,
    Score
  }
}
</script>

<style>

#interactionBox {
  width: 84%;
  float: right;
}
</style>