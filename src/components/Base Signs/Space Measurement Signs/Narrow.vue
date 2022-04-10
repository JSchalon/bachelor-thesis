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
 * The Narrow sign component
 * @displayName Narrow Sign
 */
export default {
  name: 'NarrowSign',
  props: {
    isSelected: Boolean,
    id: Number,
    degree: Number,
  },
  inject: ["signWidth","borderWidth"],
  data() {
    return {
    };
  },
  computed: {
    path () {
      let path = "M 0,0 L 40,40 M 0,40 L 40,0";
      if (this.degree > 3) {
        path = "M 0,5 L 35,40 M 5,0 L 40,35 M 0,35 L 35,0 M 5,40 L 40,5";
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