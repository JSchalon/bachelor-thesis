<template>
  <g v-if="place == 'left'" :transform="'translate(' + canvasMargin + ', ' + positionY +')'" ref="addRemove">
      <rect :x="halfHeight - halfWidth" y="0" :width="addRemoveWidth" :height="addRemoveHeight" fill="black"/>
      <rect x="0" :y="halfHeight - halfWidth" :width="addRemoveHeight" :height="addRemoveWidth" fill="black"/>
  </g>
  <g v-if="place == 'right'" :transform="'translate(' + (canvasDim.x - canvasMargin - addRemoveHeight) + ', ' + positionY +')'" ref="addRemove">
    <rect :x="halfHeight - halfWidth" y="0" :width="addRemoveWidth" :height="addRemoveHeight" fill="black"/>
    <rect x="0" :y="halfHeight - halfWidth" :width="addRemoveHeight" :height="addRemoveWidth" fill="black"/>
  </g>
  <g v-if="place == 'top'" :transform="'translate(' + (canvasDim.x / 2 - halfHeight) + ', ' + canvasMargin +')'" ref="addRemove">
    <rect :x="halfHeight - halfWidth" y="0" :width="addRemoveWidth" :height="addRemoveHeight" fill="black"/>
    <rect x="0" :y="halfHeight - halfWidth" :width="addRemoveHeight" :height="addRemoveWidth" fill="black"/>
  </g>
</template>

<script>
import interact from "interactjs";

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
  mounted () {
    let elem = this.$refs.addRemove;
    interact(elem).on("tap", this.click);
  },
  methods: {
    click() {
        //this.$store.dispatch('addCollumn',"left");
      if (this.place == "left" || this.place == "right") {
        this.$emit("addCollumn", this.place);
      } else {
        this.$emit("addBar");
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.resize-handle {
  fill: white;
  stroke: #5e9fc7; 
}
</style>
