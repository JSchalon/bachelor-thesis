<template>
  <div id="interaction-menu">
    <ul class="interaction-menu-list">
      <li :class="undoPossible ? 'active':'inactive'" class="option-item" @click="undo()">
        <img src="@/assets/images/interaction-menu/undo-arrow.svg" class="option-img">
      </li>
      <li :class="redoPossible ? 'active':'inactive'" class="option-item" @click="redo()">
        <img src="@/assets/images/interaction-menu/redo-arrow.svg" class="option-img">
      </li>
      
      <li class="option-divider"><p></p></li>
      <li :class="multiSelect ? 'enabled':'disabled'" class="option-item" @click="activateMultiSelect()">
        <img v-show="multiSelect" src="@/assets/images/interaction-menu/multi-select-active.svg" class="option-img">
        <img v-show="!multiSelect" src="@/assets/images/interaction-menu/multi-select-inactive.svg" class="option-img">
      </li>
      <ul class="option-nested" tabIndex="0" role="button">
        <li class="option-dropdown-top">
          <img src="@/assets/images/interaction-menu/selection-options.svg" class="option-img">
          <img src="@/assets/images/interaction-menu/triangle-left.svg" class="option-img dropdown">
        </li>
        <div class="option-box">
          <li :class="signs.length > 1 ? 'active':'inactive'" class="option-item" @click="selectAll()"><p>Select all</p></li>
          <li :class="selectedSigns.length > 0 ? 'active':'inactive'" class="option-item" @click="unselectAll()"><p>Unselect all</p></li>
          <li :class="selectedSigns.length > 0 ? 'active':'inactive'" class="option-item" @click="invertSelection()"><p>Invert Selection</p></li>
        </div>
      </ul>
      <li :class="duplicateActive ? 'enabled':'disabled'" class="option-item" @click="activateDuplicate()">
        <img v-show="duplicateActive" src="@/assets/images/common/duplicate-active.svg" class="option-img">
        <img v-show="!duplicateActive" src="@/assets/images/common/duplicate-inactive.svg" class="option-img">
      </li>
      <li class="option-divider"><p></p></li>
      <li :class="selectedSigns.length > 0 ? 'active':'inactive'" class="option-item" @click="deleteSelection()">
        <img src="@/assets/images/interaction-menu/x.svg" class="option-img">
      </li>
    </ul>
  </div>
</template>

<script>
  /**
   * The Interaction menu component
   * @displayName Interaction Menu
   */
  export default {
    name: 'InteractionMenu',
    data() {
      return {
        curSign: "---"
      };
    },
    computed: {
      /**
       * @returns whether undoing is possible
       */
      undoPossible () {
        return this.$store.state["undoStack"].length > 1;
      },
      /**
       * @returns whether redoing is possible
       */
      redoPossible () {
        return this.$store.state["redoStack"].length > 0;
      },
      // getters for vuex variables
      selectedSigns () {
        return this.$store.state["selectedSigns"];
      },
      multiSelect () {
        return this.$store.state["multiselectActive"];
      },
      duplicateActive () {
        return this.$store.state["duplicateSignActive"];
      },
      signs () {
        return this.$store.state["signs"];
      }
    },
    methods: {
      /**
       * dispatches an undo action
       */
      undo () {
        this.$store.dispatch("undoChanges");
      },
      /**
       * dispatches a redo action
       */
      redo () {
        this.$store.dispatch("redoChanges");
      },
      /**
       * deletes all currently selected signs
       */
      deleteSelection () {
        if (this.selectedSigns.length == 0) { // no selection -> no effect
          return;
        }
        // sort selection before
        const sortedSelected = this.selectedSigns.sort();
        // clear selection and context menu
        this.$store.dispatch("clearSelectedSigns");
        this.$store.dispatch("changeContextMenu", false);
        //delete signs (decreasing order)
        for (let max = sortedSelected.length - 1; max >= 0; max--) {
          
          if (sortedSelected[max] > 0) {
            this.$store.dispatch("editSigns", {type: "delete", index: sortedSelected[max]});
          } 
        }
        this.$store.dispatch("saveStateInHistory");
      },
      /**
       * toggles the multi select mode
       */
      activateMultiSelect () {
        this.$store.dispatch("toggleMultiSelect");
      },
      /**
       * toggles the duplication mode
       */
      activateDuplicate () {
        this.$store.dispatch("toggleDuplicateSignActive");
      },
      /**
       * selects all signs
       */
      selectAll () {
        this.$store.dispatch("clearSelectedSigns");
        for (let index = 1; index < this.signs.length; index++) {
          this.$store.dispatch("addToSelectedSigns", index);
        }
      },
      /**
       * unselects all signs
       */
      unselectAll () {
        this.$store.dispatch("clearSelectedSigns");
        this.$store.dispatch("setSelectedColumn", false);
        this.$store.dispatch("setSelectedBar", false);
      },
      /**
       * inverts the current selection
       */
      invertSelection () {
        if (this.selectedSigns.length > 0) { // only if a sign is selected
          let unselected = [];
          for (let index = 1; index < this.signs.length; index++) {
            unselected.push(index);
          }
          // sort selection
          const sortedSelected = this.selectedSigns.sort();
          //remove selected indices from the unselected array
          for (let index = sortedSelected.length - 1; index >= 0; index--) {
            unselected.splice(sortedSelected[index] - 1, 1);
          }
          // clear selected signs
          this.$store.dispatch("clearSelectedSigns");
          // select new signs
          for (let index of unselected) {
            this.$store.dispatch("addToSelectedSigns", index);
          }
          this.$store.dispatch("setSelectedColumn", false);
          this.$store.dispatch("setSelectedBar", false);
        }
      }
    },
  }
</script>

<style scoped>
#interaction-menu {
  width: 100%;
  height: 5vh;
  min-height: 38px;
  max-height: 50px;
  background: var(--bg-lightest);
  box-sizing: border-box;
  border-bottom: 1px solid var(--bg-light-less-2);
  position: relative;
  z-index: 5;
}

.options-tool-tip {
  position: absolute;
}

.interaction-menu-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
