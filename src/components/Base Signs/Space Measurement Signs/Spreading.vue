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
 * The spreading sign component
 * @displayName Spreading Sign
 */
export default {
  name: 'SpreadingSign',
  props: {
    isSelected: Boolean,
    id: Number,
    degree: Number,
  },
  inject: ["signWidth","borderWidth", "barHeight"],
  data() {
    return {
    };
  },
  computed: {
    path () {
      let path = "M 0,10 L 10,23.333333333333332 L 30,23.333333333333332 L 40,10";
      if (this.degree > 3) {
        path = "M 0,10 L 10,23.333333333333332 L 30,23.333333333333332 L 40,10 M 6,18.333333333333332 L 34,18.333333333333332";
      }

      return path;
    },
    
  },
  mounted () {
    
  },
  methods: {
    
  },
}
</script>


<style scoped>

</style>