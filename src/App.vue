<template>
  <router-view/>
</template>

<script>


/**
 * The app component
 * Loads a view and the header
 * Also sets global constants -> maybe refactor later?
 * @displayName App
 */
export default {
  name: "App",
  components: {
    
  },
  data() {
    return {
      contextMenuWidth: 250,
      contextItemHeight: 45,
      contextItemMargin: 10,
      contextItemImageSize: 25,
      barHeight: 200,
    };
  },
  provide () {
    //set global dimensions used by the score canvas, its subcomponents and the signs
    //change these here
    return {
      signWidth: 40,
      barHeight: this.barHeight,
      startBarOffset: 5,
      columnWidth: 70,
      beatLineWidth: 25,
      addRemoveHeight: 40,
      addRemoveWidth: 10,
      outerCanvasMargin: 70,
      handleDiam: 7,
      borderWidth: 2,
      contextMenuWidth: this.contextMenuWidth,
      contextItemHeight: this.contextItemHeight,
      contextItemMargin: this.contextItemMargin,
      contextItemImageSize: this.contextItemImageSize,
      libraryImgHeight: 60,
    }
  },
  mounted () {
    let d = new Date();
    d.setTime(d.getTime() + 60 * 24 * 60 * 60 * 1000);
    let cookie = this.getSettingsCookie();
    let settingsObj = null;
    if (cookie) {
      settingsObj = JSON.parse(this.getSettingsCookie());
    }
    if (settingsObj == null) {
      //create settings cookie
      let newCookie = {seenIntro: false, language: "eng", showHelpLines: true, showScoreDescription: false};
      document.cookie = "settings=" + JSON.stringify(newCookie) + "; expires=" + d.toUTCString() + "; path=/";
    } else {
      this.$store.dispatch("changeSettings", settingsObj);
    }
    this.$store.dispatch("setIsPhone", window.matchMedia("only screen and (max-width: 760px)").matches);
    this.$store.dispatch("setIsTablet", window.matchMedia("only screen and (max-width: 1024px)").matches);
    document.documentElement.style.setProperty('--contextMenuWidth', this.contextMenuWidth + "px");
    document.documentElement.style.setProperty('--contextItemHeight', this.contextItemHeight + "px");
    document.documentElement.style.setProperty('--contextItemMargin', this.contextItemMargin + "px");
    document.documentElement.style.setProperty('--contextItemImageSize', this.contextItemImageSize + "px");
    document.documentElement.style.setProperty('--barHeight', this.barHeight + "px");
  },
  methods: {
    getSettingsCookie () {
      const settings =  document.cookie.match('(^|;)\\s*' + "settings" + '\\s*=\\s*([^;]+)')?.pop() || '';
      return settings;
    },
  }
};
</script>

<style>
  body {
    margin: 0;
    user-select: none;
    overflow: hidden;
  }
  text, p {
    font-family: Arial;
  }
</style>
