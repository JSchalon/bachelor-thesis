<template>
    <g :signID="id">
      <rect
        x="0"
        y="0"
        class="draggable actual-sign"
        :width="signWidth"
        :height="height"
        :stroke="signData.borderColor"
        :fill="signData.color"
        :signID="id"
        :class="{active: isSelected}"
        :stroke-width="isSelected ? borderWidth + 1: borderWidth">
      </rect>
      <!--<text x="10" y="20" class="text no-select" fill="black" :signID="id">{{name}}</text>-->
    </g>
</template>

<script>

/**
 * The generic laban sign component.
 * - All sign categories must have a corresponding "SignName" + "Context.vue" component that is loaded by the score, that implements the context menu for that category 
 * @emits requestListeners at mount, so that the score can implement dragging, resizing, clicking and double clicking
 * @displayName Generic Sign
 */
export default {
  name: "GenericSign",
  props: {
    id: Number,
    isSelected: Boolean,
    height: Number,
    signData: Object
  },
  inject: ["signWidth","borderWidth"],
  data() {
    return {
      signType: "Generic",
      name: ""
    };
  },
  mounted () {
    //give it a random number to differentiate between signs
    this.name= Math.round(Math.random() * 100);
  },
  methods: {
    
  },
  computed: {
  }
};
</script>

<style scoped>
</style>
