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
 * The Neither bent nor streched sign component
 * @displayName Neither Or Sign
 */
export default {
  name: 'NeitherOrSign',
  props: {
    isSelected: Boolean,
    id: Number,
    degree: Number,
  },
  inject: ["signWidth","borderWidth"],
  data() {
    return {
      path: "M 0,0 L 0,40 L 40,0 L 40,40 M 13.333333333333334,13.333333333333336 L 26.666666666666664,26.666666666666664"
    };
  },
  computed: {
  },
  mounted () {
    
  },
  methods: {
    
  },
}
</script>


<style scoped>

</style>