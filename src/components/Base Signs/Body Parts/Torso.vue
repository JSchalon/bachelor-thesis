<template>
  <g>
    <rect 
      class="draggable actual-sign" 
      stroke="black" 
      :x="signWidth / 6" 
      :y="0" 
      :width="signWidth / 1.5" 
      :height="40"
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"
    />
    <circle 
      class="draggable actual-sign" 
      stroke="black" 
      :cx="signWidth / 2" 
      :cy="signWidth / 2 - 10" 
      r="7"
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id">
    </circle>
    <circle 
      class="draggable actual-sign" 
      stroke="black" 
      fill="black"
      :cx="signWidth / 2" 
      :cy="signWidth / 2 + 10" 
      r="7"
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id">
    </circle>
    <!--todo: add a flat pin with the rotation given by the signData.angle-->
  </g>
</template>

<script>


/**
 * The Torso sign component
 * @displayName Torso Sign
 */
export default {
  name: 'TorsoSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth", "borderWidth", "barHeight"],
  data() {
    return {
      textWidth: 0,
      textHeight: 0,
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