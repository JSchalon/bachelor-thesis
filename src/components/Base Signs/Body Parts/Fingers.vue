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
    v-if="signData.surface && this.signData.limb && (signData.surface.includes('outer') || signData.surface.includes('inner'))"
    :cx="26" 
    :cy="15" r="3" 
    stroke="black"
    stroke-width="2"
    :fill="signData.surface.includes('outer') ? 'black' : 'white' "
    :signID="id"/>
  <g v-if="signData.digit >= 1 && signData.digit <= 5">
    <g v-if="signData.joint >= 1 && signData.joint <= 4" :transform="signData.limb ? 'translate(27,-25)' : 'translate(28,-26)'">
      <circle fill="black" :cx="-(index * 4)" :cy="(signData.digit - 1) * 6.25 + indexPoint(28 - (index * 4))" r="2" :key="index" v-for="index of (signData.joint)" :signID="id"/>
    </g>
    <circle v-if="signData.joint == 0" fill="black" :cx="12" :cy="(signData.digit - 1) * 6.25 + indexPoint(8) - 28.5" r="2" :signID="id"/>
  </g>
</template>

<script>
/**
 * The Finger sign component
 * @displayName Finger Sign
 */
export default {
  name: 'FingerSign',
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
      let path = "M 12,15 L 28,0 V 25 M 12,40 L 28,25 M 12,21.25 L 28,6.5 M 12,27.5 L 28,13 M 12,33.75 L 28,19";
      if (this.signData.limb) { // limb -> add vertical line
          path = "M 12,15 L 24,5 V 30 M 12,40 L 24,30 M 12,21.25 L 24,11.25 M 12,27.5 L 24,17.5 M 12,33.75 L 24,23.75 M 28,0 V 30";
      }
      if (this.signData.surface && this.signData.limb) { // surface -> add surface path
        if (this.signData.surface.includes("littleFinger")) {
          path = path + "M 28,15 H 32";
        } else if (this.signData.surface.includes("thumb")) {
          path = path + "M 28,15 H 35";
        }
      }
      return path;
    },
  },
  methods: {
    /**
     * calculates the y position of a given digit index. Digit indices follow a slope
     * @param x the x position to base the calculation on
     * @returns the y position
     */
    indexPoint (x) {
      let y = -(5/6) * x + 50;
      if (this.signData.limb) { //limb -> shift the point
        y = -(5/6) * x + 50;
      }
      return y;
    }
  },
}
</script>