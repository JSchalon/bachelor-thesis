<template>
  <main class="main">
    <div>
      <Header/>
      <SignLibrary/>
      <div id="interactionBox">
        <InteractionMenu/>
        <Score/>
      </div>
    </div>
  </main>
</template>

<script>

/**
 * The main editor view
 * additional views can be added in the same folder, and need to be registered to the router
 * @displayName Main View
 */
export default {
  name: 'Main',
}
</script>

<style>
  #interactionBox {
    width: calc(100% - 250px);
    float: right;
  }
</style>