<template>
  <g :transform="'translate(0,' + (height - 40) + ')'">
    <rect x="0" y="0" width="40" height="40" opacity="0" :signID="id" />
    <g :transform="transform">
      <component :is="signData.signType" :id="id" :isSelected="isSelected" :height="height" :signData="signData" />
    </g>
  </g>
</template>
<script>


/**
 * The general body part Sign component. Loads a body part sign based on the signData.signType
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
  inject: ["signWidth"],
  computed: {
    /**
     * returns the rotation of the sign. If the side is right, the sign is mirrored horizontally 
     */
    transform () {
      if (this.signData.side == "right" && this.signData.signType != "Head") { // rotate if the side is right and the sign is not the head sign
        return 'translate(' + this.signWidth + ',0) scale(-1,1)';
      } else {
        return "";
      }
    }
  },
}
</script>