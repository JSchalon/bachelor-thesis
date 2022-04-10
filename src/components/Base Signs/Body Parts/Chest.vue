<template>
  <g>
    <rect 
      class="draggable actual-sign" 
      stroke="black" 
      :x="signWidth / 6" 
      :y="signWidth / 6" 
      :width="signWidth / 1.5" 
      :height="signWidth / 1.5"
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"
    />
    <circle 
      class="draggable actual-sign" 
      stroke="black" 
      :cx="signWidth / 2" 
      :cy="signWidth / 2" 
      r="8"
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id">
    </circle>
    <!--todo: add a flat pin with the rotation given by the signData.angle-->
  </g>
</template>

<script>


/**
 * The chest sign component
 * @displayName Chest Sign
 */
export default {
  name: 'ChestSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth", "borderWidth"],
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