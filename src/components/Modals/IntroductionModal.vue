<template>
<div class="modal" :class="modalActive ? 'is-active' : ''" :style="getPosition">
  <div class="modal-content">
    <div class="box">
      <div class="is-flex is-align-items-top">
        <h1 class="title is-flex is-align-items-center is-4" v-html="introData[curIndex]['title']"></h1>
        <button class="delete is-large custom-close mb-4" aria-label="close" @click="$emit('disableModal')"><img src="@/assets/images/interaction-menu/x.svg" class="option-img"></button>
      </div>
      <p v-if="!$store.state['isTablet'] || !('textTablet' in introData[curIndex])" class="mb-4" v-html="introData[curIndex]['text']"></p>
      <p v-else class="mb-4" v-html="introData[curIndex]['textTablet']"></p>
      <p v-if="'image' in introData[curIndex]" class="mb-4 is-flex is-justify-content-center"><img width="300" :src="imgSrc" /></p>
      <div class="is-flex is-justify-content-center mb-4">
        <button v-if="curIndex > 0" class="button nav-btn has-text-white mr-2" @click="back()">Back</button>
        <button v-if="curIndex < introData.length - 1" class="button nav-btn has-text-white" @click="next()">{{introData[curIndex]["buttonText"]}}</button>
        <button v-else class="button nav-btn has-text-white" @click="$emit('disableModal')">{{introData[curIndex]["buttonText"]}}</button>
      </div>
      <div class="is-flex is-justify-content-center">
        <div 
          v-show="
            curIndex >= Object.keys(breakPoints)[index] && 
            curIndex < parseInt(Object.keys(breakPoints)[index]) + parseInt(breakPoints[Object.keys(breakPoints)[index]]) &&
            parseInt(breakPoints[Object.keys(breakPoints)[index]]) > 1
          "
          :key="index" v-for="(points, index) in Object.keys(breakPoints).length"
        >
          <button 
            class="button nav-dot mx-2" 
            :class="curIndex - parseInt(Object.keys(breakPoints)[index]) + 1 == elem ? 'active':''"
            @click="switchIndex((parseInt(Object.keys(breakPoints)[index]) - 1 + elem))" 
            :key="elem" 
            v-for="elem in breakPoints[Object.keys(breakPoints)[index]]"
          />
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
/**
 * The general introdcution modal component
 * Loads the requested introduction
 * @emits disableModal closes the loaded introduction
 * @emits switchHighlight changes the highlighted element
 * @displayName Introduction Modal
 */
