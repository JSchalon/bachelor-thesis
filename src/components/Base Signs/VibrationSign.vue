<template>
  <g>
    <rect class="no-save draggable" :x="signWidth / 2 - squiggleAmplitude" y="1" :width="squiggleAmplitude * 2" :height="height - 2" :signID="id"/>
    <path
      :d="makeSquiggle"
      class="draggable actual-sign" 
      stroke="black"
      fill-opacity="0"
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"
    />
    <g :transform="'translate(0,' + (this.height - 20) + ')'">
      <g :transform="'translate(0,' + -22 + ')'">
        <Pin v-if="signData.upperPin" :isSelected="isSelected" :id="id" :signData="signData.upperPin" :height="30"/>
      </g>
      <Pin v-if="signData.lowerPin" :isSelected="isSelected" :id="id" :signData="signData.lowerPin" :height="30"/>
    </g>
  </g>
</template>

<script>


/**
 * The Vibration Sign component
 * @displayName Vibration Sign
 */
export default {
  name: 'VibrationSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth", "borderWidth", "barHeight"],
  data() {
    return {
      
    };
  },
  computed: {
    beatHeight () {
      return this.barHeight / this.$store.state["beatsPerBar"];
    },
    squiggleStep () {
      return this.barHeight / 10;
    },
    squiggleAmplitude () {
      return this.signWidth / 3;
    },
    makeSquiggle() {
      // Adjust step so that there are a whole number of steps along the path
      let height = this.height;
      if (this.signData.upperPin || this.signData.lowerPin) {
        height = this.height - 45;
      }
      let numSteps = Math.round(height / this.squiggleStep);

      let pos = {x: (this.signWidth / 2), y: 0};
      let newPath = "M" + [pos.x, pos.y].join(',');
      let side = -1;
      for (let i=1; i<=numSteps; i++)
      {
        let last = pos;
        pos = {x: (this.signWidth / 2), y: i * height / numSteps};
        
        // The vectorY component from the last to the new point 
        // (ignore x, it stays the same: x1 - x2 = 0 -> x^2 = 0)
        let vectorY = pos.y - last.y;
        let vectorLength = Math.sqrt(vectorY * vectorY);
        // The midway point between the last and new points
        let half = {x: (last.x),
                    y: (last.y + vectorY/2)};
        // The perpendicular vector (y = 0 because vectorX = 0)
        let perpVector = {x: -(this.squiggleAmplitude * vectorY / vectorLength),
                          y: 0};
        // Calculate the control point position
        let controlPoint = {x: (half.x + perpVector.x * side),
                            y: (half.y + perpVector.y * side)};
        newPath = newPath + ("Q" + [controlPoint.x, controlPoint.y, pos.x, pos.y].join(','));
        // Switch the side (for next step)
        side = -side;
      }
      return newPath;
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