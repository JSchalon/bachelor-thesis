<template>
  <div ref="view" class="is-clipped">
    <OptionsMenu @requestNewScore="openNewScoreDialog" @requestUpload="openConfirmationPopUp" @requestScoreDetails="openScoreDetails" @startIntroduction="openIntroduction"/>
    <SignLibrary @selectSignDrag="selectSignDrag"/>
    <div id="interactionBox">
      <InteractionMenu/>
      <Score/>
    </div>
    <svg v-if="ghostActive" :width="ghostSignData.baseType == 'RelationshipBow' ? this.columnWidth * 2 : signWidth + 3" :height="ghostSignData.beatHeight * minHeight + 3" fill="white" class="ghost-svg" ref="ghost" :style="ghostTransform">
      <g transform="translate(1.5,1.5)">
        <component :is="ghostSignData.baseType" :isSelected="true" :height="ghostSignData.beatHeight * minHeight" :signData="ghostSignData" :class="ghostOverCanvas ? 'over-canvas' : ''"/>
      </g>
    </svg>
    <div class="modal" :class="modalActive ? 'is-active' : ''">
      <div class="modal-background"></div>
      <div class="modal-content">
        
        <form class="box" id="edit-form">
          
          <h1 v-if="newScore" class="title">New Score <button class="delete is-large custom-close" aria-label="close" @click="modalActive=false; newScore=false"><img src="@/assets/images/interaction-menu/x.svg" class="option-img"></button></h1>
          <h1 v-else class="title">Edit Score Parameters<button class="delete is-large custom-close" aria-label="close" @click="modalActive = false"><img src="@/assets/images/interaction-menu/x.svg" class="option-img"></button></h1>
          <div class="field">
            <label class="label">Author</label>
            <div class="control">
              <input class="input" type="text" placeholder="Author" name="author" required>
            </div>
          </div>
          <div class="field">
            <label class="label">Title</label>
            <div class="control">
              <input class="input" type="text" placeholder="Title" name="title" required>
            </div>
          </div>
          <div class="field">
            <label class="label">Template</label>
            <div class="control">
              <div class="select">
                <select id="template-select" @change="beatsPerBarDisabled = document.getElementById('').value != 'Blank Score'">
                  <option>Blank Score</option>
                </select>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Score Description</label>
            <div class="control">
              <textarea class="textarea" placeholder="Description" name="description" required></textarea>
            </div>
          </div>
          <div class="field" v-if="newScore">
            <!-- don't display if not blank score-->
            <label class="label">Beats per Measure</label>
            <p class="help is-info">Currently cannot be changed after score creation</p>
            <div class="control">
              <input class="input" type="number" min="1" max="8" placeholder="1 - 8" value="4" name="beatsPerBar" :disabled="beatsPerBarDisabled">
            </div>
          </div>
          <div class="field">
            <label class="label">Time Unit</label>
            <p class="help">The Time Unit of the Beat Duration</p>
            <div class="control">
              <div class="select">
                <select name="timeUnit">
                  <option>Millisecond</option>
                  <option selected="selected">Second</option>
                  <option>Minute</option>
                </select>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Beat Duration</label>
            <div class="control">
              <input class="input" type="number" placeholder="1-1000" min="1" max="1000" value="1" name="beatDuration" required>
            </div>
          </div>
          <button v-if="newScore" class="button is-success">Create Score</button>
          <button v-else class="button is-success">Update Score Parameters</button>
          <button class="button ml-3" type="reset" @click="modalActive=false; newScore=false">Cancel</button>
        </form>
      </div>
    </div> 
    <div class="modal" :class="confirmationModal ? 'is-active' : ''">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="box">
          <h1 class="title">Confirm Creation of new Score<button class="delete is-large custom-close" aria-label="close" @click="confirmationModal=false; newScore=false"><img src="@/assets/images/interaction-menu/x.svg" class="option-img"></button></h1>
          <p class="mb-4">Creating a new score will delete the contents of the existing score. This action is currently not reversible.</p>
          <button class="button is-success" @click="makeNewScore">Understood</button>
          <button class="button ml-3" type="reset" @click="confirmationModal=false; newScore=false">Cancel</button>
        </div>
      </div>
    </div>
    <div class="desc-box">
      <div class="box" v-if="storeDescActive">
        <h4 class="title is-5">Score Description <button class="delete is-large custom-close" aria-label="close" @click="this.$store.dispatch('changeSettings', {showScoreDescription: !storeDescActive});"><img src="@/assets/images/interaction-menu/x.svg" class="option-img"></button></h4>
        <p>{{$store.state["description"]}}</p>
      </div>
      <button v-else class="button has-background-white is-size-5 has-text-info" @click="this.$store.dispatch('changeSettings', {showScoreDescription: !storeDescActive});">?</button>
    </div>
    
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
    }
  },
  mounted () {
    this.signsLength = this.signs.length;
    if (localStorage.getItem("score")) {
      this.$store.dispatch("newScore", "local-storage");
      this.$store.dispatch("clearHistory");
      this.loadFormData();
    } else {
      this.$store.dispatch("newScore", "blank-score");
      this.$store.dispatch("clearHistory");
      this.newScore = true;
      this.modalActive = true;
      
    }
    document.getElementById("edit-form").addEventListener("submit", this.updateScore);
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
          const xInCanvas = ((rect.x + rect.width >= canvasRect.x && rect.x <= canvasRect.x + canvasRect.width));
          const yInCanvas = (rect.y + rect.height >= canvasRect.y&& rect.y <= canvasRect.y + canvasRect.height);
          if (xInCanvas && yInCanvas && !this.ghostOverCanvas) {
            this.$store.dispatch("setGhostOverCanvas", true);
          } else if ((!xInCanvas || !yInCanvas) && this.ghostOverCanvas) {
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
    loadFormData () {
      this.newScore = true;
      let form = document.getElementById("edit-form");
      form.elements["author"].value = this.$store.state["author"];
      form.elements["title"].value = this.$store.state["title"];
      form.elements["description"].value = this.$store.state["description"];
      if (form.elements["beatsPerBar"]) {
        form.elements["beatsPerBar"].value = this.$store.state["beatsPerBar"];
      }
      form.elements["timeUnit"].value =  this.$store.state["timeUnit"].charAt(0).toUpperCase() + this.$store.state["timeUnit"].slice(1);
      form.elements["beatDuration"].value = parseInt(this.$store.state["beatDuration"]);
    },
    openNewScoreDialog () {
      this.loadFormData();
      this.modalActive = true;
      this.newScore = true;
      if (document.getElementById("edit-form").elements["beatsPerBar"]) {
        document.getElementById("edit-form").elements["beatsPerBar"].value = this.$store.state["beatsPerBar"];
      }
      this.beatsPerBarDisabled = document.getElementById("template-select").value != "Blank Score";
    },
    openConfirmationPopUp (file) {
      //TODO
      this.curFile = file;
      this.$store.dispatch("openScore", file)
    },
    openScoreDetails () {
      this.newScore = false;
      this.modalActive = true;
    },
    openIntroduction (which) {
      console.log("open intro " + which);
    },
    updateScore (event) {
      event.preventDefault();
      let index = 0;
      let data = {author: event.srcElement[1].value};
      if (this.newScore) {
        index = 1;
        data.beatsPerBar = parseFloat(event.srcElement[5].value);
      }
      
      data.title = event.srcElement[2].value;
      data.template = event.srcElement[3].value;
      data.description = event.srcElement[4].value;
      data.timeUnit = event.srcElement[5+index].value;
      data.beatDuration = event.srcElement[6+index].value;
      console.log(data.description)
      if (this.newScore) {
        if (this.signs.length > 1) {
          this.confirmationModal = true;
          this.newScoreData = data;
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
    stroke: #f1c232!important;
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
</style>