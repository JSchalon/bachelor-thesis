<template>
  <path 
    class="actual-sign draggable"
    stroke="black"
    :d="path"
    :class="{active: isSelected}" 
    :stroke-width="isSelected ? borderWidth + 1: borderWidth"
    :signID="id"
  />
</template>

<script>
/**
 * The Unfolding sign component
 * @displayName Folding Sign
 */
export default {
  name: 'FoldingSign',
  props: {
    isSelected: Boolean,
    id: Number,
    degree: Number,
  },
  inject: ["borderWidth"],
  data() {
    return {
      //path does not change -> placed in data instead of computed
      path: "M 5,40 L 20,0 L 35,40 M 0,30 L 40,30",
    };
  },
}
</script>