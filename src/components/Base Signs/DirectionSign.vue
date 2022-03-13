<template>
  <g>
    <circle v-if="signData.holding" :cx="signWidth / 2" :cy="5" r="5" class="draggable actual-sign" :class="{active: isSelected}" stroke="black" :stroke-width="isSelected ? borderWidth + 1: borderWidth" :signID="id"/>
    <polygon 
      class="draggable actual-sign" 
      :class="{active: isSelected}" 
      :points="baseSigns[variation.base].points" 
      :transform="transform" stroke="black" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"
      :fill="signData.dimension != 'Middle' ? getFill() : 'white'"
    />
    <circle v-if="signData.dimension == 'Middle' && (!signData.definition || signData.definition.signType != 'Middle')" :cx="signWidth / 2" :cy="height / 2" r="4" fill="black"/>
    <Pin v-if="signData.definition" :isSelected="isSelected" :id="id" :signData="signData.definition" :height="height" :inverted="signData.dimension == 'Low'"/>
    <g :transform="'translate(' + getPositionTransform() + ',0)'">
      <Pin v-if="signData.position && signData.position != '---'" :isSelected="isSelected" :id="id" :signData="signData.position == 'Infront' ? {signType: 'Low', degree: 0}:{signType: 'Low', degree: 180}" :height="height"/>
    </g>
    <!-- add aditional stuff to display, like another sign or smth-->
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
  inject: ["signWidth","borderWidth", "barHeight"],
  data() {
    return {
      variations: [
        {name: "Left forward direction", base: 1, transform: []},
        {name: "Forward direction left", base: 0, transform: []},
        {name: "Forward direction right", base: 0, transform: ["mirror-y"]},
        {name: "Right forward direction", base: 1, transform: ["mirror-y"]},

        {name: "Left direction", base: 2, transform: []},
        {name: "In place", base: 3, transform: []},
        {name: "Right direction", base: 2, transform: ["mirror-y"]},

        {name: "Left backward direction", base: 1, transform: ["mirror-x"]},
        {name: "Backward direction left", base: 0, transform: ["mirror-x"]},
        {name: "Backward direction right", base: 0, transform: ["mirror-x", "mirror-y"]},
        {name: "Right backward direction", base: 1, transform: ["mirror-x", "mirror-y"]},
      ],
    };
  },
  computed: {
    baseSigns () {
      let baseSigns = [
        {name: "straight", points: ""},
        {name: "diagonal", points: ""},
        {name: "sideways", points: ""},
        {name: "place", points: ""},
      ];
      let holdPoint = 0;
      if (this.signData.holding) {
        holdPoint = 10;
      }
      let straigtPoints = 0 + "," + (this.beatHeight / 2) + " " + (this.signWidth / 2) + "," + (this.beatHeight / 2) + " " + (this.signWidth / 2) + "," + holdPoint + " " + this.signWidth + "," + holdPoint + " " + this.signWidth + "," + this.height + " 0," + this.height;
      baseSigns[0].points = straigtPoints;
      let diagonalPoints = "0," + holdPoint + " " + this.signWidth + "," + (this.beatHeight / 3) + " " + this.signWidth + "," + this.height + " 0," + this.height;
      baseSigns[1].points = diagonalPoints;
      let sidewaysPoints = this.signWidth + ","+ holdPoint + " 0," + (this.height / 2) + " " + this.signWidth + "," + this.height;
      baseSigns[2].points = sidewaysPoints;
      let placePoints = "0," + holdPoint + " " + this.signWidth + "," + holdPoint + " " + this.signWidth + "," + this.height + " 0," + this.height;
      baseSigns[3].points = placePoints;

      return baseSigns;
    },
    beatHeight () {
      return this.barHeight / this.$store.state["beatsPerBar"];
    },
    transform() {
      let transformString = "";
      let scale = [1,1];
      let translate = [0,0];
      for (let i = 0; i < this.variation.transform.length; i++) {
        if (this.variation.transform[i] == "mirror-x") {
          scale[1] = -1;
          translate[1] = this.height;
          if (this.signData.holding) {
            translate[1] = translate[1] + 10;
          }
        } else if (this.variation.transform[i] == "mirror-y") {
          scale[0] = -1;
          translate[0] = this.signWidth;
        }
        transformString = "translate(" + translate[0] + ", " +  translate[1] + ") " + "scale(" + scale[0] + ", "+ scale[1] +")";
      }
      
      return transformString;
    },
    variation () {
      let variation = {};
      if (this.signData.signType == "Backward direction" || this.signData.signType == "Forward direction") {
        variation = this.variations.find(o => o.name === this.signData.signType + " " + this.signData.side);
      } else {
        variation = this.variations.find(o => o.name === this.signData.signType);
      }
      return variation;
    }
  },
  mounted () {
    
  },
  methods: {
    getFill () {
      if (this.signData.dimension == "Low") {
        return "black";
      } else if (this.signData.dimension == "High") {
        if (this.signData.signType == "Backward direction" || this.signData.signType == "Forward direction") {
          return "url(#direction-high-" + this.signData.side + ")";
        }
        return "url(#direction-high-left)";
      } else {
        return "white";
      }
    },
    getPositionTransform() {
      if (this.signData.side == "left") {
        return -this.signWidth + 10;
      } else {
        return this.signWidth - 10;
      }
    }
  },
}
</script>


<style scoped>

</style>