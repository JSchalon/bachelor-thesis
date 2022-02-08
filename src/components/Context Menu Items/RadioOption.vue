<template>
    <g x="0" y="0" :transform="'translate(0, ' + contextItemHeight * mIndex +')'">
      <text :x="margin" :y="contextItemHeight / 2 - textHeight / 2" dominant-baseline="text-before-edge" ref="optionText" fill="black">{{optionText}}</text>
      <circle
        :class="[{active : index == selectedID},'radio-option']"
        :cx="contextMenuWidth - (options.length - 1 - (index)) * (contextItemHeight - margin * 2) * 5/4 - (contextItemHeight - margin * 2) / 2 - margin" 
        :cy="margin + (contextItemHeight - margin * 2) / 2" 
        :r="(contextItemHeight - margin * 2) / 2"
        :key="index" v-for="(each, index) of options" 
        :fill="each"
        @click="changeSelect(index)">
      </circle>
    </g>
</template>

<script>
/**
 * A custom context menu radio option for the direction signs
 * @emits switchState changes the current selected option
 * @displayName RadioOption
 */
export default {
  name: "RadioOption",
  inject: ["contextMenuWidth", "contextItemHeight"],
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
      textWidth: 0,
      textHeight: 0,
      margin: 10,
    };
  },
  mounted () {
    this.textWidth = this.$refs.optionText.getBBox().width;
    this.textHeight = this.$refs.optionText.getBBox().height;
    this.selectedID = this.initState;
  },
  methods: {
    /**
     * Method for changing the selected option of the property
     */
    changeSelect(index) {
      this.selectedID = index;
      this.$emit("switchState", this.options[index]);
    }
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
    stroke-width: 2;
    stroke: black;
  }
  .radio-option.active {
    stroke: green;
    stroke-width: 3;
  }
  
</style>