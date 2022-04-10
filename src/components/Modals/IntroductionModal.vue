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
    modalActive (value) {
      this.resetState();
      if (value) {
        if (this.introData[this.curIndex].highlightID != "none") {
          document.getElementById(this.introData[this.curIndex].highlightID).classList.add("tut-highlight");
        }
        this.switchState();
      } else {
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
    intro () {
      if (this.modalActive) {
        this.curIndex = 0;
        let lang = this.$store.state["language"];
        let json = require('@/assets/editor-help/' + this.intro + lang + '.json');
        let obj = JSON.parse(JSON.stringify(json));
        let data =[];
        for (const elem of Object.entries(obj.introData)) {
          data.push(elem[1]);
        }
        this.breakPoints = obj.breakPoints;
        this.introData = data;
      } 
    }
  },
  computed: {
    getPosition () {
      if (!("position" in this.introData[this.curIndex])) {
        return "";
      } else {
        const pos = this.introData[this.curIndex].position;
        let elemRect = document.getElementById(pos.elem).getBoundingClientRect();
        return "transform: translate(" + elemRect[pos.hSide] + "px, " + elemRect[pos.vSide] + "px);";
      }
    },
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
    switchIndex (index) {
      this.resetState();
      if (this.introData[this.curIndex].highlightID != "none") {
        if (this.introData[this.curIndex].highlightID.constructor === Array) {
          for (let index in this.introData[this.curIndex].highlightID) {
            document.getElementById(this.introData[this.curIndex].highlightID[index]).classList.remove("tut-highlight");
          }
        } else {
          document.getElementById(this.introData[this.curIndex].highlightID).classList.remove("tut-highlight");
        }
      }
      this.curIndex = index;
      if (this.introData[this.curIndex].highlightID != "none") {
        if (this.introData[this.curIndex].highlightID.constructor === Array) {
          for (let index in this.introData[this.curIndex].highlightID) {
            document.getElementById(this.introData[this.curIndex].highlightID[index]).classList.add("tut-highlight");
          }
        } else {
          document.getElementById(this.introData[this.curIndex].highlightID).classList.add("tut-highlight");
        }
      }
      this.switchState();
    },
    next () {
      this.resetState();
      this.curIndex = this.curIndex + 1;
      this.$emit('switchHighlight', this.introData[this.curIndex].highlightElem);
      setTimeout(() => {
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
      this.switchState();
    },
    back () {
      this.resetState();
      this.curIndex = this.curIndex - 1;
      this.$emit('switchHighlight', this.introData[this.curIndex].highlightElem);
      setTimeout(() => {
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
      this.switchState();
    },
    switchState() {
      if (this.introData[this.curIndex].stateChange) {
       
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
    resetState () {
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