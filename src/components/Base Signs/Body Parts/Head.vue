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
    <text 
      ref="headText" 
      class="draggable actual-sign" 
      style="font-family: 'Times New Roman'; font-size: 1.4em" 
      dominant-baseline="middle"
      :x="signWidth / 2 - textWidth / 4" 
      :y="height / 2.3"
      :signID="id" 
      :class="{active: isSelected}" 
      stroke="black">C</text>
    <!--todo: add a flat pin with the rotation given by the signData.angle-->
  </g>
</template>

<script>


/**
 * The head sign component
 * @displayName Head Sign
 */
export default {
  name: 'HeadSign',
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
    this.textWidth = this.$refs.headText.clientWidth;
    this.textHeight = this.$refs.headText.clientHeight;
  },
  methods: {
    
  },
}
</script>


<style scoped>
</style>