<template>
  <g>
    <g :transform="'translate(0,' + limbTransform + ')'">
      <rect 
        class="draggable actual-sign" 
        stroke="black" 
        :x="signWidth / 6" 
        :y="signWidth / 6" 
        :width="signWidth / 1.5" 
        :height="signWidth / 1.5"
        :class="{active: isSelected}" 
        :stroke-width="isSelected ? borderWidth + 1: borderWidth"
        :signID="id"
      />
      <text 
        ref="headText" 
        class="draggable actual-sign" 
        style="font-family: 'Times New Roman'; font-size: 1.4em" 
        dominant-baseline="middle"
        :x="(signWidth - textWidth) / 2" 
        :y="(height - textHeight) / 2 + textHeight / 2 + 2"
        :signID="id" 
        :class="{active: isSelected}" 
        stroke="black"
      >
        C
      </text>
    </g>
    <path v-if="limbTransform != 0" class="draggable actual-sign" :class="{active: isSelected}" :stroke-width="isSelected ? borderWidth + 1: borderWidth" stroke="black" :d="'M15,'+ (signWidth / 1.5) + 'V40M25,'+ (signWidth / 1.5) + 'V40'"/>
  </g>
</template>

<script>


/**
 * The head sign component
 * @displayName Head Sign
 */
export default {
  name: 'HeadSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth", "borderWidth"],
  data() {
    return {
      textWidth: 0,
      textHeight: 0,
    };
  },
  computed: {
    limbTransform () {
      if ("limb" in this.signData && this.signData.limb) {
        return -this.signWidth / 6;
      } else { 
        return 0;
      }
    }
  },
  mounted () {
    this.textWidth = this.$refs.headText.getBoundingClientRect().width;
    this.textHeight = this.$refs.headText.getBoundingClientRect().height;
  },
  methods: {
    
  },
}
</script>


<style scoped>
</style>