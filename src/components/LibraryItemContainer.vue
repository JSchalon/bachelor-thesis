<template>
  <div class="library-category-container" ref="container">
    <div class="library-category-name" @click="expand">
      <div class="center-vertically">
        <p class="context-item-text">{{langStrings.catName}}</p>
      </div>
      <div class="center-vertically context-item-interact-box">
          <img class="context-item-interact-img smaller" :class="active ? 'turned' : 'unturned'" src="@/assets/images/sign-categories/triangle-right.svg" alt="triangle"/>
      </div>
    </div>
    <LibraryItem v-show="active" :active="active" :category="category" :catIndex="catIndex" :selected="selected" :offset="itemOffset" @emitSigns="emitSigns" @selectSign="selectSign"/>
  </div>
</template>

<script>
/**
 * The Library Item Container component
 * @displayName Library Item Container
 */
export default {
  name: 'LibraryItemContainer',
  inject: ["barHeight"],
  emits: ["expand", "emitSigns", "selectSign"],
  props: {
    active: Boolean,
    category: String,
    catIndex: Number,
    selected: Number,
  },
  data() {
    return {
      itemOffset: 0,
    };
  },
  computed: {
    langStrings () {
      let lang = this.$store.state["language"];
      let json = require('@/assets/sign-category-loaders/' + this.category + '-' + lang + '.json');
      let obj = JSON.parse(JSON.stringify(json));
      return obj;
    }
  },
  mounted () {
    this.itemOffset = this.getWidth();
  },
  methods: {
    expand () {
      this.$emit("expand", this.catIndex);
    },
    getWidth() {
        return this.$refs.container.offsetWidth / 6 - 20;
    },
    emitSigns (data) {
      this.$emit("emitSigns", data);
    },
    selectSign (data) {
      this.$emit("selectSign", data);
    },
  },
}
</script>


<style scoped>
  .turned {
    transform: rotate(90deg);
  }

  .unturned {
    transform: rotate(-90deg);
  }

  .selected {
    border: 1px solid blue;
  }
  
</style>
