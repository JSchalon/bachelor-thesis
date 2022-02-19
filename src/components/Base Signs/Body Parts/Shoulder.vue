<template>
  <path 
    stroke="black"
    :d="path"
    :class="{active: isSelected}" 
    :stroke-width="isSelected ? borderWidth + 1: borderWidth"
    :signID="id"
  />
  <circle 
    v-if="signData.surface && (signData.surface.includes('outer') || signData.surface.includes('inner'))"
    :cx="24" 
    :cy="20" r="3" 
    stroke="black"
    stroke-width="2"
    :fill="signData.surface.includes('outer') ? 'black' : 'white' "/>
</template>

<script>
/**
 * The Shoulder sign component
 * @displayName Shoulder Sign
 */
export default {
  name: 'ShoulderSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth","borderWidth", "barHeight"],
  data() {
    return {
      
    };
  },
  computed: {
    path () {
      let path = "M 12,15 L 28, 0 V 40";
      if (this.signData.limb) {
        path = path + "M 20,7.5 V 40";
      }
      if (this.signData.surface) {
        if (this.signData.surface.includes("littleFinger")) {
          path = path + "M 28,20 H 32";
        } else if (this.signData.surface.includes("thumb")) {
          path = path + "M 28,20 H 35";
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