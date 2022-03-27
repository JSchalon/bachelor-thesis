<template>
  <div id="menu">
    <ul class="options-list">
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
          <li :class="selectedSigns.length > 0 ? 'active':'inactive'" class="option-item" @click="invertSelection()"><p>Invert selection</p></li>
        </div>
      </ul>
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
    mounted () {
      
    },
    methods: {
      undo () {
        this.$store.dispatch("undoChanges");
      },
      redo () {
        this.$store.dispatch("redoChanges");
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
      activateMultiSelect () {
        this.$store.dispatch("toggleMultiSelect");
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
    },
  }
</script>


<style scoped>
#menu {
  width: 100%;
  height: 5vh;
  background-color: #bfbfbf;
}

.options-tool-tip {
  position: absolute;
}

.options-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
  height: 100%;
}

.option-item, .option-divider {
  float: left;
  height: calc(100% - 10px);
  margin-top: 5px;
  display: flex;
  align-items: center;
  position: relative;
  border-radius: 5px;
}

.option-item.inactive {
  opacity: 0.5;
  cursor:not-allowed;
}

.option-item {
  cursor: pointer;
}

.option-item * {
  display: block;
  color: #343434;
  text-decoration: none;
  padding: 0 0.5em;
}

.option-item:hover {
  background-color: #b3b3b3;
}

.option-item:focus {
  background-color: #b3b3b3;
}

.option-item:active {
  background-color: #b3b3b3;
}

.option-item.enabled {
  background-color: #b3b3b3;
}
.option-item.enabled p {
  color: #446f97;
}

.option-divider p {
  display: block;
  width: 2px;
  height: 75%;
  background-color: #8d8d8d;
  margin: 0 0.5em;
}

.option-img {
  height: 70%;
}

.option-img.dropdown {
  height: 40%;
  transform: rotate(90deg);
}

.option-nested {
  float: left;
  height: 100%;
  position: relative;
  padding: 0;
  display: block;
}

.option-dropdown-top {
  display: inline-block;
  height: calc(100% - 10px);
  margin: 5px 0;
  display: flex;
  align-items: center;
  border-radius: 5px;
}
.option-dropdown-top * {
  padding: 0 0.5em;
}

.option-dropdown-top:hover {
  background-color: #b3b3b3;
}

.option-dropdown-top:focus {
  background-color: #b3b3b3;
}

.option-dropdown-top:active {
  background-color: #b3b3b3;
}

.option-nested:hover .option-box {
  display: block;
}

.option-nested:focus .option-box {
  display: block;
}

.option-nested:active .option-box {
  display: block;
}


.option-box {
  float: initial;
  display: none;
  position: absolute;
  z-index: 1;
  padding: 0;
  min-width: 150px;
  background-color: #cecece;
}

.option-box li {
  width: 100%;
  display: block;
  margin: 0;
}
.option-box p {
  padding: 0.5em 0;
  margin: 0 0.5em;
}

.option-box li:hover {background-color: rgb(184, 207, 236);}

</style>
