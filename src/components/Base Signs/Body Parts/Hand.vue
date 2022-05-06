<template>
  <path 
    class="actual-sign draggable"
    stroke="black"
    :d="path"
    :class="{active: isSelected}" 
    :stroke-width="isSelected ? borderWidth + 1: borderWidth"
    :signID="id"
  />
  <circle 
    v-if="signData.surface && (signData.surface.includes('outer') || signData.surface.includes('inner'))"
    :cx="26" 
    :cy="15" r="3" 
    stroke="black"
    stroke-width="2"
    :fill="signData.surface.includes('outer') ? 'black' : 'white'"
    :signID="id"/>
</template>

<script>
/**
 * The Hand sign component
 * @displayName Hand Sign
 */
export default {
  name: 'HandSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["borderWidth"],
  computed: {
    /**
     * Calculate the sign shape
     * @returns the svg path for the sign
     */
    path () {
      let path = "M 12,15 L 28,0 V 25 M 12,40 L 28,25 M 12,23.3333333332 L 28,8.33333333332 M 12,31.6666666665 L 28,16.6666666665";
      if (this.signData.limb) { // limb -> add extra line
        path = "M 12,15 L 24,5 V 30 M 12,40 L 24,30 M 12,23.3333333332 L 24,13.3333333332 M 12,31.6666666665 L 24,21.6666666665 M 28,0 V 30";
      }
      if (this.signData.surface) { // surface -> add surface path
        if (this.signData.surface.includes("littleFinger")) {
          path = path + "M 28,15 H 32";
        } else if (this.signData.surface.includes("thumb")) {
          path = path + "M 28,15 H 35";
        }
      }
      return path;
    },
    
  },
}
</script>