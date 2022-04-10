<template>
  <g :transform="'translate(' + positionX + ', ' + positionY +')'" ref="addRemove" v-on:click="clickEmit">
      <rect x="0" y="0" :width="addRemoveHeight" :height="addRemoveHeight" fill="white"/>
      <rect :x="halfHeight - halfWidth" y="0" :width="addRemoveWidth" :height="addRemoveHeight" fill="black"/>
      <rect x="0" :y="halfHeight - halfWidth" :width="addRemoveHeight" :height="addRemoveWidth" fill="black"/>
  </g>
</template>

<script>
/**
 * The add / remove knob for adding and maybe removing a column or bar
 * @emits addColumn if it is placed left/right
 * @emits addBar if it is placed on top
 * @displayName AddRemove Knob
 */
export default {
  name: "AddRemoveKnob",
  props: {
    place: String,
    canvasDim: Object,
  },
  emits: ["addColumn", "addBar"],
  inject: ["addRemoveHeight", "addRemoveWidth", "innerCanvasMargin", "outerCanvasMargin"],
  computed: {
    /**
     * Calculates the half height of the addRemove Knob
     */
    halfHeight () {
      return this.addRemoveHeight / 2;
    },
    /**
     * Calculates the half width of the addRemove Knob
     */
    halfWidth () {
      return this.addRemoveWidth / 2;
    },
    /**
     * Calculates the y position based on the canvas height prop and the halfheight method, for the placement of the column knobs
     */
    positionY () {
      if (this.place == "top") {
        return this.outerCanvasMargin / 2;
      } else {
        return this.canvasDim.y / 2 - this.halfHeight;
      }
    },
    positionX () {
      if (this.place == "left") {
        return this.outerCanvasMargin;
      } else if (this.place == "right") {
        return this.canvasDim.x - this.outerCanvasMargin - this.addRemoveHeight;
      } else {
        return this.canvasDim.x / 2 - this.halfHeight;
      }
    },
  },
  methods: {
    clickEmit() {
      if (this.place == "top") {
        this.$emit('addBar');
      } else {
         this.$emit('addColumn', this.place);
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.resize-handle {
  fill: white;
  stroke: var(--selected); 
}
</style>
