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
    :cx="22.5" 
    :cy="20" r="3" 
    stroke="black"
    stroke-width="2"
    :fill="signData.surface.includes('outer') ? 'black' : 'white'"
    :signID="id"/>
</template>

<script>
/**
 * The Knee sign component
 * @displayName Knee Sign
 */
export default {
  name: 'KneeSign',
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
      let path = "M 15,12 L 25,12 M 15,28 L 25,28 M 25,0 V 40";
      if (this.signData.limb) { // limb -> add vertical line
        path = "M 7.5,12 L 17.5,12 M 7.5,28 L 17.5,28 M 17.5,0 V 40 M 27.5,0 V 40";
      }
      if (this.signData.surface) { // surface -> add surface path
        if (this.signData.surface.includes("littleFinger")) {
          path = path + "M 27.5,20 H 32";
        } else if (this.signData.surface.includes("thumb")) {
          path = path + "M 27.5,20 H 35";
        }
      }
      return path;
    },
  },
}
</script>