<template>
    <g :signID="id">
      <rect
        x="0"
        y="0"
        class="draggable actual-sign"
        :width="width > 50 ? width : signWidth"
        :height="height"
        :stroke="signData.borderColor"
        :fill="signData.color"
        :signID="id"
        :class="{active: isSelected}"
        :stroke-width="isSelected ? borderWidth + 1: borderWidth">
      </rect>
    </g>
</template>

<script>
/**
 * The generic laban sign component. Used a test sign. Cannot normally be created.
 * - All sign categories must have a corresponding "SignName" + "Context.vue" component that is loaded by the score, that implements the context menu for that category 
 * @displayName Generic Sign
 */
export default {
  name: "GenericSign",
  props: {
    id: Number,
    isSelected: Boolean,
    height: Number,
    signData: Object,
    width: {
      default: 0
    }
  },
  inject: ["signWidth","borderWidth"],
};
</script>

<style scoped>

.draggable {
  fill: var(--selected-lighter);
  stroke-width: 2;
  stroke: black;
  opacity: 0.7;
}
</style>
