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
    :fill="signData.surface.includes('outer') ? 'black' : 'white'"
    :signID="id"/>
</template>

<script>
/**
 * The Foot sign component
 * @displayName Foot Sign
 */
export default {
  name: 'FootSign',
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
      let path = "M 15,10 L 25,10 M 15,30 L 25,30 M 15,16.66666666665 L 25,16.66666666665 M 15,23.3333333333 L 25,23.3333333333 M 25,0 V 40";
      if (this.signData.limb) {
        path = "M 7.5,10 L 17.5,10 M 7.5,30 L 17.5,30 M 7.5,16.66666666665 L 17.5,16.66666666665 M 7.5,23.3333333333 L 17.5,23.3333333333 M 17.5,0 V 40 M 27.5,0 V 40";
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