<template>
    <g x="0" y="0" :transform="'translate(0, ' + contextItemHeight * mIndex +')'">
      <text
        :x="margin" 
        :y="contextItemHeight / 2 - textHeight / 2" 
        ref="optionText"
        fill="black"
        dominant-baseline="text-before-edge"
      >
        {{optionText}}
      </text>
      <g :transform="'translate(' + (contextMenuWidth - margin - contextItemHeight) + ', ' + margin +')'" @click="changeState">
        <rect 
          :x="0" 
          :y="0"
          :rx="onOffDimension / 2"
          :height="onOffDimension"
          :width="contextItemHeight"
          fill="#bfbfbf"
        />
        <rect
          class="anim"
          :x="state ? margin * 2 + 2 : 2"
          :y="2"
          :rx="onOffDimension / 2"
          :height="onOffDimension - 4"
          :width="onOffDimension - 4"
          :fill="state ? 'green' : '#868686'"
        />
      </g>
    </g>
</template>

<script>
/**
 * The generic context menu on/off option
 * @emits switchState the new state of the option
 * @displayName OnOffOption
 */
export default {
  name: "OnOffOption",
  inject: ["contextMenuWidth", "contextItemHeight"],
  props: {
    mIndex: Number,
    optionText: String,
    initState: Boolean,
  },
  emits: ["switchState"],
  data() {
    return {
      textHeight: 0,
      margin: 10,
      state: false,
    };
  },
  mounted () {
    this.textHeight = this.$refs.optionText.getBBox().height;
    this.state = this.initState;
  },
  methods: {
    /**
     * Method for changing the state of the property
     */
    changeState() {
      this.state = !this.state;
      this.$emit("switchState", this.state);
    }
  },
  computed: {
    /**
     * calculates the height of the on/off button
     */
    onOffDimension () {
      return this.contextItemHeight - this.margin * 2
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .anim {
    transition: x 0.2s ease;
  }
</style>