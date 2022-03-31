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
    emits: ["requestNewScore"],
    props: {
      showShortCuts: Boolean
    },
    computed: {
      undoPossible () {
        return this.$store.state["undoStack"].length > 1;
      },
      redoPossible () {
        return this.$store.state["redoStack"].length > 0;
      },
      selectedSigns () {
        return this.$store.state["selectedSigns"];
      },
      multiSelect () {
        return this.$store.state["multiselectActive"];
      },
      signs () {
        return this.$store.state["signs"];
      }
    },
    methods: {
      undo () {
        this.$store.dispatch("undoChanges");
      },
      redo () {
        this.$store.dispatch("redoChanges");
      },
      activateMultiSelect () {
        this.$store.dispatch("toggleMultiSelect");
      },
      deleteSelection () {
        if (this.selectedSigns.length == 0) {
          return;
        }
        const sortedSelected = this.selectedSigns.sort();
        this.$store.dispatch("clearSelectedSigns");
        this.$store.dispatch("changeContextMenu", false);
        for (let max = sortedSelected.length - 1; max >= 0; max--) {
          
          if (sortedSelected[max] > 0) {
            this.$store.dispatch("editSigns", {type: "delete", index: sortedSelected[max]});
          } 
        }
        this.$store.dispatch("saveStateInHistory");
      },
      selectAll () {
        this.$store.dispatch("clearSelectedSigns");
        for (let index = 1; index < this.signs.length; index++) {
          this.$store.dispatch("addToSelectedSigns", index);
        }
      },
      unselectAll () {
        this.$store.dispatch("clearSelectedSigns");
        this.$store.dispatch("setSelectedColumn", false);
        this.$store.dispatch("setSelectedBar", false);
      },
      invertSelection () {
        if (this.selectedSigns.length > 0) {
          let unselected = [];
          for (let index = 1; index < this.signs.length; index++) {
            unselected.push(index);
          }
          const sortedSelected = this.selectedSigns.sort();
          for (let index = sortedSelected.length - 1; index >= 0; index--) {
            unselected.splice(sortedSelected[index] - 1, 1);
          }
          
          this.$store.dispatch("clearSelectedSigns");
          for (let index of unselected) {
            this.$store.dispatch("addToSelectedSigns", index);
          }
          this.$store.dispatch("setSelectedColumn", false);
          this.$store.dispatch("setSelectedBar", false);
        }
      }
    }
}
</script>


<style scoped>
</style>