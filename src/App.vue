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
      contextItemMargin: 7,
      contextItemImageSize: 25,
      beatHeight: 50,
    };
  },
  computed: {
    /**
     * sets the bar height based on the beat height and the beats per bar
     */
    barHeight () {
      let height = this.$store.state["beatsPerBar"] * this.beatHeight;
      document.documentElement.style.setProperty('--barHeight', height + "px");
      return height;
    }
  },
  provide () {
    //set global constants for subcomponents
    //change these here
    return {
      signWidth: 40,
      barHeight: () => this.barHeight,
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
    // create the settings cookie
    let d = new Date();
    d.setTime(d.getTime() + 60 * 24 * 60 * 60 * 1000);
    let cookie = this.getSettingsCookie();
    let settingsObj = null;
    // check if there is an existing cookie
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
    // check for phone or tablet dimensions
    this.$store.dispatch("setIsPhone", window.matchMedia("only screen and (max-width: 760px)").matches);
    this.$store.dispatch("setIsTablet", window.matchMedia("only screen and (max-width: 1024px)").matches);
    // set global css variables for context menu dimensions
    document.documentElement.style.setProperty('--contextMenuWidth', this.contextMenuWidth + "px");
    document.documentElement.style.setProperty('--contextItemHeight', this.contextItemHeight + "px");
    document.documentElement.style.setProperty('--contextItemMargin', this.contextItemMargin + "px");
    document.documentElement.style.setProperty('--contextItemImageSize', this.contextItemImageSize + "px");
    setTimeout(function () {
      this.$store.dispatch("saveStateInHistory");
    }.bind(this), 100); 
  },
  methods: {
    /** 
     * get the settings cookie as a string
     * @returns the cookie
     */
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
  :root {
    --delete: #ff4b4b;
    --add: #94d481;
    --add-darker: #51a33c;

    --bg-lightest: #f4f4f4;
    --bg-lighter: #e9e9e9;
    --bg-light: #e5e5e5;
    --bg-light-less: #d6d6d6;
    --bg-light-less-2: #c1c1c1;
    --bg-light-least: #a3a3a3;
    --bg-dark: #434343;

    --selected-lighter: #84badb;
    --selected: #5e9fc7;
    --selected-darker: #446f97;

    --text-options: #343434;
    --text-shortcut: #808080;
    /* On-off-option */
  }
</style>
