<template>
  <g>
    <rect :x="signWidth / 2 - 10" :y="(this.height / 2 - 10)" :width="20" :height="20" opacity="0" :signID="id"/>
    <path 
      class="actual-sign draggable"
      stroke="black" 
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth" 
      :d="calculateStick.path" 
      :transform="calculateStick.transform" 
      :signID="id"
    />
    <circle 
      stroke="black" 
      class="actual-sign draggable"
      v-if="signData.signType != 'Middle'" 
      :fill="signData.signType == 'Low' ? 'black' : 'white'"
      :cx="signWidth / 2" 
      :cy="height/2" r="5" 
      :signID="id"
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
    />
    <path 
      v-else 
      class="actual-sign draggable"
      stroke="black" 
      :d="calculateHorizontal" 
      :transform="calculateStick.transform" 
      :signID="id"
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      />
  </g>
</template>

<script>


/**
 * The relationship pin Sign component
 * @displayName Relationship Pin Sign
 */
export default {
  name: 'RelationshipPinSign',
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
    beatHeight () {
      return this.barHeight / this.$store.state["beatsPerBar"];
    },
    calculateStick () {
      let degree = this.signData.degree;
      let stick = {path: "", transform: ""};
      let path = "M " + (this.signWidth / 2) + "," + (this.height / 2) + " V " + (this.height / 2 - this.beatHeight/2);
      
      stick.transform = "rotate(" + (degree % 360) + "," + (this.signWidth / 2) + "," + (this.height / 2) + ")";
      if (degree < 0) {
        if (this.signData.signType != "Middle") {
           path = "M " + (this.signWidth / 2 - 10) + "," + (this.height / 2) + " H " + (this.signWidth / 2 + 10);
        } else {
          path = "M " + (this.signWidth / 2) + "," + (this.height / 2 - 5) + " V " + (this.height / 2 + 5) + 
          "M " + (this.signWidth / 2 - 10) + "," + (this.height / 2) + " H " + (this.signWidth / 2 + 10);
        }
        stick.transform = ""
      }
      stick.path = path;
      return stick;
    },
    calculateHorizontal () {
      let path = "M " + (this.signWidth / 2 - 8) + "," + (this.height / 2) + " H " + (this.signWidth / 2 + 8);

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