<template>
  <div class="modal" :class="modalActive ? 'is-active' : ''">
    <div class="modal-background"></div>
    <div class="modal-content">
      <form class="box" id="edit-form">
        
        <h1 v-if="newScore" class="title is-4">New Score <button class="delete is-large custom-close" aria-label="close" @click="disableModal"><img src="@/assets/images/interaction-menu/x.svg" class="option-img"></button></h1>
        <h1 v-else class="title is-4">Edit Score Parameters<button class="delete is-large custom-close" aria-label="close" @click="disableModal"><img src="@/assets/images/interaction-menu/x.svg" class="option-img"></button></h1>
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
        <div class="field" v-if="newScore">
          <label class="label">Template</label>
          <div class="control">
            <div class="select">
              <select id="template-select" @change="updateScoreParam">
                <option template="blank-score">Blank Score</option>
                <option template="walking-turning">Walking and Turning</option>
                <option template="device-shake">Device Shake</option>
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
          <p class="help is-info">Currently cannot be changed after score creation or with custom templates.</p>
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
        <button v-if="newScore" class="button nav-btn">Create Score</button>
        <button v-else class="button nav-btn">Update Score Parameters</button>
        <button class="button ml-3" type="reset" @click="disableModal">Cancel</button>
      </form>
    </div>
  </div> 
</template>

<script>
/**
 * The modal used to create scores and edit their parameters
 * @emits disableModal closes the modal and resumes the editor
 * @emits checkBeatsPerBar change if the beats per bar option is enabled (only if making a new score with the blank template)
 * @emits formSubmit submits the form
 * @displayName Score Edit Modal
 */
export default {
  name: 'ScoreEditModal',
  emits: ["disableModal", "checkBeatsPerBar","formSubmit"],
  props: {
    modalActive: Boolean,
    newScore: Boolean,
    beatsPerBarDisabled: Boolean
  },
  watch: {
    /**
     * observes the active state of the modal
     * @param value the new observed value
     */
    modalActive (value) {
      if (value) { // modal active -> load data from vuex
        this.loadFormData();
      }
    }
  },
  mounted () {
    // add eventlistener for submitting
    document.getElementById("edit-form").addEventListener("submit", this.updateScore);
    // load the form data from vuex
    this.loadFormData();
  },
  methods: {
    /**
     * closes the modal
     */
    disableModal () {
      this.$emit("disableModal");
    },
    /**
     * only allow the beats per bar option when making a new score with the blank score template
     */
    updateScoreParam () {
      const value = document.getElementById('template-select').value != 'Blank Score';
      this.$emit("checkBeatsPerBar", value);
      let data = undefined;
      for (let elem of document.getElementById('template-select').childNodes) {
        if (elem.value == document.getElementById('template-select').value) {
          data = require("@/assets/score-templates/" + elem.getAttribute("template") + ".xml");
        }
      }
      
      const parser = new DOMParser();
      let xml = parser.parseFromString(data.default,"text/xml");
      document.getElementById("edit-form").querySelector("input[name='author']").value = xml.getElementsByTagName("laban:author")[0].innerHTML;
      document.getElementById("edit-form").querySelector("input[name='title']").value = xml.getElementsByTagName("laban:title")[0].innerHTML;
      document.getElementById("edit-form").querySelector("textarea[name='description']").value = xml.getElementsByTagName("laban:description")[0].innerHTML;
      document.getElementById("edit-form").querySelector("input[name='beatsPerBar']").value = xml.getElementsByTagName("laban:beats")[0].innerHTML;
    },
    /**
     * requests updating the score
     * @param event the submit event
     */
    updateScore (event) {
      event.preventDefault();
      let data = {author: event.srcElement[1].value};
      if (this.newScore) { // making a new score -> different elements in the form
        data.beatsPerBar = parseInt(event.srcElement[5].value);
        data.title = event.srcElement[2].value;
        data.template = event.srcElement[3].value;
        data.description = event.srcElement[4].value;
        data.timeUnit = event.srcElement[6].value;
        data.beatDuration = event.srcElement[7].value;
      } else { // editing the score
        data.title = event.srcElement[2].value;
        data.description = event.srcElement[3].value;
        data.timeUnit = event.srcElement[4].value;
        data.beatDuration = event.srcElement[5].value;
      }
      this.$emit("formSubmit", data);
      
    },
    /**
     * loads the current values of the form inpus from the vuex state
     */
    loadFormData () {
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
  }
}
</script>

<style scoped>
.nav-btn {
  color: white;
  background-color: var(--selected);
}

.nav-btn:focus {
  box-shadow: 0 0 0 0.125em rgb(68 111 151 / 25%);
  outline-color: var(--selected-darker)!important;
  border-color: var(--selected)!important;
}
</style>