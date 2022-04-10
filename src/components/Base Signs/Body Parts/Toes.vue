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
  <g v-if="signData.digit >= 1 && signData.digit <=5" :transform="signData.limb ? '' : 'translate(7.5,0)'">
    <g v-if="signData.joint >= 1 && signData.joint < 4">
      <circle fill="black" :cx="18.5 - (index * 4)" :cy="10 + (signData.digit - 1) * 5" r="2" :key="index" v-for="index of (signData.joint)" :signID="id"/>
    </g>
    <circle v-if="signData.joint === 0" fill="black" :cx="18.5 - 3 * 4" :cy="10 + (signData.digit - 1) * 5" r="2" />
  </g>
</template>

<script>
/**
 * The Toe sign component
 * @displayName Toe Sign
 */
export default {
  name: 'ToesSign',
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
      let path = "M 15,10 L 25,10 M 15,30 L 25,30 M 15,15 L 25,15 M 15,20 L 25,20 M 15,25 L 25,25 M 25,0 V 40";
      if (this.signData.limb) {
        path = "M 7.5,10 L 17.5,10 M 7.5,10 L 17.5,10 M 7.5,30 L 17.5,30 M 7.5,15 L 17.5,15 M 7.5,20 L 17.5,20 M 7.5,25 L 17.5,25 M 17.5,0 V 40 M 27.5,0 V 40";
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