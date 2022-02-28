<template>
  <g>
    <rect class="no-save draggable" x="0" y="1" opacity="0" :width="signWidth" :height="height - 2" :signID="id"/>
    <rect 
      class="draggable actual-sign" 
      stroke="black" 
      :x="signWidth / 4" 
      :y="height / 2 - signWidth / 4" 
      :width="signWidth / 2" 
      :height="signWidth / 2"
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"
    />
    <g >
      <Pin :id="id" :height="height" :isSelected="isSelected" :signData="pinData" />
    </g>
    <!--todo: add a flat pin with the rotation given by the signData.angle-->
  </g>
</template>

<script>


/**
 * The general room direction Sign component
 * @displayName Room Direction Sign
 */
export default {
  name: 'RoomDirectionSign',
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
    pinData () {
      return {signType: "Middle", degree: this.signData.degree, bgVisible: false};
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