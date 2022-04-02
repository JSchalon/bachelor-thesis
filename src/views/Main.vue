<template>
  <div ref="view" class="is-clipped">
    <OptionsMenu :class="{highlighted: tutHighlight == 'optionsMenu'}" @requestNewScore="openNewScoreDialog" @requestUpload="uploadScore" @requestScoreDetails="openScoreDetails" @startIntroduction="openIntroduction"/>
    <SignLibrary :class="{highlighted: tutHighlight == 'signLibrary'}" @selectSignDrag="selectSignDrag"/>
    <div id="interactionBox">
      <InteractionMenu :class="{highlighted: tutHighlight == 'interactionMenu'}"/>
      <Score :class="{highlighted: tutHighlight == 'score'}"/>
    </div>
    <svg v-if="ghostActive" :width="ghostSignData.baseType == 'RelationshipBow' ? this.columnWidth * 2 : signWidth + 3" :height="ghostSignData.beatHeight * minHeight + 3" fill="white" class="ghost-svg" ref="ghost" :style="ghostTransform">
      <g transform="translate(1.5,1.5)">
        <component :is="ghostSignData.baseType" :isSelected="false" :height="ghostSignData.beatHeight * minHeight" :signData="ghostSignData" :class="ghostOverCanvas ? 'over-canvas' : ''"/>
      </g>
    </svg>
    <div class="desc-box" :class="{highlighted: tutHighlight == 'score'}">
      <div class="box" v-if="storeDescActive">
        <h4 class="title is-5">Score Description <button class="delete is-large custom-close" aria-label="close" @click="this.$store.dispatch('changeSettings', {showScoreDescription: !storeDescActive});"><img src="@/assets/images/interaction-menu/x.svg" class="option-img"></button></h4>
        <p>{{$store.state["description"]}}</p>
      </div>
      <button v-else class="button has-background-white is-size-5 has-text-info" @click="this.$store.dispatch('changeSettings', {showScoreDescription: !storeDescActive});">!</button>
    </div>
    <div class="highlight-overlay" :class="{active: tutHighlight != ''}"/>

    <ScoreEditModal :modalActive="modalActive" :newScore="newScore" :beatsPerBarDisabled="beatsPerBarDisabled" @disableModal="modalActive=false;newScore=false;" @checkBeatsPerBar="changeBeatsPerBarDisabled" @formSubmit="updateScore"/>

    <ConfirmationModal :modalActive="confirmationModal" @disableModal="confirmationModal=false;newScore=false;" @confirm="makeNewScore">
    </ConfirmationModal>

    <ConfirmationModal :modalActive="uploadConfirm" @disableModal="uploadConfirm=false;this.curFile=null" @confirm="confirmUploadScore">
      <template v-slot:title>Confirm importing Score</template>
      <template v-slot:text>Importing a score will delete the current score, including any unsaved changes. This action is currently not reversible.</template>
    </ConfirmationModal>
    
    
    <ConfirmationModal :modalActive="$store.state['isPhone']" :cancel="false" @confirm="phoneDone()">
      <template v-slot:title>Small screen detected</template>
      <template v-slot:text>We recommend using a Tablet or PC to use this editor. Using a smaller screen, like a smartphone is possible, but not advised.</template>
    </ConfirmationModal>
    <div class="is-justify-content-center is-flex alert-box-container" v-if="showCloudAlert != ''">
      <div class="box has-background-primary-light has-text-primary-dark" v-if="showCloudAlert == 'import-success'">Successfully imported score from cloud service.</div>
      <div class="box has-background-danger-light has-text-danger-dark" v-if="showCloudAlert == 'import-failure'">Could not import score from cloud service, please try again.</div>
      <div class="box has-background-primary-light has-text-primary-dark" v-if="showCloudAlert == 'export-success'">Successfully exported file to cloud service.</div>
      <div class="box has-background-danger-light has-text-danger-dark" v-if="showCloudAlert == 'export-failure'">Could not export file to cloud service, please try again.</div>
    </div>
    <EditorExplainModal :modalActive="showFirstIntro" @disableModal="firstIntroDone(false)" @startLabanIntro="firstIntroDone(true); openIntroduction('labanBasic')" @startEditorIntro="firstIntroDone(true); openIntroduction('editor')"/>
    <IntroductionModal :modalActive="tutActive" :intro="intro" @disableModal="tutHighlight='';intro='';tutActive=false" @switchHighlight="changeTutHighlight"/>
  </div>
