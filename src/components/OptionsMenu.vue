<template>
  <div id="options-menu">
    <ul class="options-menu-list" ref="optionsList">
      <FileMenu :showShortCuts="!(isTabletOrPhone)" @mouseleave="blurFocus()" @requestNewScore="requestNewScore" @requestUpload="requestUpload" @requestScoreDetails="requestScoreDetails"/>
      <EditMenu :showShortCuts="!(isTabletOrPhone)" @mouseleave="blurFocus()"/>
      <ViewMenu :showShortCuts="!(isTabletOrPhone)" @mouseleave="blurFocus()"/>
      <HelpMenu :showShortCuts="!(isTabletOrPhone)" @mouseleave="blurFocus()" @startIntroduction="startIntroduction"/>
    </ul>
  </div>
</template>

<script>
/**
 * The Options Menu component
 * @displayName Options Menu
 */
export default {
    name: 'OptionsMenu',
    emits: ["requestNewScore", "requestUpload", "requestScoreDetails", "startIntroduction"],
    computed: {
      isTabletOrPhone () {
        return  (this.$store.state["isPhone"] || this.$store.state["isTablet"]);
      }
    },
    methods: {
      blurFocus() {
        document.activeElement.blur();
      },
      requestNewScore () {
        this.$emit("requestNewScore");
      },
      requestUpload (file) {
        this.$emit("requestUpload", file);
      },
      requestScoreDetails () {
        this.$emit("requestScoreDetails");
      },
      startIntroduction (which) {
        this.$emit("startIntroduction", which);
      },

    }
}
</script>


<style>
#options-menu {
  width: 100%;
  height: 8vh;
  background-color: #ffffff;
  display: flex;
  align-items: flex-end;
  box-sizing: border-box;
  border-bottom: 1px solid #c1c1c1;
}
.options-menu-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
  height: 4.5vh;
  min-height: 30px;
  z-index: 3;
}

.menu-option:hover .option-dropdown-top {
  background-color: #e9e9e9;
}

.menu-option:focus .option-dropdown-top {
  background-color: #e9e9e9;
}

.menu-option-container .option-img:not(.dropdown) {
  padding: 0 0.8em;
  margin: 0;
  height: 20px;
}

.menu-option-container .option-img.smaller {
  height: 15px;
  padding: 0 calc(0.8em + 2.5px)
}

.menu-option-container .option-img.dropdown {
  padding: 0 0.8em;
  transform: none;
  margin-left: auto;
  order: 2;
}

.menu-option-container p {
  padding: 0;
  padding-right: 0.8em;
  margin: 0.5em 0;
  white-space: nowrap;
}
.menu-option-container {
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  height: 34px;
}

.menu-option:active .option-dropdown-top {
  background-color: #e9e9e9;
}

.option-item.spacer {
  height: 1px;
  box-sizing: border-box;
  border-bottom: 1px solid #d6d6d6;
  width: calc(100%);
  margin: 0.25em 0;
}

.option-box.sub-menu {
  transform: none;
}

.option-box.sub-menu .option-item {
  padding: 0;
}

.sub-menu {
  display: none;
}

.option-nested.sub-menu {
  order: 3;
}

.menu-option-container.has-sub-menu:hover .sub-menu {
  display: block;
  border-radius: 5px;
}

.input-hidden {
  visibility: hidden;
  height: 0;
  width: 0;
  margin: 0;
  padding: 0;
}

</style>
