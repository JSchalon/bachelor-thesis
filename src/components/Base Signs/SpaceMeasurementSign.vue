<template>
  <g>
    <rect class="no-save" opacity="0" x="0" y="0" :width="signWidth" :height="height" :signID="id"/>
    <line stroke="black" stroke-width="2" :x1="signWidth / 2" :x2="signWidth / 2" y1="0" :y2="height - signWidth - 10" :signID="id"/>
    <g v-if="signData.holding">
      <rect  :x="signWidth / 2 - 5" y="1" :width="10" :height="15" :signID="id"/>
      <circle  :cx="signWidth / 2" :cy="5" r="5" :class="{active: isSelected}" stroke="black" :stroke-width="isSelected ? borderWidth + 1: borderWidth" :signID="id"/>
    </g>
    <g :transform="signData.squish == true ? 'translate(0, 20 ) scale(1,0.5)' : ''">
      <g :transform="'translate(' + getTranslate() + ') scale(0.7)'">
        <g :transform="'translate(0,' + (height - 40) + ') '">
          <component 
            :is="this.signData.signType"
            :id="id"
            :isSelected="isSelected"
            :degree="signData.degree"
          />
        </g>
        <circle v-if="(signData.degree - 1) % 3 > 0" :cx="signWidth / 2" :cy="height - signWidth" r="4" fill="black" :signID="id"/>
        <circle v-if="(signData.degree - 1) % 3 > 1" :cx="signWidth / 2" :cy="height" r="4" fill="black" :signID="id"/>
      </g>
    </g>
  </g>
</template>

<script>
/**
 * The general space measurement sign component. Loads the specific sign with the signdata.SignType.
 * @displayName Space Measurement Sign
 */
export default {
  name: 'SpaceMeasurementSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth","borderWidth"],
  methods: {
    /**
     * Calculates the x and y translation of the sign
     * @returns the translation string
     */
    getTranslate() {
      let xComp = (this.signWidth / 2) * 0.3; 
      let yComp = ((this.height - this.signWidth) + this.signWidth / 2) * 0.3; 
      return xComp + "," + yComp;
    },
  },
}
</script>