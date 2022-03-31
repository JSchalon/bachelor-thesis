<template>
  <ul class="option-nested menu-option" tabIndex="0" role="button">
    <li class="option-dropdown-top">
      <p>View</p>
    </li>
    <div class="option-box">
      <li class="option-item" @click="toggleHelpLines()">
        <div class="menu-option-container">
          <img v-show="helpLinesActive" src="@/assets/images/common/check.svg" class="option-img smaller">
          <img v-show="!helpLinesActive" src="@/assets/images/interaction-menu/blank.svg" class="option-img">
          <p>Score help Lines</p>
        </div>
      </li>
      <li class="option-item spacer"/>
      <li class="option-item" @click="toggleScoreDescription()">
        <div class="menu-option-container">
          <img v-show="showScoreDescription" src="@/assets/images/common/check.svg" class="option-img smaller">
          <img v-show="!showScoreDescription" src="@/assets/images/interaction-menu/blank.svg" class="option-img">
          <p>Score Description</p>
        </div>
      </li>
    </div>
  </ul>
</template>

<script>
/**
 * The standard View menu component
 * @displayName Options View Menu
 */
export default {
    name: 'ViewMenu',
    emits: ["requestNewScore"],
    props: {
      showShortCuts: Boolean
    },
    computed: {
      helpLinesActive(){
        return this.$store.state["showHelpLines"];
      },
      showScoreDescription(){
        return this.$store.state["showScoreDescription"];
      }
    },
    methods: {
      toggleHelpLines() {
        this.$store.dispatch("changeSettings", {showHelpLines: !this.helpLinesActive});
      },
      toggleScoreDescription() {
        this.$store.dispatch("changeSettings", {showScoreDescription: !this.showScoreDescription});
      }
    }
}
</script>


<style scoped>
</style>