<template>
  <g ref="turnContainer">
    <polygon 
      class="draggable actual-sign" 
      v-if="variation.name== 'Any turn'"
      :class="{active: isSelected}" 
      :points="baseSigns[variation.base].points" 
      :transform="'translate(' + signWidth + ', 0) scale(' + -1 + ', 1)'" stroke="black" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"
    />
    <polygon 
      class="draggable actual-sign" 
      :class="{active: isSelected}" 
      :points="baseSigns[variation.base].points" 
      :transform="transform" stroke="black" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"
    />
    <Pin v-if="signData.definition && signData.definition.baseType == 'Pin'" :isSelected="isSelected" :id="id" :signData="signData.definition" :height="height"/>
    <g :transform="'translate(0, ' + (height / 2 - 25) + ')'" v-else-if="signData.definition && signData.definition.baseType == 'SpaceMeasurementSign'">
      <SpaceMeasurementSign :isSelected="isSelected" :id="id" :signData="signData.definition" :height="50"/>
    </g>
    <circle v-if="signData.holding" :cx="signWidth / 2" :cy="5" r="5" class="draggable actual-sign" :class="{active: isSelected}" stroke="black" :stroke-width="isSelected ? borderWidth + 1: borderWidth" :signID="id"/>
  </g>
</template>

<script>


/**
 * The Turn Sign component
 * @displayName Turn Sign
 */
export default {
  name: 'TurnSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth", "borderWidth", "barHeight"],
  data() {
    return {
      variations: [
        {name: "Any turn", base: 0, transform: []},
        {name: "Left turn", base: 0, transform: []},
        {name: "Right turn", base: 0, transform: ["mirror-y"]},
      ],
    };
  },
  computed: {
    baseSigns () {
      let baseSigns = [
        {name: "left", points: ""},
      ];
      
      let anyPoints = "0,0 " + this.signWidth + "," + (this.beatHeight / 3) + " " + this.signWidth + "," + this.height + " 0," + (this.height - this.beatHeight / 3);
      if (this.signData.holding) {
        anyPoints = "0,10 " + this.signWidth + "," + (this.beatHeight / 3 + 10) + " " + this.signWidth + "," + this.height + " 0," + (this.height - this.beatHeight / 3);
      }
      baseSigns[0].points = anyPoints;

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
        if (this.variation.transform[i] == "mirror-y") {
          scale[0] = -1;
          translate[0] = this.signWidth;
        }
        transformString = "translate(" + translate[0] + ", " +  translate[1] + ") " + "scale(" + scale[0] + ", "+ scale[1] +")";
      }
      
      return transformString;
    },
    variation () {
      return this.variations.find(o => o.name === this.signData.signType);
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