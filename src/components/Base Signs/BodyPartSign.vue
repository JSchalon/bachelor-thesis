<template>
  <g :transform="'translate(0,' + (height - 40) + ')'">
    <rect x="0" y="0" width="40" height="40" opacity="0" :signID="id" />
    <component :is="signData.signType" :id="id" :isSelected="isSelected" :height="height" :signData="signData" />
  </g>
</template>

<script>


/**
 * The general body part Sign component
 * @displayName Body Part Sign
 */
export default {
  name: 'BodyPartSign',
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