</template>

<script>

/**
 * The main editor view
 * additional views can be added in the same folder, and need to be registered to the router
 * @displayName Main View
 */
export default {
  name: 'Main',
  inject: ["signWidth","barHeight", "outerCanvasMargin", "columnWidth"],
  data() {
    return {
      ghostSignData: {},
      signsLength: 0,
      curFile: null,
      tutActive: false,
      modalActive: false,
      newScore: false,
      beatsPerBarDisabled: false,
      confirmationModal: false,
      newScoreData: null,
      uploadConfirm: false,
      tutHighlight: "",
      showFirstIntro: false,
      intro: 'intro/editor-intro-',
    };
  },
  computed: {
    libSign () {
      if ("signData" in this.$store.state["curSign"]) {
        return this.$store.state["curSign"].signData;
      } else {
        return false;
      }
    },
    ghostTransform() {
      return "transform: translate(" + this.ghostPos.x + "px," + this.ghostPos.y + "px);"; 
    },
    beats () {
      return this.$store.state["beatsPerBar"];
    },
    minHeight () {
      return this.barHeight / this.beats;
    },
    ghostOverCanvas () {
      return this.$store.state["ghostOverCanvas"];
    },
    ghostPos () {
      return this.$store.state["ghostPos"];
    },
    ghostActive () {
      return this.$store.state["ghostActive"];
    },
    signs () {
      return this.$store.state["signs"];
    },
    storeDescActive () {
      return this.$store.state['showScoreDescription'];
    },
    showCloudAlert () {
      return this.$store.state['cloudAlert'];
    }
  },
  mounted () {
    this.signsLength = this.signs.length;
    if (localStorage.getItem("score")) {
      this.$store.dispatch("newScore", "local-storage");
      this.$store.dispatch("clearHistory");
    } else {
      this.$store.dispatch("newScore", "blank-score");
      this.$store.dispatch("clearHistory");
      if (!this.$store.state['isPhone'] && this.$store.state['seenIntro']) {
        this.newScore = true;
        this.modalActive = true;
      } 
    }
    if (!this.$store.state['isPhone'] && !this.$store.state['seenIntro']) {
      this.showFirstIntro = true;
    }
    window.addEventListener('keydown', function (e) {
      if (e.key == "Escape") {
        this.modalActive = false;
        this.newScore = false;
        this.confirmationModal = false;
        this.uploadConfirm = false;
        this.showFirstIntro = false;
        this.tutActive = false;
        this.tutHighlight='';
        this.intro='';
      }
    }.bind(this));
  },
  methods: {
    selectSignDrag (data) {
      if (data.type == "start") {
        this.signsLength = this.signs.length;
        this.$store.dispatch("setGhostActive", true);
        this.ghostSignData = this.libSign;
        this.$store.dispatch("setGhostPos", {x: Math.round(data.pos.x), y: Math.round(data.pos.y)});
        
      } else if (data.type == "move") {
        this.$store.dispatch("setGhostPos", {x: this.ghostPos.x + data.delta.x, y: this.ghostPos.y + data.delta.y});
        if (this.$refs.ghost) {
          const rect = this.$refs.ghost.getBoundingClientRect();
          const canvasRect = document.getElementById("canvas").getBoundingClientRect();
          const xInLibrary = document.getElementById("library").getBoundingClientRect().width >= rect.x;
          const xInCanvas = ((rect.x + rect.width >= canvasRect.x && rect.x <= canvasRect.x + canvasRect.width));
          const yInCanvas = (rect.y + rect.height >= canvasRect.y&& rect.y <= canvasRect.y + canvasRect.height);
          if (xInCanvas && yInCanvas && !this.ghostOverCanvas && !xInLibrary) {
            this.$store.dispatch("setGhostOverCanvas", true);
          } else if ((!xInCanvas || !yInCanvas || xInLibrary) && this.ghostOverCanvas) {
            this.$store.dispatch("setGhostOverCanvas", false);
          }
        }
        //if x && y in canvas -> set libSignOverCanvas = true -> score handles interaction there 
        // if not x && y in canvas -> set libSignOverCanvas = false -> score handles interaction there
      } else {
        this.$store.dispatch("setGhostActive", false);
        this.$store.dispatch("setGhostOverCanvas", false);
        if (this.signsLength != this.signs.length) {
          this.$store.dispatch("saveStateInHistory");
        }
        // if libSignOverCanvas = true -> score keeps the sign
        // else the sign is already deleted
      }
    },
    changeBeatsPerBarDisabled(bool) {
      this.beatsPerBarDisabled = bool;
    },
    openNewScoreDialog () {
      this.modalActive = true;
      this.newScore = true;
      if (document.getElementById("edit-form").elements["beatsPerBar"]) {
        document.getElementById("edit-form").elements["beatsPerBar"].value = this.$store.state["beatsPerBar"];
      }
      this.beatsPerBarDisabled = document.getElementById("template-select").value != "Blank Score";
    },
    uploadScore (file) {
      if (file == "error") {
        return;
      }
      if (this.signs.length > 1) {
        this.curFile = file;
        this.uploadConfirm = true;
      } else {
        this.$store.dispatch("openScore", file);
      }
    },
    confirmUploadScore () {
      this.uploadConfirm = false;
      this.$store.dispatch("openScore", this.curFile)
    },
    openScoreDetails () {
      this.newScore = false;
      this.modalActive = true;
    },
    openIntroduction (which) {
      if (which == "editor") {
        this.tutHighlight = "optionsMenu";
        this.intro = 'intro/editor-intro-';
      } else if (which == "labanBasic") {
        this.tutHighlight = "score";
        this.intro = 'laban/laban-basic-';
      } else {
        console.log(which);
      }
      this.tutActive = true;
    },
    phoneDone () {
      this.$store.dispatch('setIsPhone', false); 
      if (!this.$store.state['seenIntro']) {
        this.showFirstIntro = true;
      }
    },
    firstIntroDone (introActive) {
      this.$store.dispatch('changeSettings', {seenIntro: true}); 
      this.showFirstIntro = false;
      if (!introActive) {
        this.modalActive = true;
        this.newScore = true;
      }
    },
    changeTutHighlight(str) {
      this.tutHighlight = str;
    },
    updateScore (data) {
      if (this.newScore) {
        this.newScoreData = data;
        if (this.signs.length > 1) {
          this.confirmationModal = true;
        } else {
          this.makeNewScore();
        }
      } else {
        this.$store.dispatch("editScoreParameters", data);
      }
      this.modalActive = false;
      this.newScore = false;
    },
    makeNewScore () {
      this.confirmationModal = false;
      if (this.newScoreData.template == "Blank Score") {
        this.$store.dispatch("newScore", "blank-score");
        this.$store.dispatch("clearHistory");
      }
      this.$store.dispatch("editScoreParameters", this.newScoreData);
    }
  }
}
</script>

