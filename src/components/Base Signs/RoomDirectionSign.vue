<template>
  <g>
    <rect class="no-save draggable" x="0" y="1" :width="signWidth" :height="height - 2" :signID="id"/>
    <rect 
      class="draggable actual-sign" 
      stroke="black" 
      :x="signWidth / 4" 
      :y="height / 2 - signWidth / 4" 
      :width="signWidth / 2" 
      :height="signWidth / 2"
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"/>
    <!--todo: add a flat pin with the rotation given by the signData.angle-->
  </g>
</template>

<script>


/**
 * The general Direction Sign component
 * @displayName Direction Sign
 */
export default {
  name: 'DirectionSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth", "borderWidth", "barHeight"],
  data() {
    return {
      
    };
  },
  computed: {
    beatHeight () {
      return this.barHeight / this.$store.state["beatsPerBar"];
    },
    rotationTransform () {
      return true;
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