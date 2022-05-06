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
    :cx="24" 
    :cy="20" r="3" 
    stroke="black"
    stroke-width="2"
    :fill="signData.surface.includes('outer') ? 'black' : 'white'"
    :signID="id"/>
</template>

<script>
/**
 * The Shoulder sign component
 * @displayName Shoulder Sign
 */
export default {
  name: 'ShoulderSign',
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
      let path = "M 12,15 L 28, 0 V 40";
      if (this.signData.limb) { // limb -> add vertical line
        path = path + "M 20,7.5 V 40";
      }
      if (this.signData.surface) { // surface -> add surface path
        if (this.signData.surface.includes("littleFinger")) {
          path = path + "M 28,20 H 32";
        } else if (this.signData.surface.includes("thumb")) {
          path = path + "M 28,20 H 35";
        }
      }
      return path;
    },
  },
}
</script>