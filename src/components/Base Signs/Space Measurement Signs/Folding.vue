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
 * The Folding sign component
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
  computed: {
    /**
     * returns the svg path for the sign
     */
    path () {
      let path = "M 0,0 L 20,40 L 40,0 M 0,40 L 40,40";
      if (this.degree > 3) { // degree > 3 -> change baseshape
        path = "M 0,0 L 20,40 L 40,0 M 0,40 L 40,40 M 0,10 L 15,40 M 40,10 L 25,40";
      }
      return path;
    },   
  },
}
</script>