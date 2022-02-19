<template>
    <g class="sign-container" :class="signData.baseType == 'RelationshipBow' ? 'bow' : 'normal'" :x="x" :y="y" :data-y="y" :transform="'translate(' + x + ',' + y +')'" ref="sign" :signID="id">
      <component :is="signData.baseType" :id="id" :isSelected="isSelected" :height="height" :width="width" :signData="signData"/>
      <ResizeHandle 
        :pos="signData.baseType == 'RelationshipBow' ? 'left' : 'top'" 
        :isActive="isSelected && canResize && signData.resizable" 
        :signHeight="height" 
        :width="signData.baseType == 'RelationshipBow' ? width : signWidth"
        :signID="id"/>
      <ResizeHandle 
        :pos="signData.baseType == 'RelationshipBow' ? 'right' : 'bottom'" 
        :isActive="isSelected && canResize && signData.resizable"
        :signHeight="height"
        :width="signData.baseType == 'RelationshipBow' ? width : signWidth"
        :signID="id"/>
    </g>
</template>

<script>

/**
 * The sign container component.
 * Holds a sign
 * @emits requestListeners at mount, so that the score can implement dragging, resizing, clicking and double clicking
 * @displayName Sign Container
 */
export default {
  name: "SignContainer",
  emits: ["requestListeners"],
  props: {
    id: Number,
    isSelected: Boolean,
    height: Number,
    width: Number,
    x: Number,
    y: Number,
    canResize: Boolean,
    signData: Object
  },
  inject: ["borderWidth", "signWidth"],
  data() {
    return {
      name: ""
    };
  },
  mounted () {
    //give it a random number to differentiate between signs
    this.name= Math.round(Math.random() * 100);
    let sign = this.$refs.sign;
    //request event listeners on the outer group
    this.$emit("requestListeners", sign);
  },
  methods: {
    
  },
  computed: {
  }
};
</script>

<style>

.dragging {
  touch-action: none;
  overscroll-behavior: none;
  user-select: none;

}

  .dragging .draggable {
    opacity: 0.5;
    stroke:#5e9fc7;
    z-index: 100;
  }


.draggable {
  touch-action: none;
}

  .draggable.active {
    stroke:#5e9fc7;
  }
</style>
