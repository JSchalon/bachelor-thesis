<template>
  <div id="app">
    <Header/>
    <router-view/>
  </div>
</template>

<script>
//TODO: MAKE A COMPONENT WITH INTERACTIONBOX AND SIGNLIBRARY SO OTHER VIEWS MIGHT BE ADDED 
import Header from "./components/Header";

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
    collumnWidth: 80,
    addRemoveHeight: 40,
    addRemoveWidth: 10,
    canvasMargin: 30,
    handleDiam: 7,
    borderWidth: 2,
  },
};
</script>

<style>
body {
  margin: 0;

}
</style>
