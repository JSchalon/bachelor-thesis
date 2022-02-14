<template>
  <div class="library-category-container">
    <div class="library-category-name" @click="expand">
      <div class="center-vertically">
        <p class="context-item-text">{{category}}</p>
      </div>
      <div class="center-vertically context-item-interact-box">
          <img class="context-item-interact-img smaller" :class="{turned: active}" src="@/assets/images/sign-categories/triangle-right.svg" alt="triangle" v-on:click="deletesign" />
      </div>
    </div>
    <div v-show="active" class="library-item-container">
      <div class="library-item" :key="index" v-for="(elem, index) of signs" @click="selectSign(index)">
        <img :height="libraryImgHeight" :src="loadSignImg(elem.file)" :alt="elem.name"  :class="{selected: selected == index}"/>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * The LibraryItem component
 * @displayName Library Item
 */
export default {
  name: 'LibraryItem',
  inject: ["libraryImgHeight"],
  emits: ["expand", "selectSign"],
  props: {
    active: Boolean,
    category: String,
    catIndex: Number,
    selected: Number,
  },
  data() {
    return {
      signs: [],
    };
  },
  computed: {
    
  },
  mounted () {
    //load signs and add click functionality
    let json = require('@/assets/images/sign-categories/' + this.category + '/' + this.category + '.json');
    let obj = JSON.parse(JSON.stringify(json));
    
    for (let [key, value] of Object.entries(obj)) {
      let signsObj = {};
      signsObj["name"] = key;
      signsObj["file"] = value;
      this.signs.push(signsObj);
    }
  },
  methods: {
    loadSignImg(name) {
      return require('@/assets/images/sign-categories/' + this.category + '/' + name);
    },
    expand () {
      this.$emit("expand", this.catIndex);
    },
    selectSign (index) {
      this.$emit("selectSign", {catIndex: this.catIndex, name: this.signs[index].name, index: index});
    }
  },
}
</script>


<style scoped>
  .turned {
    transform: rotate(90deg);
  }

  .selected {
    border: 1px solid blue;
  }
</style>
