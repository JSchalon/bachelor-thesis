<template>
  <g>
    <rect class="no-save" opacity="0" x="0" y="0" :width="signWidth" :height="height" :signID="id"/>
    <line stroke="black" stroke-width="2" :x1="signWidth / 2" :x2="signWidth / 2" y1="0" :y2="height - signWidth - 10" :signID="id"/>
    <g :transform="'translate(0,' + (height - 40) + ')'">
      <component 
        :is="this.signData.signType"
        :id="id"
        :isSelected="isSelected"
        :degree="signData.degree"
      />
    </g>
    <circle v-if="(signData.degree-1) % 3 > 0" :cx="signWidth / 2" :cy="height - signWidth" r="4" fill="black" :signID="id"/>
    <circle v-if="(signData.degree-1) % 3 > 1" :cx="signWidth / 2" :cy="height" r="4" fill="black" :signID="id"/>
  </g>
</template>

<script>


/**
 * The general space measurement sign component
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
  inject: ["signWidth","borderWidth", "barHeight"],
  data() {
    return {
    };
  },
  computed: {
  
  },
  mounted () {
    
  },
  methods: {
    
  },
}
</script>


<style scoped>

</style>