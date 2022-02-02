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