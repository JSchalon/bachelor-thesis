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
      :stroke-dasharray="signData.signType == 'Near' ? 4 : ''"
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
      :stroke-dasharray="signData.signType == 'Near' ? 4 : ''"
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
    <circle v-if="signData.holding" :cx="width / 2" :cy="5" r="5" :class="{active: isSelected}" stroke="black" :stroke-width="isSelected ? borderWidth + 1: borderWidth" :signID="id"/>
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
  inject: ["signWidth","borderWidth", "barHeight"],
  data() {
    return {
    };
  },
  computed: {
    path () {
      const type = this.signData.signType;
      let path = "";
      if (type == "Touch") {
        path = "M 40,10 Q " + (this.width / 2) + ",40," + (this.width - 40) + ",10";
      } else if (type == "Address") {
        path = "M 40,10 H " + (this.width - 80) + " Q " + (this.width - 60) + ",40," + (this.width - 40) + ",10";
        if (this.signData.addressing == "left") {
          path = "M 40,10 Q 60,40,80,10 H " + (this.width - 40) ;
        } else if (this.signData.addressing == "both") {
          path = " M 40,10 Q 60,40,80,10 H " + (this.width - 80) + " Q " + (this.width - 60) + ",40," + (this.width - 40) + ",10";
        }
      } else if (type == "Near") {
        path = "M 40,10 Q " + (this.width / 2) + ",40," + (this.width - 40) + ",10";
      } else if (type == "Support") {
        path = "M 40,10 L 70, 30 H " + (this.width - 70) + " L " + (this.width - 40) + ",10";
      }
      return path; 
    },
    graspingPath () {
      let path = "M " + (this.width / 2 - 5) + "," + (this.height / 2 - 5) + " l 10,10" + "M " + (this.width / 2 - 5) + "," + (this.height / 2 + 5) + " l 10,-10";  
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