<template>
  <div id="app">
    <router-view/>
    <div class="alert-container" v-if="isPhone">
      <div class="alert-box">
        <p class="alert-text">We recommend using a Tablet or PC to use this editor. Using a phone is possible, but not advised.</p>
        <div class="divider-bar"></div>
        <div class="alert-btn-container">
          <button class="alert-btn" @click="isPhone=false">Got it</button><p>>></p>
        </div>  
      </div>
    </div> 
  </div>
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
      isPhone: false,
      isTablet: false,
      contextMenuWidth: 250,
      contextItemHeight: 50,
      contextItemMargin: 10,
      contextItemImageSize: 25,
    };
  },
  provide () {
    //set global dimensions used by the score canvas, its subcomponents and the signs
    //change these here
    return {
      signWidth: 40,
      barHeight: 200,
      startBarOffset: 5,
      collumnWidth: 80,
      beatLineWidth: 25,
      addRemoveHeight: 40,
      addRemoveWidth: 10,
      innerCanvasMargin: 30,
      outerCanvasMargin: 50,
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
      let testObj = {seenIntro: false, language: "eng", showHelpLines: true};
      document.cookie = "settings=" + JSON.stringify(testObj) + "; expires=" + d.toUTCString() + "; path=/";
    } else {
      //store action set settings
    }
    this.isPhone = window.matchMedia("only screen and (max-width: 760px)").matches;
    this.isTablet = window.matchMedia("only screen and (max-width: 1024px)").matches;
    document.documentElement.style.setProperty('--contextMenuWidth', this.contextMenuWidth + "px");
    document.documentElement.style.setProperty('--contextItemHeight', this.contextItemHeight + "px");
    document.documentElement.style.setProperty('--contextItemMargin', this.contextItemMargin + "px");
    document.documentElement.style.setProperty('--contextItemImageSize', this.contextItemImageSize + "px");
  },
  methods: {
    getSettingsCookie () {
      const settings =  document.cookie.match('(^|;)\\s*' + "settings" + '\\s*=\\s*([^;]+)')?.pop() || '';
      return settings;
    }
  }
};
</script>

<style>
  body {
    margin: 0;
    user-select: none;
  }
  .alert-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0,0,0,.5);
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
  }

    .alert-box {
      width: 80%;
      border-radius: 30px;
      background-color: white;
      box-shadow: 0 1px 8px 5px rgba(0, 0, 0, 0.15);
    }
    .alert-text {
      width: 100%;
      padding: 0 1em;
      margin-bottom: 0.5em;
      box-sizing: border-box;
      font-size: 1.5em;
    }

    .divider-bar {
      height: 0;
      width:  calc(100% - 4em);
      margin: 0 2em;
      border-bottom: 2px solid;

    }

    .alert-btn-container {
      width: 100%;
      margin: 1em 0;
      display: flex;
      justify-content: center;
    }

    .alert-btn-container > * {
      font-size: 1.5em;
      color: #21a3fa;
    }

      .alert-btn {
        background-color: white;
        border: 0px;
        
      }

  text, p {
    font-family: Arial;
  }
</style>
