<template>
  <div id="app">
    <Header/>
    <SignLibrary/>
    <div id="interactionBox">
      <InteractionMenu/>
      <Score/>
    </div>
    
  </div>
</template>

<script>
//TODO: MAKE A COMPONENT WITH INTERACTIONBOX AND SIGNLIBRARY SO OTHER VIEWS MIGHT BE ADDED 
import Header from "./components/Header";
import InteractionMenu from "./components/InteractionMenu";
import SignLibrary from "./components/SignLibrary";
import Score from "./components/Score";

export default {
  name: "App",
  components: {
    Header,
    InteractionMenu,
    SignLibrary,
    Score
  }
};
</script>

<style>
body {
  margin: 0;

}
#interactionBox {
  width: 84%;
  float: right;
}
</style>
