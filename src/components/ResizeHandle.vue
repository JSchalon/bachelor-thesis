<template>
  <circle 
    :cx="getPos.x" 
    :cy="getPos.y" 
    :r="handleDiam"
    class="resize-handle" 
    :class="getClass"
    :display="isActive ? 'block' : 'none'" 
    :stroke-width="borderWidth + 1" 
  />
</template>

<script>
/**
 * The resize handle component used to resize a sign
 * @displayName Resize Handle
 */
export default {
  name: "ResizeHandle",
  props: {
    pos: String,
    isActive: Boolean,
    signHeight: Number,
    width: Number,
  },
  inject: ["handleDiam", "borderWidth"],
  computed: {
    /**
     * calculates the position relative to the sign
     * @returns the x and y position
     */
    getPos () {
      if (this.pos == "top") {
        return{x: this.width / 2, y: 0}
      } else if (this.pos == "bottom") {
        return{x: this.width / 2, y: this.signHeight}
      } else if (this.pos == "left") {
        return{x: 0, y: this.signHeight / 2}
      } else {
        return{x: this.width, y: this.signHeight / 2}
      }
    },
    /**
     * @returns the class of the handle based on if it is top/left or right/bottom
     */
    getClass () {
      if (this.pos == 'top' || this.pos == 'left') {
        return "handle-first";
      } else {
        return "handle-second";
      }
    }
  }
};
</script>

<style scoped>
.resize-handle {
  fill: white;
  stroke: var(--selected); 
}
</style>
