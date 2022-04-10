<template>
  <div class="modal" :class="modalActive ? 'is-active' : ''">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="box">
        <div class="is-flex is-align-items-center">
          <h1 class="title is-flex is-align-items-center">{{introData[curIndex]["title"]}}</h1>
          <button class="delete is-large custom-close mb-3" aria-label="close" @click="$emit('disableModal')"><img src="@/assets/images/interaction-menu/x.svg" class="option-img"></button>
        </div>
        <p class="mb-4" v-html="introData[curIndex]['text']"></p>
      <div class="columns is-multiline mb-0">
        <div class="column is-flex is-justify-content-center is-full p-0">
          <button v-if="curIndex == 1" class="button nav-btn  mb-2 has-text-white" @click="$emit('startLabanIntro')">Labanotation Introduction</button>
        </div>
        <div class="column is-flex is-justify-content-center is-full p-0">
          <button v-if="curIndex == 1" class="button nav-btn  mb-2 has-text-white" @click="$emit('startEditorIntro')">Editor Introduction</button>
        </div>
      </div>
      <div class="is-flex is-justify-content-center mb-4">
        <button v-if="curIndex == 0" class="button nav-btn has-text-white" @click="curIndex = curIndex + 1">Next</button>
        <button v-if="curIndex == 1" class="button nav-btn has-text-white" @click="curIndex = curIndex + 1">No thanks</button>
        <button v-if="curIndex == 2" class="button nav-btn has-text-white" @click="$emit('disableModal')">Understood</button>
      </div>
        <div class="is-flex is-justify-content-center">
          <button class="button nav-dot mx-2" :class="curIndex == index ? 'active':''" @click="curIndex = index" :key="index" v-for="(elem, index) in introData.length"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * The first introduction that appears on first loading of the editor
 * Used to explain the editor, as well as present the editor and labanotation introductions
 * @displayName Editor Explain Modal
 */
export default {
  name: 'EditorExplainModal',
  emits: ["disableModal", "startLabanIntro", "startEditorIntro"],
  props: {
    modalActive: Boolean,
  },
  data() {
    return {
      introData: [{title: "Title", text: "Text"}],
      curIndex: 0,
    };
  },
  computed: {

  },
  mounted () {
    let lang = this.$store.state["language"];
    let json = require('@/assets/editor-help/intro/editor-explain-' + lang + '.json');
    let obj = JSON.parse(JSON.stringify(json));
    let data =[];
    for (const elem of Object.entries(obj.introData)) {
      data.push(elem[1]);
    }
    this.introData = data;
  },
  methods: {
    
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