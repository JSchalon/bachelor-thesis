<template>
  <path 
    class="actual-sign draggable"
    stroke="black"
    :d="path"
    :class="{active: isSelected}" 
    :stroke-width="isSelected ? borderWidth + 1: borderWidth"
    :signID="id"
  />
  <circle 
    v-if="signData.surface && (signData.surface.includes('outer') || signData.surface.includes('inner'))"
    :cx="22.5" 
    :cy="20" r="3" 
    stroke="black"
    stroke-width="2"
    :fill="signData.surface.includes('outer') ? 'black' : 'white' "/>
</template>

<script>
/**
 * The Hip sign component
 * @displayName Hip Sign
 */
export default {
  name: 'HipSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth","borderWidth"],
  data() {
    return {
      
    };
  },
  computed: {
    path () {
      let path = "M 15,12 L 25, 12 M 25,0 V 40";
      if (this.signData.limb) {
        path = "M 7.5,12 L 17.5, 12 M 17.5,0 V 40 M 27.5,0 V 40";
      }
      if (this.signData.surface) {
        if (this.signData.surface.includes("littleFinger")) {
          path = path + "M 27.5,20 H 32";
        } else if (this.signData.surface.includes("thumb")) {
          path = path + "M 27.5,20 H 35";
        }
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