<style>
  #interactionBox {
    width: calc(100% - 260px);
    float: right;
  }

  .ghost-svg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1001;
  }
  .over-canvas .draggable {
    stroke: #5e9fc7!important;
  }

  .option-item, .option-divider {
  float: left;
  height: calc(100% - 6px);
  margin-top: 3px;
  display: flex;
  align-items: center;
  position: relative;
  border-radius: 5px;
}

.option-item.inactive .option-img {
  opacity: 0.5;
}

.option-item.inactive p {
  opacity: 0.5;
}

.option-item.inactive {
  cursor:not-allowed;
}

.option-item {
  cursor: pointer;
}

.option-item * {
  display: block;
  color: #343434;
  text-decoration: none;
  padding: 0 0.5em;
}

.option-item:hover {
  background-color: #e5e5e5;
}

.option-item:focus {
  background-color: #e5e5e5;
}

.option-item:active {
  background-color: #e5e5e5;
}

.option-item.enabled {
  background-color: #e5e5e5;
}
.option-item.enabled p {
  color: #446f97;
}

.option-divider p {
  display: block;
  width: 2px;
  height: 75%;
  background-color: #d6d6d6;
  margin: 0 0.5em;
}

.option-img {
  height: 70%;
}

.option-img.dropdown {
  height: 35%;
  transform: rotate(90deg);
}

