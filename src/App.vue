<template>
  <div id="app">
    <Header/>
    <router-view/>
  </div>
</template>

<script>
import Header from "./components/Header";

/**
 * The app component
 * Loads a view and the header
 * Also sets global constants -> maybe refactor later?
 * @displayName App
 */
export default {
  name: "App",
  components: {
    Header,
  },
  provide: {
    //set global dimensions used by the score canvas, its subcomponents and the signs
    //change these here
    signWidth: 50,
    barHeight: 200,
    startBarOffset: 5,
    collumnWidth: 80,
    beatLineWidth: 25,
    addRemoveHeight: 40,
    addRemoveWidth: 10,
    innerCanvasMargin: 30,
    outerCanvasMargin: 200,
    handleDiam: 7,
    borderWidth: 2,
    contextMenuWidth: 250,
    contextItemHeight: 50,
  },
  mounted () {
  },
  methods: {
  
  }
};
</script>

<style>
body {
  margin: 0;

}
text {
  font-family: Arial;
}
</style>
