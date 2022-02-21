<template>
    <div  class="context-menu-item">
      <div class="center-vertically">
        <p class="context-item-text">{{optionText}}</p>
      </div>
      <div class="context-item-interact-box">
        <div class="center-vertically" :key="index" v-for="(each, index) of options" v-on:click="changeSelect(index)">
          <img v-if="each.img" class="context-item-interact-img radio-option" :class="{active : index == selectedID}" :src="require(`@/assets/images/context-images` + each.img)" :alt="each.color"/>
          <div v-else class="context-item-interact-img radio-option flex" :class="{active : index == selectedID}">
            <div class="inner"/>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
/**
 * A custom context menu radio option for the direction signs
 * @emits switchState changes the current selected option
 * @displayName RadioOption
 */
export default {
  name: "RadioOption",
  inject: ["contextItemHeight"],
  props: {
    options: Array,
    optionText: String,
    mIndex: Number,
    initState: Number,
  },
  emits: ["switchState"],
  data() {
    return {
      selectedID: 1,
    };
  },
  mounted () {
    this.selectedID = this.initState;
  },
  methods: {
    /**
     * Method for changing the selected option of the property
     */
    changeSelect(index) {
      this.selectedID = index;
      this.$emit("switchState", this.options[index]);
    },
  },
  computed: {
    /**
     * calculates the text of the current selected option
     */
    selectedText() {
      return this.options[this.selectedID];
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  text{
    fill: black;
    margin-right: 10px;
  }
  .radio-option {
    border: 2px solid black;
    background-color: white;
    border-radius: 2000px;
    margin-left: var(--contextItemMargin);
  }

  .radio-option.active .inner {
    width: calc(var(--contextItemImageSize) - 5px);
    height: calc(var(--contextItemImageSize) - 5px);
    transform: translate(2.5px, 2.5px);
    background: red;
    border-radius: 2000px;
  }
  
</style>