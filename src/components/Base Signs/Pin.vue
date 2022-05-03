<template>
  <g>
    <rect :x="signWidth / 2 - 12" :y="(this.height / 2 - 18)" :width="24" :height="30" opacity="0" :signID="id"/>
    <path 
      class="actual-sign draggable"
      :stroke="inverted ? 'white' : 'black'"  
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth" 
      :d="calculateStick.path" 
      :transform="calculateStick.transform" 
      :signID="id"
    />
    <circle 
      :stroke="inverted ? 'white' : 'black'" 
      class="actual-sign draggable" 
       v-if="signData.signType != 'Middle'" 
      :fill="getCircleFill()"
      :cx="signWidth / 2" 
      :cy="height/2" r="5" 
      :signID="id"
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
    />
    <path 
      v-else
      class="actual-sign draggable"
      :stroke="inverted ? 'white' : 'black'" 
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
 * @displayName Relationship Pin
 */
export default {
  name: 'RelationshipPin',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
    inverted: {
      type: Boolean,
      default: false
    }
  },
  inject: ["signWidth","borderWidth"],
  computed: {
    /**
     * calculates the height of a beat
     */
    beatHeight () {
      return this.barHeight() / this.$store.state["beatsPerBar"];
    },
    /**
     * returns the position and angle of the pin bar
     */
    calculateStick () {
      let degree = this.signData.degree;
      let stick = {path: "", transform: ""};
      let path = "M " + (this.signWidth / 2) + "," + (this.height / 2) + " V " + (this.height / 2 - 15);
      
      stick.transform = "rotate(" + (degree % 360) + "," + (this.signWidth / 2) + "," + (this.height / 2) + ")";
      if (degree < 0) {
        if (this.signData.signType != "Middle") { 
           path = "M " + (this.signWidth / 2 - 10) + "," + (this.height / 2) + " H " + (this.signWidth / 2 + 10);
        } else { 
          //middle pin -> change the position of the center bar with the rotation
          path = "M " + (this.signWidth / 2) + "," + (this.height / 2 - 5) + " V " + (this.height / 2 + 5) + 
          "M " + (this.signWidth / 2 - 10) + "," + (this.height / 2) + " H " + (this.signWidth / 2 + 10);
        }
        stick.transform = ""
      }
      stick.path = path;
      return stick;
    },
    /**
     * calculate the horizontal bar
     * @returns the horizontal bar svg path
     */
    calculateHorizontal () {
      let path = "M " + (this.signWidth / 2 - 8) + "," + (this.height / 2) + " H " + (this.signWidth / 2 + 8);
      return path;
    }
  },
  methods: {
    /**
     * calculate the color of the center circle
     * @returns the fill color
     */
    getCircleFill () {
      let value = false;
      if (this.inverted) {
        value = true;
      }
      if (this.signData.signType == 'High') {
        value = !value;
      }
      if (!value) {
        return 'black';
      } else {
        return 'white';
      }
    },
  },
}
</script>
