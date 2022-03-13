<template>
    <div class="context-menu-item" ref="container" :class="{unusable: !active}">
      <div class="center-vertically">
        <p class="context-item-text">{{optionText + ": " + options[selectedID].text}}</p>
      </div>
      <div class="context-item-interact-box full">
        <div class="center-vertically small" :key="index" v-for="(each, index) of options" v-on:click="changeSelect(index)">
          <img v-if="each.img" class="context-item-interact-img radio-option" :class="{active : index == selectedID}" :src="require(`@/assets/images/context-images` + each.img)" :alt="each.color"/>
          <div v-else class="context-item-interact-img radio-option flex" :class="{active : index == selectedID}">
            <div class="inner"/>
          </div>
        </div>
      </div>
      <div v-if="!active" class="blocker" :style="'height: ' + itemHeight + 'px'"/>
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
    initState: [String, Boolean],
    active: Boolean,
  },
  emits: ["switchState"],
  data() {
    return {
      selectedID: 1,
      itemHeight: 0,
    };
  },
  mounted () {
    this.selectedID = this.options.findIndex(obj => obj.text.includes(this.initState));
    this.itemHeight = this.$refs.container.getBoundingClientRect().height;
    if (this.selectedID == -1) {
      this.selectedID = 0;
    }
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