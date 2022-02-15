<template>
    <g class="sign-container" :x="x" :y="y" :data-y="y" :transform="'translate(' + x + ',' + y +')'" ref="sign" :signID="id">
      <component :is="signData.baseType" :id="id" :isSelected="isSelected" :height="height" :signData="signData"/>
      <ResizeHandle :isFirst="true" :isActive="isSelected && canResize" :signHeight="height" :signID="id"/>
      <ResizeHandle :isFirst="false" :isActive="isSelected && canResize" :signHeight="height" :signID="id"/>
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
    x: Number,
    y: Number,
    canResize: Boolean,
    signData: Object
  },
  inject: ["signWidth","borderWidth"],
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

  .dragging rect {
    opacity: 0.5;
    stroke:#5e9fc7;
    z-index: 100;
  }

   .dragging polygon {
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
