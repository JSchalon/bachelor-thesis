<template>
  <g ref="turnContainer">
    <polygon 
      class="draggable actual-sign" 
      v-if="signData.signType== 'any'"
      :class="{active: isSelected}" 
      :points="points" 
      :transform="'translate(' + signWidth + ', 0) scale(' + -1 + ', 1)'" stroke="black" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"
    />
    <polygon 
      class="draggable actual-sign" 
      :class="{active: isSelected}" 
      :points="points" 
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
  computed: {
    /**
     * calculates the points for the sign
     * @returns the polygon points
     */
    points () {
      let points = "0,0 " + this.signWidth + "," + (this.beatHeight / 3) + " " + this.signWidth + "," + this.height + " 0," + (this.height - this.beatHeight / 3);
      if (this.signData.holding) {
        points = "0,10 " + this.signWidth + "," + (this.beatHeight / 3 + 10) + " " + this.signWidth + "," + this.height + " 0," + (this.height - this.beatHeight / 3);
      }

      return points;
    },
    /**
     * calculates the beat height
     * @returns the beat height
     */
    beatHeight () {
      return this.barHeight() / this.$store.state["beatsPerBar"];
    },
    /**
     * calculates the transform depending on the sign type
     * @returns the transform string
     */
    transform() {
      let transformString = "";
      let scale = [1,1];
      let translate = [0,0];
      if (this.signData.signType == "clockwise") {
        scale[0] = -1;
        translate[0] = this.signWidth;
      }
      transformString = "translate(" + translate[0] + ", " +  translate[1] + ") " + "scale(" + scale[0] + ", "+ scale[1] +")";
      
      return transformString;
    },
  },
}
</script>