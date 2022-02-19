<template>
  <g>
    <circle 
      v-if="signData.signType == 'BackToNormal'" 
      :cx="signWidth / 2"
      :cy="height / 2" 
      :class="{active: isSelected}"
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"
      r="15" 
      class="draggable actual-sign"
      stroke="black"/>
    <circle 
      v-if="signData.signType == 'BackToNormal'" 
      :cx="signWidth / 2"
      :cy="height / 2" 
      :class="{active: isSelected}"
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"
      r="5" 
      class="draggable actual-sign"
      stroke="black"
      fill="black"
    />
    <path v-else class="draggable actual-sign"
      :d="path"
      :class="{active: isSelected}"
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      stroke="black" x="0" y="0" :width="10" :height="height" :signID="id"
    />
  </g>
</template>

<script>


/**
 * The cancel sign component
 * @displayName Cancel Sign
 */
export default {
  name: 'CancelSign',
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
      let path = 
        "M 0," + (this.height / 2) + " Q " + (this.signWidth * 3 / 8) + "," + (this.height ) + "," + (this.signWidth * 3 / 4) + "," + (this.height / 2) + 
        "M " + (this.signWidth / 4) + "," + (this.height / 2) + " Q " + (this.signWidth * 5 / 8) + "," + 0 + "," + this.signWidth + "," + (this.height / 2);
      console.log(path);
      return path; 
    }
  },
  mounted () {
    
  },
  methods: {
    
  },
}
</script>


<style scoped>

</style>