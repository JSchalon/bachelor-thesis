<template>
  <g v-if="place == 'left'" :transform="'translate(' + canvasMargin + ', ' + positionY +')'" ref="addRemove" v-on:click="$emit('addCollumn', place)">
      <rect x="0" y="0" :width="addRemoveHeight" :height="addRemoveHeight" fill="white"/>
      <rect :x="halfHeight - halfWidth" y="0" :width="addRemoveWidth" :height="addRemoveHeight" fill="black"/>
      <rect x="0" :y="halfHeight - halfWidth" :width="addRemoveHeight" :height="addRemoveWidth" fill="black"/>
  </g>
  <g v-if="place == 'right'" :transform="'translate(' + (canvasDim.x - canvasMargin - addRemoveHeight) + ', ' + positionY +')'" ref="addRemove" v-on:click="$emit('addCollumn', place)">
    <rect x="0" y="0" :width="addRemoveHeight" :height="addRemoveHeight" fill="white"/>
    <rect :x="halfHeight - halfWidth" y="0" :width="addRemoveWidth" :height="addRemoveHeight" fill="black"/>
    <rect x="0" :y="halfHeight - halfWidth" :width="addRemoveHeight" :height="addRemoveWidth" fill="black"/>
  </g>
  <g v-if="place == 'top'" :transform="'translate(' + (canvasDim.x / 2 - halfHeight) + ', ' + canvasMargin +')'" ref="addRemove" v-on:click="$emit('addBar')">
    <rect x="0" y="0" :width="addRemoveHeight" :height="addRemoveHeight" fill="white"/>
    <rect :x="halfHeight - halfWidth" y="0" :width="addRemoveWidth" :height="addRemoveHeight" fill="black"/>
    <rect x="0" :y="halfHeight - halfWidth" :width="addRemoveHeight" :height="addRemoveWidth" fill="black"/>
  </g>
</template>

<script>
/**
 * The collumn and .
 * @displayName AddRemove Knob
 */
export default {
  name: "AddRemoveKnob",
  props: {
    place: String,
    canvasDim: Object,
  },
  emits: ["addCollumn", "addBar"],
  inject: ["addRemoveHeight", "addRemoveWidth", "canvasMargin"],
  computed: {
    halfHeight () {
      return this.addRemoveHeight / 2;
    },
    halfWidth () {
      return this.addRemoveWidth / 2;
    },
    positionY () {
      return this.canvasDim.y / 2 - this.halfHeight;
    },
    
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.resize-handle {
  fill: white;
  stroke: #5e9fc7; 
}
</style>
