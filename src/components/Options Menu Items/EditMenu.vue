<template>
  <ul class="option-nested menu-option" tabIndex="0" role="button">
    <li class="option-dropdown-top">
      <p>Edit</p>
    </li>
    <div class="option-box">
      <li :class="undoPossible ? 'active':'inactive'" class="option-item" @click="undo()">
        <div class="menu-option-container">
          <img src="@/assets/images/interaction-menu/undo-arrow.svg" class="option-img">
          <p>Undo</p>
          <p class="shortcut" v-if="showShortCuts">Ctrl+Z</p>
        </div>
      </li>
      <li :class="redoPossible ? 'active':'inactive'" class="option-item" @click="redo()">
        <div class="menu-option-container">
          <img src="@/assets/images/interaction-menu/redo-arrow.svg" class="option-img">
          <p>Redo</p>
          <p class="shortcut" v-if="showShortCuts">Ctrl+Y</p>
        </div>
      </li>
      <li class="option-item spacer"/>
      <li class="option-item" @click="activateMultiSelect()">
        <div class="menu-option-container">
          <img v-show="multiSelect" src="@/assets/images/interaction-menu/multi-select-active.svg" class="option-img">
          <img v-show="!multiSelect" src="@/assets/images/interaction-menu/multi-select-inactive.svg" class="option-img">
          <p>MultiSelect</p>
        </div>
      </li>
      <li class="option-item">
        <div class="menu-option-container has-sub-menu">
          <img src="@/assets/images/interaction-menu/selection-options.svg" class="option-img">
          <p>Selection Options</p>
          <img src="@/assets/images/interaction-menu/triangle-left.svg" class="option-img dropdown">
          <ul class="option-nested sub-menu" tabIndex="0" role="button">
            <div class="option-box sub-menu">
              <li :class="signs.length > 1 ? 'active':'inactive'" class="option-item" @click="selectAll()">
                <div class="menu-option-container">
                  <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
                  <p>Select all</p>
                  <p class="shortcut" v-if="showShortCuts">Ctrl+A</p>
                </div>
              </li>
              <li :class="selectedSigns.length > 0 ? 'active':'inactive'" class="option-item" @click="unselectAll()">
                <div class="menu-option-container">
                  <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
                  <p>Unselect all</p>
                  <p class="shortcut" v-if="showShortCuts">Ctrl+A</p>
                </div>
              </li>
              <li :class="selectedSigns.length > 0 ? 'active':'inactive'" class="option-item" @click="invertSelection()">
                <div class="menu-option-container">
                  <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
                  <p>Invert Selection</p>
                  <p class="shortcut" v-if="showShortCuts">Ctrl+I&nbsp;</p>
                </div>
              </li>
            </div>
          </ul>
        </div>
      </li>
      <li class="option-item" @click="activateDuplicate()">
        <div class="menu-option-container">
          <img v-show="duplicateActive" src="@/assets/images/common/duplicate-active.svg" class="option-img">
          <img v-show="!duplicateActive" src="@/assets/images/common/duplicate-inactive.svg" class="option-img">
          <p>Duplication Mode</p>
        </div>
      </li>
      <li :class="selectedSigns.length > 0 ? 'active':'inactive'" class="option-item" @click="deleteSelection()">
        <div class="menu-option-container">
          <img src="@/assets/images/interaction-menu/x.svg" class="option-img">
          <p>Delete Selection</p>
        </div>
      </li>
    </div>
  </ul>
</template>

<script>
/**
 * The standard Edit menu component
 * @displayName Options Edit Menu
 */
export default {
    name: 'EditMenu',
    props: {
      showShortCuts: Boolean
    },
    computed: {
      /**
       * checks if undoing is possible (there needs to be at least 1 saved state to roll back to)
       * @returns if undo is possible
       */
      undoPossible () {
        return this.$store.state["undoStack"].length > 1;
      },
      /**
       * checks if redoing is possible
       * @returns if redo is possible
       */
      redoPossible () {
        return this.$store.state["redoStack"].length > 0;
      },
      /**
       * gets the currently selected signs from the vuex state
       * @returns the selected signs
       */
      selectedSigns () {
        return this.$store.state["selectedSigns"];
      },
      /**
       * checks if multi select is active
       * @returns the boolean
       */
      multiSelect () {
        return this.$store.state["multiselectActive"];
      },
      /**
       * checks if sign duplication is active
       * @returns the boolean
       */
      duplicateActive () {
        return this.$store.state["duplicateSignActive"];
      },
      /**
       * gets the signs from the vuex state
       * @returns the signs js object
       */
      signs () {
        return this.$store.state["signs"];
      }
    },
    methods: {
      /**
       * calls the undo action in the vuex state 
       */
      undo () {
        this.$store.dispatch("undoChanges");
      },
      /**
       * calls the redo action in the vuex state 
       */
      redo () {
        this.$store.dispatch("redoChanges");
      },
      /**
       * activates multi selection in the vuex state 
       */
      activateMultiSelect () {
        this.$store.dispatch("toggleMultiSelect");
      },
      /**
       * activates the duplication mode in the vuex state 
       */
      activateDuplicate () {
        this.$store.dispatch("toggleDuplicateSignActive");
      },
      /**
       * deletes the currently selected signs 
       */
      deleteSelection () {
        if (this.selectedSigns.length == 0) { // no signs -> cant delete
          return;
        }
        // sorts the signs beforehand, else there are issues
        const sortedSelected = this.selectedSigns.sort();
        // clear the selected signs
        this.$store.dispatch("clearSelectedSigns");
        // disable any active context menu
        this.$store.dispatch("changeContextMenu", false);
        //iterate over the selected signs (backwards) and delete them
        for (let max = sortedSelected.length - 1; max >= 0; max--) {
          if (sortedSelected[max] > 0) { // don't delete first sign in signs, it is a dummy sign and can't be removed
            this.$store.dispatch("editSigns", {type: "delete", index: sortedSelected[max]});
          } 
        }
        // save history after
        this.$store.dispatch("saveStateInHistory");
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
       * clears all selected signs and the grid selection
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
        if (this.selectedSigns.length > 0) { // no sign selected -> nothing to invert 
          // place all signs in array
          let unselected = [];
          for (let index = 1; index < this.signs.length; index++) {
            unselected.push(index);
          }
          // remove all currently selected signs from that array (backwards)
          const sortedSelected = this.selectedSigns.sort();
          for (let index = sortedSelected.length - 1; index >= 0; index--) {
            unselected.splice(sortedSelected[index] - 1, 1);
          }
          
          // clear selection
          this.$store.dispatch("clearSelectedSigns");
          // select all signs in unselected array
          for (let index of unselected) {
            this.$store.dispatch("addToSelectedSigns", index);
          }
          // clear grid selection
          this.$store.dispatch("setSelectedColumn", false);
          this.$store.dispatch("setSelectedBar", false);
        }
      }
    }
}
</script>
