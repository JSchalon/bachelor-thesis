<template>
  <div id="library" :style="libraryActive ? 'width: 260px;' : 'width: 0;'">
    <div></div>
    <div id="cur-sign-container"><p class="cur-sign-text">{{curSign}}</p></div>
    <LibraryItemContainer :active="item.active" :selected="item.selected" :category="item.category" :catIndex="index" :key="index" v-for="(item, index) of categories" @expand="selectCategory" @selectSign="updateCurSign" @emitSigns="addSigns"/>
  </div>
</template>

<script>
import interact from "interactjs";

/**
 * The sign library component
 * @emits selectSignDrag when a sign is being dragged
 * @displayName Sign Library
 */
export default {
  name: 'SignLibrary',
  emits: ["selectSignDrag"],
  data() {
    return {
      // the sign categorys in the library
      categories: [
        {active: false, category: "direction-signs", selected: -1},
        {active: false, category: "turn-signs", selected: -1},
        {active: false, category: "relationship-bows", selected: -1},
        {active: false, category: "space-measurement-signs", selected: -1},
        {active: false, category: "path-signs", selected: -1},
        {active: false, category: "body-part-signs", selected: -1}, 
        {active: false, category: "misc-signs", selected: -1},
      ],
      curSign: "",
      signs: {},
    };
  },
  computed: {
    /**
     * @returns the currently selected sign
     */
    storedSign () {
      return this.$store.state["curSign"];
    },
    /**
     * @returns whether the library is active
     */
    libraryActive () {
      return this.$store.state["libraryActive"];
    }
  },
  watch: {
    storedSign (sign) {
      //if a sign is placed, the state.curSign is reset -> reset selection in library
      if (!sign) {
        this.curSign = "";
        for (let elem of this.categories) {
          elem.selected = -1;
        }
      }
    }
  },
  mounted () {
    // sets the interact drag-event listeners
    interact(".library-sign-svg").draggable({
      inertia: false,
      autoScroll: false,

      // functions to call on dragging
      onstart: this.selectSignStart,
      onmove: this.selectSignMove,
      onend: this.selectSignEnd,
    }).styleCursor(false);
  },
  methods: {
    /**
     * adds the specified signs to the signs index
     * @param data the new signs
     */
    addSigns (data) {
      this.signs[data.catIndex] = data.signs;
    },
    /**
     * opens a sign category
     * @param index the category index
     */
    selectCategory (index) {
      //first unselects all categorys
      for (let ind = 0; ind < this.categories.length; ind++) {
        if (ind != index) {
          this.categories[ind].active = false;
        }
      }
      //selects the new category (if it was not already active)
      this.categories[index].active = !this.categories[index].active;
    },
    /**
     * updates the currently selected sign
     * @param data the category, index and signdata
     */
    updateCurSign (data) {
      this.curSign = "";
      let unselect = false;
      if (this.categories[data.catIndex].selected == data.index) {
        //if the new selected sign == the old selected sign -> unselect
        unselect = true;
      }
      //unselect all categories
      for (let elem of this.categories) {
        elem.selected = -1;
      }
      if (!unselect) {
        //if the new selected sign == the old selected sign -> unselect
        this.categories[data.catIndex].selected = data.index;
        this.curSign = "Current Sign: " + data.name;
        //push to current sign
        if (data.updateSign) {
          let sign = {signData: data.signData};
          this.$store.dispatch('changeCurSign',sign);
        }
      } else if (!data.updateSign) { // no new sign selected -> reset selected sign
        this.$store.dispatch('changeCurSign',false);
      } else { 
        // select new sign
        let sign = {signData: data.signData};
        this.$store.dispatch('changeCurSign',sign);
        // select new category as active and update cur sign name container
        this.categories[data.catIndex].selected = data.index;
        this.curSign = data.name;
      }
    },



    /**
     * the drag start event listener for dragging a sign in the library
     * @param event the drag-start event 
     */
    selectSignStart (event) {
      // get the category and sign index in the signs index
      const catIndex = parseInt(event.target.getAttribute("cat-index"));
      const index = parseInt(event.target.getAttribute("index"));
      // get the name of the sign
      const lang = this.$store.state["language"];
      const json = require('@/assets/sign-category-loaders/' + this.categories[catIndex].category + '-' + lang + '.json');
      const obj = JSON.parse(JSON.stringify(json));
      const nameElem = obj.names.find(elem => this.signs[catIndex][index].signData.signType == elem.signType);
      // update the current selected sign
      this.updateCurSign({catIndex: catIndex, index: index, name: nameElem.name, signData: this.signs[catIndex][index].signData, updateSign: true});
      // emit the drag start to the main view
      this.$emit("selectSignDrag", {type: "start", pos: {x: event.target.firstChild.getBoundingClientRect().x, y: event.target.firstChild.getBoundingClientRect().y}});
      // change the grid selection depending on the sign
      if (this.signs[catIndex][index].signData.baseType == "RoomDirectionSign") {
        this.$store.dispatch("addToGridSelect", {col: -this.$store.state["columnsLeft"] - 1});
      } else if (this.signs[catIndex][index].signData.baseType == "PathSign") {
        this.$store.dispatch("addToGridSelect", {col: this.$store.state["columnsRight"]});
      } else if (this.signs[catIndex][index].signData.baseType == "BodyPartSign" || this.signs[catIndex][index].signData.baseType == "PropSign") {
        for (let col = -this.$store.state["columnsLeft"]; col < this.$store.state["columnsRight"]; col++) {
          this.$store.dispatch("addToGridSelect", {col: col, bar: -1, beat: 0});
        }
      } else {
        for (let col = -this.$store.state["columnsLeft"]; col < this.$store.state["columnsRight"]; col++) {
          this.$store.dispatch("addToGridSelect", {col: col, bar: -2});
          this.$store.dispatch("addToGridSelect", {col: col, bar: -1, beat: 0});
        }
      }
    },
    /**
     * the drag move event listener for dragging a sign in the library
     * @param event the drag-move event 
     */
    selectSignMove (event) {
      // emit the new position of the dragged sign to the main view
      this.$emit("selectSignDrag", {type: "move", delta: {x: event.dx, y: event.dy}});
    },
    /**
     * the drag end event listener for dragging a sign in the library
     * @param event the drag-end event 
     */
    selectSignEnd (event) {
      // update the current sign
      const catIndex = parseInt(event.target.getAttribute("cat-index"));
      const index = parseInt(event.target.getAttribute("index"));
      this.updateCurSign({catIndex: catIndex, index: index, name: this.categories[catIndex].category, signData: this.signs[catIndex][index].signData});
      // emit the drag end to the main view
      this.$emit("selectSignDrag", {type: "end"});
      // clear the grid selection
      this.$store.dispatch("clearGridSelect");
    },
  },
}
</script>

<style>
#library {
  height: 92vh;
  overflow: auto;
  
  float: left;
  position: relative;
  z-index: 5;
  box-sizing: border-box;
  border-right: 1px solid var(--bg-light-less-2);
  background: var(--bg-lightest);
  color: var(--text-options);
}
#cur-sign-container {
  background-color: var(--bg-lightest);
  border-bottom: 1px solid var(--bg-light-less-2);
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
