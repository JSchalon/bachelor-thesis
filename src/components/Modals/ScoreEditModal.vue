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
              <select id="template-select" @change="checkBeatsPerBar">
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
        <button v-if="newScore" class="button nav-btn">Create Score</button>
        <button v-else class="button nav-btn">Update Score Parameters</button>
        <button class="button ml-3" type="reset" @click="disableModal">Cancel</button>
      </form>
    </div>
  </div> 
</template>

<script>
/**
 * The score parameter and new score modal
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
  data() {
    return {
    };
  },
  computed: {

  },
  watch: {
    modalActive (value) {
      if (value) {
        this.loadFormData();
      }
    }
  },
  mounted () {
    document.getElementById("edit-form").addEventListener("submit", this.updateScore);
    this.loadFormData();
  },
  methods: {
    disableModal () {
      this.$emit("disableModal");
    },
    checkBeatsPerBar() {
      const value = document.getElementById('template-select').value != 'Blank Score';
      this.$emit("checkBeatsPerBar", value);
    },
    updateScore (event) {
      event.preventDefault();
      let data = {author: event.srcElement[1].value};
      if (this.newScore) {
        data.beatsPerBar = parseInt(event.srcElement[5].value);
        data.title = event.srcElement[2].value;
        data.template = event.srcElement[3].value;
        data.description = event.srcElement[4].value;
        data.timeUnit = event.srcElement[6].value;
        data.beatDuration = event.srcElement[7].value;
      } else {
        data.title = event.srcElement[2].value;
        data.description = event.srcElement[3].value;
        data.timeUnit = event.srcElement[4].value;
        data.beatDuration = event.srcElement[5].value;
      }
      this.$emit("formSubmit", data);
      
    },
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