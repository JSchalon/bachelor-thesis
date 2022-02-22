<template>
    <div id="library">
      <div id="cur-sign-container"><p class="cur-sign-text">Current Sign: {{curSign}}</p></div>
      <LibraryItemContainer :active="item.active" :selected="item.selected" :category="item.category" :catIndex="index" :key="index" v-for="(item, index) of categories" @expand="selectCategory" @selectSign="updateCurSign"/>
  </div>
</template>

<script>

/**
 * The sign library component
 * @displayName Sign Library
 */
export default {
  name: 'SignLibrary',
  props: {
  },
  data() {
    return {
      categories: [
        {active: false, category: "direction-signs", selected: -1},
        {active: false, category: "turn-signs", selected: -1},
        {active: false, category: "relationship-bows", selected: -1},
        {active: false, category: "space-measurement-signs", selected: -1},
        {active: false, category: "path-signs", selected: -1},
        {active: false, category: "body-part-signs", selected: -1}, 
        {active: false, category: "misc-signs", selected: -1},
      ],
      curSign: "---"
    };
  },
  computed: {
    storedSign () {
      return this.$store.state["curSign"];
    }
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
    },
    updateCurSign (data) {
      this.curSign = "---";
      let unselect = false;
      if (this.categories[data.catIndex].selected == data.index) {
        //if the new selected sign == the old selected sign -> unselect
        unselect = true;
      }
      for (let elem of this.categories) {
        elem.selected = -1;
      }
      if (!unselect) {
        //if the new selected sign == the old selected sign -> unselect
        this.categories[data.catIndex].selected = data.index;
        this.curSign = data.name;
        //push to current sign
        let sign = {height: data.height, signData: data.signData};
        this.$store.dispatch('changeCurSign',sign);
      } else {
        this.$store.dispatch('changeCurSign',false);
      }
    }
  },
  watch: {
    storedSign (sign) {
      //if a sign is placed, the state.curSign is reset -> reset selection in library
      if (!sign) {
        this.curSign = "---";
        for (let elem of this.categories) {
          elem.selected = -1;
        }
      }
    }
  }
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
  margin: 0 var(--contextItemMargin);
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
  border-top: 1px solid #c1c1c1;
  box-sizing: border-box;
}
.library-item {
  width: calc(100% / 3);
  padding: 5px 0;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

.library-category-name {
  width: 100%;
  box-sizing: border-box;
}

.library-category-text-container {
  min-height: 5vh;
  display: inline-flex;
  align-items: center;
}

.library-category-text {
  margin: 0 var(--contextItemMargin);
}
</style>
