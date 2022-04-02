<template>
  <div id="library" :style="libraryActive ? 'width: 260px;' : 'width: 0;'">
    <div></div>
    <div id="cur-sign-container"><p class="cur-sign-text">Current Sign: {{curSign}}</p></div>
    <LibraryItemContainer :active="item.active" :selected="item.selected" :category="item.category" :catIndex="index" :key="index" v-for="(item, index) of categories" @expand="selectCategory" @selectSign="updateCurSign" @emitSigns="addSigns"/>
  </div>
</template>

<script>
import interact from "interactjs";

/**
 * The sign library component
 * @displayName Sign Library
 */
export default {
  name: 'SignLibrary',
  emits: ["selectSignDrag"],
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
      curSign: "---",
      signs: {},
    };
  },
  computed: {
    storedSign () {
      return this.$store.state["curSign"];
    },
    libraryActive () {
      return this.$store.state["libraryActive"];
    }
  },
  mounted () {
    interact(".library-sign-svg").draggable({
      inertia: false,
      autoScroll: false,

      // functions to call on event
      onstart: this.selectSignStart,
      onmove: this.selectSignMove,
      onend: this.selectSignEnd,
    }).styleCursor(false);
  },
  methods: {
    addSigns (data) {
      this.signs[data.catIndex] = data.signs;
    },
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
        if (data.updateSign) {
          let sign = {signData: data.signData};
          this.$store.dispatch('changeCurSign',sign);
        }
      } else if (!data.updateSign) {
        this.$store.dispatch('changeCurSign',false);
      } else {
        let sign = {signData: data.signData};
        this.$store.dispatch('changeCurSign',sign);
        this.categories[data.catIndex].selected = data.index;
        this.curSign = data.name;
      }
    },



    selectSignStart (event) {
      
      const catIndex = parseInt(event.target.getAttribute("cat-index"));
      const index = parseInt(event.target.getAttribute("index"));
      const lang = this.$store.state["language"];
      const json = require('@/assets/sign-category-loaders/' + this.categories[catIndex].category + '-' + lang + '.json');
      const obj = JSON.parse(JSON.stringify(json));
      const nameElem = obj.names.find(elem => this.signs[catIndex][index].signData.signType == elem.signType);
      this.updateCurSign({catIndex: catIndex, index: index, name: nameElem.name, signData: this.signs[catIndex][index].signData, updateSign: true});
      this.$emit("selectSignDrag", {type: "start", pos: {x: event.target.firstChild.getBoundingClientRect().x, y: event.target.firstChild.getBoundingClientRect().y}})
    },

    selectSignMove (event) {
      this.$emit("selectSignDrag", {type: "move", delta: {x: event.dx, y: event.dy}});
    },
    
    selectSignEnd (event) {
      const catIndex = parseInt(event.target.getAttribute("cat-index"));
      const index = parseInt(event.target.getAttribute("index"));
      this.updateCurSign({catIndex: catIndex, index: index, name: this.categories[catIndex].category, signData: this.signs[catIndex][index].signData});
      this.$emit("selectSignDrag", {type: "end"});
    },
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
  height: 92vh;
  overflow: auto;
  
  float: left;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  border-right: 1px solid #c1c1c1;
  background: #f4f4f4;
}
#cur-sign-container {
  background-color: #f4f4f4;
  border-bottom: 1px solid #c1c1c1;
  height: 5vh;
  min-height: 38px;
  max-height: 50px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 5;
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
  cursor: pointer;
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