.option-nested {
  float: left;
  height: 100%;
  position: relative;
  padding: 0;
  display: block;
}

.option-dropdown-top {
  display: inline-block;
  height: calc(100% - 6px);
  margin: 3px 0;
  display: flex;
  align-items: center;
  border-radius: 5px;
}
.option-dropdown-top * {
  padding: 0 0.5em;
}

.option-nested:hover .option-dropdown-top {
  background-color: #e5e5e5;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.option-nested:focus .option-dropdown-top {
  background-color: #e5e5e5;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.option-nested:active .option-dropdown-top {
  background-color: #e5e5e5;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.option-nested:hover .option-box {
  display: block;
}

.option-nested:focus .option-box {
  display: block;
}

.option-nested:active .option-box {
  display: block;
}


.option-box {
  float: initial;
  display: none;
  position: absolute;
  z-index: 2;
  padding: 0;
  min-width: 240px;
  background-color: white;
  transform: translateY(-5px);
  box-shadow: 0 1px 3px 1px rgb(0 0 0 / 15%);
  border-radius: 5px;
  border-top-left-radius: 0;
}

.option-box li:first-child {
  border-top-right-radius: 5px;
}

.option-box li:last-child {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

.option-box li {
  width: 100%;
  display: block;
  margin: 0;
  border-radius: 0;
}
.option-box p {
  padding: 0 0.5em;
  margin: 0.5em 0;
}

.option-box li:hover {
  background-color: #e9e9e9;
}

.shortcut {
  font-size: 0.9em;
  color: #808080;
  margin-left: auto!important;
  order: 2;
  transform: none;
}

.custom-close {
  position: absolute;
  right: 0;
  margin-right: 20px;
  background: 0;
  border-radius: 5px;
}
.custom-close::before,.custom-close::after {
  background: #ff4b4b;
}

.custom-close:hover .custom-close::before {
  background: #ca3737;
}

.custom-close:hover .custom-close::after {
  background: #ca3737;
}

.custom-close:hover {
  background: #e5e5e5;
}

.title {
  display: flex;
  align-items: center;
}

.desc-box {
  position: absolute;
  bottom: 2em;
  right: 2em;
  z-index: 10;
}
.desc-box p {
  max-height: 250px;
  overflow-y: auto;
  min-width: 200px;
  max-width: 300px;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.desc-box .button {
  box-shadow: 0 1px 3px 1px rgb(0 0 0 / 15%);
}

html {
  overflow: hidden;
}

.highlighted {
  z-index: 1001!important;
  position: relative;
}
.desc-box.highlighted {
  position: absolute;
}

.highlight-overlay {
  z-index: 999;
  width: 100%;
  height: 100%;
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, .4);
}

.highlight-overlay.active {
  display: block;
}

.alert-box-container {
  position: absolute;
  top: 1em;
  left: 0;
  z-index: 11;
  width: 100%;
}

.nav-dot {
  border-radius: 100%;
  width: 20px;
  height: 20px;
  padding: 0;
}

.tut-highlight {
  border: 3px solid #5e9fc7!important;
}

</style>