export default {
  name: 'IntroductionModal',
  emits: ["disableModal", "switchHighlight"],
  props: {
    modalActive: Boolean,
    intro: String,
  },
  data() {
    return {
      introData: [{title: "Title", text: "Text"}],
      curIndex: 0,
      breakPoints: {},
    };
  },
  watch: {
    /**
     * observes if the modal is active
     * @param value the new observed value 
     */
    modalActive (value) {
      // on state change -> reset vuex parameters
      this.resetState();
      if (value) { // modal active -> load introduction
        if (this.introData[this.curIndex].highlightID != "none") { // check if correct element is highlighted
          document.getElementById(this.introData[this.curIndex].highlightID).classList.add("tut-highlight");
        }
        this.switchState();
      } else { // modal inactive -> remove highlighting
        if (this.introData[this.curIndex].highlightID != "none") {
          if (this.introData[this.curIndex].highlightID.constructor === Array) {
            for (let index in this.introData[this.curIndex].highlightID) {
              document.getElementById(this.introData[this.curIndex].highlightID[index]).classList.remove("tut-highlight");
            }
          } else {
            document.getElementById(this.introData[this.curIndex].highlightID).classList.remove("tut-highlight");
          }
        }
      }
    },
    /**
     * observes the intro prop and loads the specific introduction on change
     */
    intro () {
      if (this.modalActive) {
        //reset current intro index
        this.curIndex = 0;
        // load the intro from the json file
        let lang = this.$store.state["language"];
        let json = require('@/assets/editor-help/' + this.intro + lang + '.json');
        let obj = JSON.parse(JSON.stringify(json));
        let data =[];
        for (const elem of Object.entries(obj.introData)) {
          data.push(elem[1]);
        }
        //set the breakpoints for the navigation dots
        this.breakPoints = obj.breakPoints;
        //set the introdcution data
        this.introData = data;
      } 
    }
  },
  computed: {
    /**
     * calculates the current position of the modal
     * @returns the modal translation
     */
    getPosition () {
      if (!("position" in this.introData[this.curIndex])) {
        return "";
      } else {
        const pos = this.introData[this.curIndex].position;
        let elemRect = document.getElementById(pos.elem).getBoundingClientRect();
        return "transform: translate(" + elemRect[pos.hSide] + "px, " + elemRect[pos.vSide] + "px);";
      }
    },
    /**
     * loads the image for the current introduction index, if there is one
     * @returns the image file
     */
    imgSrc () {
      if ("image" in this.introData[this.curIndex] && this.modalActive) {
        let introCat = this.intro;
        return require("@/assets/images/introduction-images/" + introCat.slice(0,-1) + "/" + this.introData[this.curIndex].image);
      } else {
        return "";
      }
    }
  },
  mounted () {
    // loads the first introduction at mount via the intro prop
    let lang = this.$store.state["language"];
    let json = require('@/assets/editor-help/' + this.intro + lang + '.json');
    let obj = JSON.parse(JSON.stringify(json));
    let data =[];
    for (const elem of Object.entries(obj.introData)) {
      data.push(elem[1]);
    }
    this.breakPoints = obj.breakPoints;
    this.introData = data;
  },
  methods: {
    /**
     * switches the view to a new index
     * @param index the new index
     */
    switchIndex (index) {
      this.resetState();
      if (this.introData[this.curIndex].highlightID != "none") { // currently highlighting elements -> unhighlight
        if (this.introData[this.curIndex].highlightID.constructor === Array) { // multiple highlighted items
          for (let index in this.introData[this.curIndex].highlightID) {
            document.getElementById(this.introData[this.curIndex].highlightID[index]).classList.remove("tut-highlight");
          }
        } else { // one element
          document.getElementById(this.introData[this.curIndex].highlightID).classList.remove("tut-highlight");
        }
      }
      // set new index
      this.curIndex = index;
      // highlihgt new element(s) if there are some
      if (this.introData[this.curIndex].highlightID != "none") {
        if (this.introData[this.curIndex].highlightID.constructor === Array) {
          for (let index in this.introData[this.curIndex].highlightID) {
            document.getElementById(this.introData[this.curIndex].highlightID[index]).classList.add("tut-highlight");
          }
        } else {
          document.getElementById(this.introData[this.curIndex].highlightID).classList.add("tut-highlight");
        }
      }
      //switch the state of the vuex variables
      this.switchState();
    },
    /**
     * moves to the next index
     */
    next () {
      //reset the vuex variables
      this.resetState();

      this.curIndex = this.curIndex + 1;

      //emit the new highlighted part of the user interface
      this.$emit('switchHighlight', this.introData[this.curIndex].highlightElem);
      setTimeout(() => {
        //old highlighted elements != the new ones -> remove highlihgts and set new ones
        if (this.introData[this.curIndex].highlightID != this.introData[this.curIndex - 1].highlightID) {
          if (this.introData[this.curIndex - 1].highlightID != "none") {
            if (this.introData[this.curIndex - 1].highlightID.constructor === Array) {
              for (let index in this.introData[this.curIndex - 1].highlightID) {
                document.getElementById(this.introData[this.curIndex - 1].highlightID[index]).classList.remove("tut-highlight");
              }
            } else {
              document.getElementById(this.introData[this.curIndex - 1].highlightID).classList.remove("tut-highlight");
            }
          }
          if (this.introData[this.curIndex].highlightID != "none") {
            if (this.introData[this.curIndex].highlightID.constructor === Array) {
              for (let index in this.introData[this.curIndex].highlightID) {
                document.getElementById(this.introData[this.curIndex].highlightID[index]).classList.add("tut-highlight");
              }
            } else {
              document.getElementById(this.introData[this.curIndex].highlightID).classList.add("tut-highlight");
            }
          } 
        }
      }, 1);
      //switch vuex variables
      this.switchState();
    },
    /**
     * moves back one index
     */
    back () {
      //reset the vuex variables
      this.resetState();

      this.curIndex = this.curIndex - 1;

      //emit the new highlighted part of the user interface
      this.$emit('switchHighlight', this.introData[this.curIndex].highlightElem);
      setTimeout(() => {
        //old highlighted elements != the new ones -> remove highlihgts and set new ones
        if (this.introData[this.curIndex].highlightID != this.introData[this.curIndex + 1].highlightID) {
          if (this.introData[this.curIndex + 1].highlightID != "none") {
            if (this.introData[this.curIndex + 1].highlightID.constructor === Array) {
              for (let index in this.introData[this.curIndex + 1].highlightID) {
                document.getElementById(this.introData[this.curIndex + 1].highlightID[index]).classList.remove("tut-highlight");
              }
            } else {
              document.getElementById(this.introData[this.curIndex + 1].highlightID).classList.remove("tut-highlight");
            }
          }
          if (this.introData[this.curIndex].highlightID != "none") {
            if (this.introData[this.curIndex].highlightID.constructor === Array) {
              for (let index in this.introData[this.curIndex].highlightID) {
                document.getElementById(this.introData[this.curIndex].highlightID[index]).classList.add("tut-highlight");
              }
            } else {
              document.getElementById(this.introData[this.curIndex].highlightID).classList.add("tut-highlight");
            }
          } 
        }
      }, 1);
      //switch vuex variables
      this.switchState();
    },
    /**
     * checks if any vue actions are to be performed during the introduction
     */
    switchState() {
      if (this.introData[this.curIndex].stateChange) { // stateChange true -> call vue actions 

        //call all vue actions based on the stateChange of the current index
        for (let [key, value] of Object.entries(this.introData[this.curIndex].stateChange)) {
          if (value.constructor === Array) {
            for (let index of value) {
              this.$store.dispatch(key, index);
            }
          } else {
            this.$store.dispatch(key, value);
          }
        }
      }
    },
    /**
     * resets the selected signs, the grid selection and context menu in the vuex state
     */
    resetState () {
      //currently these three are being used in the introductions, although further vuex actions could be added
      this.$store.dispatch("clearSelectedSigns");
      this.$store.dispatch("clearGridSelect");
      this.$store.dispatch("changeContextMenu", false);
    }
  }
}
</script>

<style scoped>
.modal {
  z-index: 1001;
  transition: transform 0.4s ease;
}

.modal-content {
  position: absolute;
  left: 0;
  top: 0;
  margin: 0;
  max-width: 400px;
  box-shadow: 0 0px 6px 3px rgb(0 0 0 / 15%);
}

.box {
  max-width: 400px;
  
}

.nav-btn {
  color: white;
  background-color: var(--selected);
}

.nav-btn:focus {
  box-shadow: 0 0 0 0.125em rgb(68 111 151 / 25%);
  outline-color: var(--selected-darker)!important;
  border-color: var(--selected)!important;
}

.nav-dot {
  background-color: white;
}

.active {
  background-color: var(--selected);
}

.nav-dot:focus {
  box-shadow: 0 0 0 0.125em rgb(68 111 151 / 25%);
  outline-color: var(--selected-darker)!important;
  border-color: var(--selected)!important;
}
</style>