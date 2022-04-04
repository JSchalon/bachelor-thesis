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
    :cx="26" 
    :cy="15" r="3" 
    stroke="black"
    stroke-width="2"
    :fill="signData.surface.includes('outer') ? 'black' : 'white' "/>
</template>

<script>
/**
 * The Hand sign component
 * @displayName Hand Sign
 */
export default {
  name: 'HandSign',
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
      let path = "M 12,15 L 28,0 V 25 M 12,40 L 28,25 M 12,23.3333333332 L 28,8.33333333332 M 12,31.6666666665 L 28,16.6666666665";
      if (this.signData.limb) {
        path = "M 12,15 L 24,5 V 30 M 12,40 L 24,30 M 12,23.3333333332 L 24,13.3333333332 M 12,31.6666666665 L 24,21.6666666665 M 28,0 V 30";
      }
      if (this.signData.surface) {
        if (this.signData.surface.includes("littleFinger")) {
          path = path + "M 28,15 H 32";
        } else if (this.signData.surface.includes("thumb")) {
          path = path + "M 28,15 H 35";
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