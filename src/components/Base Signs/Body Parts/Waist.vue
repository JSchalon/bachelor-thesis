<template>
  <g>
    <rect 
      class="draggable actual-sign" 
      stroke="black" 
      :x="signWidth / 6" 
      :y="signWidth / 6" 
      :width="signWidth / 1.5" 
      :height="signWidth / 1.5"
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"
    />
    <path
      class="draggable actual-sign" 
      stroke="black"
      :d="path" 
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id">
    </path>
  </g>
</template>

<script>
/**
 * The Waist sign component
 * @displayName Waist Sign
 */
export default {
  name: 'WaistSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth", "borderWidth"],
  computed: {
    /**
     * Calculate the sign shape
     * @returns the svg path for the sign
     */
    path () {
      let path = 
        "M " + (this.signWidth / 6 + 4) + "," + (this.signWidth / 6 + 4) + " l " + (this.signWidth / 1.5 - 8) + "," + (this.signWidth / 1.5 - 8) +
        "m " + 0 + "," + (-this.signWidth / 1.5 + 8) + " l " + (-this.signWidth / 1.5 + 8) + "," + (this.signWidth / 1.5 - 8);
      return path;
    }
  },
}
</script>