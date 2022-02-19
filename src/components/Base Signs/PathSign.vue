<template>
  <g>
    <rect class="no-save" fill="white" opacity="0" x="0" y="0" :width="signWidth" :height="height" :signID="id"/>
    <path stroke="black" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth" 
      :signID="id" 
      :d=" 'M ' + (signWidth /2) + ', 5 V ' + (height - 5)"
      :isSelected="isSelected"
    />
    <path stroke="black" :stroke-width="isSelected ? borderWidth + 1: borderWidth" :signID="id" :d="pathHead(true)" :isSelected="isSelected"/>
    <path stroke="black" :stroke-width="isSelected ? borderWidth + 1: borderWidth" :signID="id" :d="pathHead(false)" :isSelected="isSelected"/>
      
    <circle v-if="(signData.degree-1) % 3 > 0" :cx="signWidth / 2" :cy="height - signWidth" r="4" fill="black" :signID="id"/>
    <circle v-if="(signData.degree-1) % 3 > 1" :cx="signWidth / 2" :cy="height" r="4" fill="black" :signID="id"/>
  </g>
</template>

<script>


/**
 * The general path sign component
 * @displayName Path Sign
 */
export default {
  name: 'PathSign',
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
    
  },
  mounted () {
    
  },
  methods: {
    pathHead (isTop) {
      let yPos = 5;
      if (!isTop) {
        yPos = this.height - 5;
      }
      let path = "M " + (this.signWidth/2 - 15) +"," + yPos + " H " + (this.signWidth/2 + 15);
      if (this.signData.signType == "Circular") {
        path = "M " + (this.signWidth/2 - 15) +"," + (yPos - 5) + " L " + (this.signWidth/2 + 15) + "," + (yPos + 5);
      } else if (this.signData.signType == "Any") {
        path = 
          "M " + (this.signWidth/2 - 15) +"," + yPos + 
          "Q" + (this.signWidth/2 - 7.5) + "," + (yPos - 10) + "," + (this.signWidth/2) + "," + yPos +
          "Q" + (this.signWidth/2 + 7.5) + "," + (yPos + 10) + "," + (this.signWidth/2 + 15) + "," + yPos;
      } 
      return path; 
    }
  },
}
</script>


<style scoped>

</style>