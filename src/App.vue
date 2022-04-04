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
    barHeight () {
      let height = this.$store.state["beatsPerBar"] * this.beatHeight;
      document.documentElement.style.setProperty('--barHeight', height + "px");
      return height;
    }
  },
  provide () {
    //set global dimensions used by the score canvas, its subcomponents and the signs
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

    --selected-lighter: #84badb;
    --selected: #5e9fc7;
    --selected-darker: #446f97;

    --text-options: #343434;
    --text-shortcut: #808080;
    /* On-off-option */
  }
</style>
