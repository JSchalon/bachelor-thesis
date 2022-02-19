<template>
  <path 
    stroke="black"
    :d="path"
    :class="{active: isSelected}" 
    :stroke-width="isSelected ? borderWidth + 1: borderWidth"
    :signID="id"
  />
</template>

<script>
/**
 * The Wide sign component
 * @displayName Wide Sign
 */
export default {
  name: 'WideSign',
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
      let path = "M 0,0 L 0,40 L 40,0 L 40,40";
      if (this.degree > 3) {
        path = "M 0,0 L 0,40 L 40,7 M 40,40 L 40,0 L 0,33";
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