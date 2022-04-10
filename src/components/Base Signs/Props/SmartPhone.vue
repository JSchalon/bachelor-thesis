<template>
  <g>
    <rect 
      class="draggable actual-sign" 
      stroke="black" 
      :x="signWidth / 6" 
      :y="4" 
      :width="signWidth / 1.5" 
      :height="height - 8"
      :class="{active: isSelected}" 
      :stroke-width="borderWidth"
      :signID="id"
    />
    <rect 
      class="draggable actual-sign" 
      stroke="black" 
      :x="signWidth / 6 + 5" 
      :y="8" 
      :width="signWidth / 1.5 - 10" 
      :height="height - 18"
      :class="{active: isSelected}" 
      :stroke-width="borderWidth"
      :signID="id"
    />
    <circle :cx="this.signWidth / 2" :cy="this.height - 7" r="1.5" fill="black" stroke="black" class="draggable actual-sign"  :class="{active: isSelected}"  />
  </g>
</template>

<script>


/**
 * The smartphone prop component
 * @displayName SmartPhone Prop
 */
export default {
  name: 'SmartPhone',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth", "borderWidth"],
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