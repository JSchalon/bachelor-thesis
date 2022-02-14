<template>
    <div id="library">
      <div id="cur-sign-container"><p class="cur-sign-text">Current Sign: {{curSign}}</p></div>
      <LibraryItem :active="item.active" :category="item.category" :index="index" :key="index" v-for="(item, index) of categories" @expand="selectCategory"/>
  </div>
</template>

<script>
import LibraryItem from "./LibraryItem.vue"

/**
 * The sign library component
 * @displayName Sign Library
 */
export default {
  name: 'SignLibrary',
  components: {
    LibraryItem
  },
  props: {
  },
  data() {
    return {
      categories: [
        {active: true, category: "Direction signs"},
        {active: false, category: "Turn signs"},
        {active: false, category: "Relationship bows"},
        {active: false, category: "Space measurement signs"},
        {active: false, category: "Path signs"},
        {active: false, category: "Room direction signs"},
        {active: false, category: "Bodypart signs"},
        {active: false, category: "Misc signs"},
      ],
      curSign: "Sussy"
    };
  },
  computed: {
    
  },
  mounted () {
    
  },
  methods: {
    selectCategory (index) {
      for (let ind = 0; ind < this.categories.length; ind++) {
        if (ind != index) {
          this.categories[ind].active = false;
        }
      }
      this.categories[index].active = !this.categories[index].active;
    }
  },
}
</script>


<style>
#library {
  width: 16%;
  height: 92vh;
  background-color: #c1c1c1;
  float: left;
}
#cur-sign-container {
  border-bottom: 1px solid #a1a1a1;
  min-height: 5vh;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.cur-sign-text {
  margin: 0 5px;
}

.library-category-container {
  width: 100%;
  background-color: white;
  float: left;
}

.library-item-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}
.library-item {
  width: calc(100% / 3);
  height: 70px;
  background-color: red;
}

.library-category-name {
  border-bottom: 1px solid #a1a1a1;
  width: 100%;
  box-sizing: border-box;
}

.library-category-text-container {
  min-height: 5vh;
  display: inline-flex;
  align-items: center;
}

.library-category-text {
  margin: 0 5px;
}
</style>
