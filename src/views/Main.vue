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
    
    <div class="highlight-overlay" :class="{active: tutHighlight != ''}"/>

    <!-- Cloud export/import alerts -->
    <div class="is-justify-content-center is-flex alert-box-container" v-if="showCloudAlert != ''">
      <div class="box has-background-primary-light has-text-primary-dark" v-if="showCloudAlert == 'import-success'">Successfully imported score from cloud service.</div>
      <div class="box has-background-danger-light has-text-danger-dark" v-if="showCloudAlert == 'import-failure'">Could not import score from cloud service, please try again.</div>
      <div class="box has-background-primary-light has-text-primary-dark" v-if="showCloudAlert == 'export-success'">Successfully exported file to cloud service.</div>
      <div class="box has-background-danger-light has-text-danger-dark" v-if="showCloudAlert == 'export-failure'">Could not export file to cloud service, please try again.</div>
    </div>

    <ScoreEditModal :modalActive="modalActive" :newScore="newScore" :beatsPerBarDisabled="beatsPerBarDisabled" @disableModal="modalActive=false;newScore=false;" @checkBeatsPerBar="changeBeatsPerBarDisabled" @formSubmit="updateScore"/>

    <ConfirmationModal :modalActive="newScoreConfirm" @disableModal="newScoreConfirm=false;newScore=false;" @confirm="makeNewScore">
    </ConfirmationModal>

    <ConfirmationModal :modalActive="uploadConfirm" @disableModal="uploadConfirm=false;this.curFile=null" @confirm="confirmUploadScore">
      <template v-slot:title>Confirm importing Score</template>
      <template v-slot:text>Importing a score will delete the current score, including any unsaved changes. This action is currently not reversible.</template>
    </ConfirmationModal>
    
    <ConfirmationModal :modalActive="$store.state['isPhone']" :cancel="false" @confirm="phoneDone()">
      <template v-slot:title>Small screen detected</template>
      <template v-slot:text>We recommend using a Tablet or PC to use this editor. Using a smaller screen like a smartphone is possible, but not advised.</template>
    </ConfirmationModal>

    <ConfirmationModal :modalActive="introDoneNext && firstIntroChoice == 'laban'" @disableModal="introDoneNext=false;firstIntroChoice=false" @confirm="introDoneNext=false;firstIntroChoice=false; openIntroduction('intro/editor-intro')">
      <template v-slot:title>Editor Introduction available</template>
      <template v-slot:text>There is also an introduction to the editor and how to operate it available. Would you like to visit it? Alternatively, both introductions, as well as further Labanotation sign introductions, are also available in the "Help" menu.</template>
      <template v-slot:confirm>Visit introduction</template>
      <template v-slot:deny>No thanks</template>
    </ConfirmationModal>
    
    <ConfirmationModal :modalActive="introDoneNext && firstIntroChoice == 'editor'" @disableModal="introDoneNext=false;firstIntroChoice=false" @confirm="introDoneNext=false;firstIntroChoice=false; openIntroduction('laban/laban-basic')">
      <template v-slot:title>Labanotation Introduction available</template>
      <template v-slot:text>There is also an introduction to Labanotation available. Would you like to visit it? Alternatively, both introductions, as well as further Labanotation sign introductions, are also available in the "Help" menu.</template>
      <template v-slot:confirm>Visit introduction</template>
      <template v-slot:deny>No thanks</template>
    </ConfirmationModal>

    <EditorExplainModal 
      :modalActive="showFirstIntro" 
      @disableModal="firstIntroDone(false)" 
      @startLabanIntro="firstIntroDone(true); firstIntroChoice='laban'; openIntroduction('laban/laban-basic')" 
      @startEditorIntro="firstIntroDone(true); firstIntroChoice='editor'; openIntroduction('intro/editor-intro')"
    />
    <IntroductionModal :modalActive="tutActive" :intro="intro" @disableModal="endIntroduction()" @switchHighlight="changeTutHighlight"/>
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
  inject: ["signWidth","barHeight", "columnWidth"],
  data() {
    return {
      ghostSignData: {},
      signsLength: 0,
      curFile: null,
      tutActive: false,
      modalActive: false,
      newScore: false,
      beatsPerBarDisabled: false,
      newScoreConfirm: false,
      newScoreData: null,
      uploadConfirm: false,
      tutHighlight: "",
      showFirstIntro: false,
      intro: 'intro/editor-intro-',
      savedScore: false,
      firstIntroChoice: false,
      introDoneNext: false,
    };
  },
  computed: {
    /**
     * @returns the current selected library sign
     */
    libSign () {
      if ("signData" in this.$store.state["curSign"]) {
        return this.$store.state["curSign"].signData;
      } else {
        return false;
      }
    },
    /**
     * @returns the transform of the library sign dragging ghost
     */
    ghostTransform() {
      return "transform: translate(" + this.ghostPos.x + "px," + this.ghostPos.y + "px);"; 
    },
    /**
     * @returns the beat height
     */
    minHeight () {
      return this.barHeight() / this.beats;
    },
    // the vuex store variables getter
    beats () {
      return this.$store.state["beatsPerBar"];
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
    showCloudAlert () {
      return this.$store.state['cloudAlert'];
    }
  },
  mounted () {
    // get the signs length
    this.signsLength = this.signs.length;
    // if there is a saved score in the local storage, load it
    if (localStorage.getItem("score")) {
      this.$store.dispatch("newScore", "local-storage");
      this.$store.dispatch("clearHistory");
    } else { // else create a blank score
      this.$store.dispatch("newScore", "blank-score");
      this.$store.dispatch("clearHistory");
      // if the user has seen the editor intro -> open the score creation modal
      if (!this.$store.state['isPhone'] && this.$store.state['seenIntro']) {
        this.newScore = true;
        this.modalActive = true;
      } 
    }
    // if the user has not seen the intro, open it
    if (!this.$store.state['isPhone'] && !this.$store.state['seenIntro']) {
      this.showFirstIntro = true;
    }

    // set the key listener
    window.addEventListener('keydown', this.keyListener);
  },
  methods: {
    /**
     * the drag event handler for dragging the libray sign
     */
    selectSignDrag (data) {
      if (data.type == "start") { 
        // start event -> set the ghost (the element being dragged) as active
        this.signsLength = this.signs.length;
        this.$store.dispatch("setGhostActive", true);
        // set the ghost pos
        this.ghostSignData = this.libSign;
        this.$store.dispatch("setGhostPos", {x: Math.round(data.pos.x), y: Math.round(data.pos.y)});
      } else if (data.type == "move") {
        // move event -> change the ghost move on an update
        this.$store.dispatch("setGhostPos", {x: this.ghostPos.x + data.delta.x, y: this.ghostPos.y + data.delta.y});
        if (this.$refs.ghost) { 
          const rect = this.$refs.ghost.getBoundingClientRect();
          const canvasRect = document.getElementById("canvas").getBoundingClientRect();
          const xInLibrary = document.getElementById("library").getBoundingClientRect().width >= rect.x;
          const xInCanvas = ((rect.x + rect.width >= canvasRect.x && rect.x <= canvasRect.x + canvasRect.width));
          const yInCanvas = (rect.y + rect.height >= canvasRect.y&& rect.y <= canvasRect.y + canvasRect.height);
          // check if the ghost sign is over the canvas
          if (xInCanvas && yInCanvas && !this.ghostOverCanvas && !xInLibrary) { // ghost over canvas -> change outline blue, make sign on canvas
            this.$store.dispatch("setGhostOverCanvas", true);
          } else if ((!xInCanvas || !yInCanvas || xInLibrary) && this.ghostOverCanvas) { // ghost not over canvas -> reset outline, delte sign on canvas
            this.$store.dispatch("setGhostOverCanvas", false);
          }
        }
        //if x && y in canvas -> set libSignOverCanvas = true -> score handles interaction there 
        // if not x && y in canvas -> set libSignOverCanvas = false -> score handles interaction there
      } else { // drag en
        // disable ghost
        this.$store.dispatch("setGhostActive", false);
        this.$store.dispatch("setGhostOverCanvas", false);
        if (this.signsLength != this.signs.length) { // if the sign has been added -> save the history and set new sign as selected
          this.$store.dispatch("saveStateInHistory");
          this.$store.dispatch("clearSelectedSigns");
          this.$store.dispatch("addToSelectedSigns", this.signs.length - 1);
        }
        // if libSignOverCanvas = true -> score keeps the sign
        // else the sign is already deleted
      }
    },
    /**
     * toggles the beats per bar option in the score creation menu
     * @param bool the new value
     */
    changeBeatsPerBarDisabled(bool) {
      this.beatsPerBarDisabled = bool;
    },
    /**
     * opens the new score dialog
     */
    openNewScoreDialog () {
      this.modalActive = true;
      this.newScore = true;
      if (document.getElementById("edit-form").elements["beatsPerBar"]) {
        document.getElementById("edit-form").elements["beatsPerBar"].value = this.$store.state["beatsPerBar"];
      }
      // if the new score is not the blank score -> enable beats per bar option
      setTimeout(function () {
        this.beatsPerBarDisabled = document.getElementById("template-select").value != "Blank Score";
      }.bind(this), 10);
      
    },
    /**
     * upload an imported score from a file
     * @param file the xml string
     */
    uploadScore (file) {
      if (file == "error") { // error importing -> do nothing
        return;
      }
      if (this.signs.length > 1) { // if there is a sign on the current score -> display confirm modal before importing
        this.curFile = file;
        this.uploadConfirm = true;
      } else { // upload score
        this.$store.dispatch("openScore", file);
      }
    },
    /**
     * imports a new score
     */
    confirmUploadScore () {
      this.uploadConfirm = false;
      this.$store.dispatch("openScore", this.curFile);
      // after adding score, put on cloud import success alert
      this.$store.dispatch("setCloudAlert", "import-success");
      setTimeout(function () {
        this.$store.dispatch("setCloudAlert", "");
      }.bind(this), 5000);
    },
    /**
     * opens the score details edit modal
     */
    openScoreDetails () {
      this.newScore = false;
      this.modalActive = true;
    },
    /**
     * opens an introduction
     * @param which the path of the introduction as a string
     */
    openIntroduction (which) {
      if (which == "intro/editor-intro") {
        this.tutHighlight = "optionsMenu";
        this.savedScore = this.$store.state["signsXML"];
        this.$store.dispatch("newScore", "intro-score");
      } else if (which == "laban/laban-basic") {
        this.tutHighlight = "score";
        this.savedScore = this.$store.state["signsXML"];
        this.$store.dispatch("newScore", "intro-score");
      } else {
        this.tutHighlight = "signLibrary";
      }
      this.intro = which + "-";
      this.tutActive = true;
    },
    /**
     * closes the introduction
     */
    endIntroduction () {
      this.tutHighlight='';
      this.intro='';
      this.tutActive=false;
      if (this.savedScore) {
        const serial = new XMLSerializer()
        this.$store.dispatch("newScore", {file: serial.serializeToString(this.savedScore)});
        this.savedScore = false;
      }
      if (!this.introDoneNext && this.firstIntroChoice) {
        this.introDoneNext = true;
      }
    },
    /**
     * after closing the phone warning modal, set "isPhone" as false
     */
    phoneDone () {
      this.$store.dispatch('setIsPhone', false); 
      if (!this.$store.state['seenIntro']) {
        this.showFirstIntro = true;
      }
    },
    /**
     * adter the first intro, set seen intro as true
     */
    firstIntroDone (introActive) {
      this.$store.dispatch('changeSettings', {seenIntro: true}); 
      this.showFirstIntro = false;
      if (!introActive) {
        this.modalActive = true;
        this.newScore = true;
      }
    },
    /**
     * changes the highlighted element by an introduction
     * @param str the name of the elem
     */
    changeTutHighlight(str) {
      this.tutHighlight = str;
    },
    /**
     * updates the score parameters
     * @param data the new data
     */
    updateScore (data) {
      if (this.newScore) {
        this.newScoreData = data;
        if (this.signs.length > 1) {
          this.newScoreConfirm = true;
        } else {
          this.makeNewScore();
        }
      } else {
        this.$store.dispatch("editScoreParameters", data);
      }
      this.modalActive = false;
      this.newScore = false;
    },
    /**
     * creates a new score from a template
     */
    makeNewScore () {
      this.newScoreConfirm = false;
      if (this.newScoreData.template == "Blank Score") {
        this.$store.dispatch("newScore", "blank-score");
      }
      if (this.newScoreData.template == "Walking and Turning") {
        this.$store.dispatch("newScore", "walking-turning");
      }
      if (this.newScoreData.template == "Device Shake") {
        this.$store.dispatch("newScore", "device-shake");
      }
      this.$store.dispatch("clearHistory");
      this.$store.dispatch("editScoreParameters", this.newScoreData);
    },
    /**
     * the key event listener
     * @param event the keydown event
     */
    keyListener (event) {
      // cant do key commands while interacting
      if (this.$store.state["interacting"] || this.$store.state["ghostActive"]) {
        return false;
      }
      // ecape closes modals
      if (event.key == "Escape") {
        this.modalActive = false;
        this.newScore = false;
        this.newScoreConfirm = false;
        this.uploadConfirm = false;
        this.showFirstIntro = false;
        this.tutActive = false;
        this.tutHighlight='';
        this.intro='';
        // if a score was open before the modal -> load it
        if (this.savedScore) {
          const serial = new XMLSerializer()
          this.$store.dispatch("newScore", {file: serial.serializeToString(this.savedScore)});
          this.savedScore = false;
        }
      }
      // when pressing ctrl + s or p -> save the xml or svg locally
      if ((event.key == "s" || event.key == "p") && (event.ctrlKey || event.metaKey )) {
        event.preventDefault();

        // serialize the file
        const serializer = new XMLSerializer();
        const xml = serializer.serializeToString(this.$store.state["signsXML"]);
        
        let filename = this.$store.state["title"];
        let bb = new Blob([xml], {type: 'application/xml'});
        if (!filename.includes(".xml")) {
          filename = filename + ".xml";
        }
        if (event.key == "p") { //ctrl + p -> save svg instead of xml
          filename = this.$store.state["title"] + ".svg";
          const svg = serializer.serializeToString(document.getElementById("canvas"));
          bb = new Blob([svg], {type: 'application/xml'});
        }
        // create a download link and click it
        const pom = document.createElement('a');
        pom.setAttribute('href', window.URL.createObjectURL(bb));
        pom.setAttribute('download', filename);
        pom.dataset.downloadurl = ['application/xml', pom.download, pom.href].join(':');
        pom.draggable = true; 
        pom.classList.add('dragout');
        document.body.appendChild(pom);
        pom.click();
        document.body.removeChild(pom);
        return;
      }
      //undo command listener
      if (event.key == "z" && (event.ctrlKey || event.metaKey)) {
        this.$store.dispatch("undoChanges");
        return;
      }
      //redo event listener
      if (event.key == "y" && (event.ctrlKey || event.metaKey)) {
        this.$store.dispatch("redoChanges");
        return;
      }
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
    stroke: var(--selected)!important;
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
  color: var(--text-options);
  text-decoration: none;
  padding: 0 0.5em;
}

.option-item:hover {
  background-color: var(--bg-light);
}

.option-item:focus {
  background-color: var(--bg-light);
}

.option-item:active {
  background-color: var(--bg-light);
}

.option-item.enabled {
  background-color: var(--bg-light);
}
.option-item.enabled p {
  color: var(--selected-darker);
}

.option-divider p {
  display: block;
  width: 2px;
  height: 75%;
  background-color: var(--bg-light-less);
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
  background-color: var(--bg-light);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.option-nested:focus .option-dropdown-top {
  background-color: var(--bg-light);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.option-nested:active .option-dropdown-top {
  background-color: var(--bg-light);
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
  background-color: var(--bg-lighter);
}

.shortcut {
  font-size: 0.9em;
  color: var(--text-shortcut);
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
  background: var(--delete);
}

.custom-close:hover .custom-close::before {
  background: var(--delete);
}

.custom-close:hover .custom-close::after {
  background: var(--delete);
}

.custom-close:hover {
  background: var(--bg-light);
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
.desc-box h2 {
  min-width: 200px;
  max-width: 300px;
  padding-right: 30px;
}

.desc-btn:focus {
  box-shadow: 0 0 0 0.125em rgb(68 111 151 / 25%);
  outline-color: var(--selected-darker)!important;
  border-color: var(--selected)!important;
}

.desc-btn:hover {
  border-color: var(--selected)!important;
}

.desc-box .button {
  box-shadow: 0 1px 3px 1px rgb(0 0 0 / 15%);
}

html {
  overflow: hidden;
}

.highlighted {
  z-index: 1001!important;
  position: fixed;
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
  pointer-events: none;
}

.nav-dot {
  border-radius: 100%;
  width: 20px;
  height: 20px;
  padding: 0;
}

.tut-highlight {
  border: 3px solid var(--selected)!important;
  position: relative;
}

div.select:after {
  border-color: var(--selected)!important;
}

.help.is-info {
  color: var(--delete)!important;
}

.button.is-success {
  background-color: var(--add)!important;
}

</style>