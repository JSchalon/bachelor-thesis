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
      <li :class="multiSelect ? 'enabled':'disabled'" class="option-item" @click="activateMultiSelect()"><p>MutliSelect</p></li>
      <ul class="option-nested" tabIndex="0" role="button">
        <li class="option-dropdown-top"><p>Selection options</p></li>
        <div class="option-box">
          <li class="option-item" @click="selectAll()"><p>Select all</p></li>
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
        let sortedSelected = this.selectedSigns.sort();
        
        for (let max = sortedSelected.length - 1; max >= 0; max--) {
          this.$store.dispatch("clearSelectedSigns");
          this.$store.dispatch("changeContextMenu", false);
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
  height: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.option-item.inactive {
  opacity: 0.7;
  cursor:not-allowed;
}

.option-item * {
  display: block;
  color: #343434;
  text-decoration: none;
  padding: 0 0.5em;
}

.option-item.enabled p {
  color: #486175;
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

.option-nested {
  float: left;
  height: 100%;
  position: relative;
  padding: 0;
  display: block;
}

.option-dropdown-top {
  display: inline-block;
  height: 100%;
  margin: 0 0.5em;
  display: flex;
  align-items: center;
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
}

.option-box li:hover {background-color: rgb(184, 207, 236);}

</style>
