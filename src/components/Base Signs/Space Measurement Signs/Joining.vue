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
 * The Joining sign component
 * @displayName Joining Sign
 */
export default {
  name: 'JoiningSign',
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
      let path = "M 10,13.333333333333332 L 0,26.666666666666665 L 40,26.666666666666665 L 30,13.333333333333332";
      if (this.degree > 3) { // degree > 3 -> change baseshape
        path = "M 10,13.333333333333332 L 0,26.666666666666665 L 40,26.666666666666665 L 30,13.333333333333332 M 3,21.666666666666665 L 37,21.666666666666665";
      }
      return path;
    },
  },
}
</script>