<template>
    <g class="cat-container" x="0" y="0" :transform="'translate(0, ' + contextItemHeight * mIndex +')'" >
      <!-- holds a sign category (not yet implemented) @signSelect: update sign type -->
      <rect :x="0" y="0" :width="contextMenuWidth" :height="contextItemHeight" opacity="0"/>
      <text
        :x="margin"  
        :y="contextItemHeight / 2 - textHeight / 2" 
        ref="optionText"
        fill="black"
        dominant-baseline="text-before-edge"
      >
        {{optionText}}
      </text>
      <polygon :points="trianglePoints" fill="black" />
      <g class="category" :transform="'translate(' + contextMenuWidth + ', 0)'">
        <rect :x="0" y="0" :width="contextMenuWidth" :height="contextMenuWidth" fill="white" stroke="black"/>
      </g>
    </g>
</template>

<script>
//TODO: implements
/**
 * A container for a sign category for the context menu
 * @displayName SignCategoryContainer
 */
export default {
  name: "SignCategoryContainer",
  inject: ["contextMenuWidth", "contextItemHeight"],
  props: {
    mIndex: Number,
    optionText: String,
  },
  data() {
    return {
      textHeight: 0,
      margin: 10,
    };
  },
  mounted () {
    this.textHeight = this.$refs.optionText.getBBox().height;
  },
  methods: {
    
  },
  computed: {
    trianglePoints () {
      let yMin = this.contextItemHeight / 2 - this.margin;
      let yMax = this.contextItemHeight / 2 + this.margin;
      let xMax = this.contextMenuWidth - this.margin;
      let xMin = xMax - this.margin * 1.9;
      return xMin + "," + yMax + " " + xMin + "," + yMin + " " + xMax + "," + (this.contextItemHeight / 2);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .cat-container:hover > .category {
    display: block;
  }
  .category {
    display: none;
  }

  
</style>