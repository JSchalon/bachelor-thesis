<template>
  <g>
    <rect 
      class="draggable actual-sign"
      :class="{active: isSelected}"
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      opacity="0"
      x="0" 
      y="0" 
      :width="width" 
      :height="height" 
      :signID="id"
    />
    <path
      class="draggable actual-sign"
      :d="path"
      :class="{active: isSelected}"
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      stroke="black" 
      :stroke-dasharray="signData.signType == 'near' ? 4 : ''"
      fill="#ffffff00"
      :signID="id"
    />
    <path
      v-if="signData.passing"
      transform="translate(0, -5)"
      class="draggable actual-sign"
      :d="path"
      :class="{active: isSelected}"
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      stroke="black" 
      :stroke-dasharray="signData.signType == 'near' ? 4 : ''"
      fill="#ffffff00"
      :signID="id"
    />
    <rect
      v-if="signData.grasping"
      :x="(this.width / 2 - 5)"
      :y="(this.height / 2 - 5)"
      :transform="signData.passing ? 'translate(0, -2.5)' : ''"
      width="10"
      height="10"
    />
    <path
      v-if="signData.grasping"
      :transform="signData.passing ? 'translate(0, -2.5)' : ''"
      class="draggable actual-sign"
      :d="graspingPath"
      :class="{active: isSelected}"
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      stroke="black" 
      fill="#ffffff00"
      :signID="id"
    />
    <circle v-if="signData.holding" :cx="width / 2" cy="5" r="5" :class="{active: isSelected}" stroke="black" :stroke-width="isSelected ? borderWidth + 1: borderWidth" :signID="id"/>
  </g>
</template>

<script>
/**
 * The general relationship bow sign component
 * @displayName Relationship Bow Sign
 */
export default {
  name: 'RelationshipBowSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
    width: {
      Number,
      default: 160
    }
  },
  inject: ["borderWidth"],
  computed: {
    /**
     * Calculate the sign shape based on the sign type
     * @returns the svg path for the sign
     */
    path () {
      const type = this.signData.signType;
      let path = "";
      if (type == "touch") {
        path = "M 35,10 Q " + (this.width / 2) + ",40," + (this.width - 35) + ",10";
      } else if (type == "address") {
        //the addressing bow changes depending on which side is adressing
        path = "M 35,10 H " + (this.width - 70) + " Q " + (this.width - 55) + ",40," + (this.width - 35) + ",10";
        if (this.signData.addressing == "left") {
          path = "M 35,10 Q 55,40,70,10 H " + (this.width - 35) ;
        } else if (this.signData.addressing == "both") {
          path = " M 35,10 Q 55,40,70,10 H " + (this.width - 70) + " Q " + (this.width - 55) + ",40," + (this.width - 35) + ",10";
        }
      } else if (type == "near") {
        path = "M 35,10 Q " + (this.width / 2) + ",40," + (this.width - 35) + ",10";
      } else if (type == "support") {
        path = "M 35,10 L 55, 25 H " + (this.width - 55) + " L " + (this.width - 35) + ",10";
      }
      return path; 
    },
    /**
     * calculates the "X" path for the grasping modification
     * @returns the grasping path
     */
    graspingPath () {
      let path = "M " + (this.width / 2 - 5) + "," + (this.height / 2 - 5) + " l 10,10" + "M " + (this.width / 2 - 5) + "," + (this.height / 2 + 5) + " l 10,-10";  
      return path;
    }
  },
}
</script>