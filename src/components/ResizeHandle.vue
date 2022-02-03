<template>
  <circle :cx="signWidth / 2" :cy="isFirst ? 0 : signHeight" :r="handleDiam" class="resize-handle" :class="isFirst ? 'handle-first' : 'handle-second'" :display="isActive ? 'block' : 'none'" :stroke-width="borderWidth + 1" />
</template>

<script>
/**
 * The resize handle component.
 * @displayName Generic Sign
 */
export default {
  name: "ResizeHandle",
  props: {
    isFirst: Boolean,
    isActive: Boolean,
    signHeight: Number,
  },
  inject: ["signWidth", "handleDiam", "borderWidth"],
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.resize-handle {
  fill: white;
  stroke: #5e9fc7; 
}
</style>
