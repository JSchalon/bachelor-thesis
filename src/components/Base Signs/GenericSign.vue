<template>
    <g :x="x" :y="y" :data-y="y" :transform="'translate(' + x + ',' + y +')'" ref="GenericSign" :signID="id">
      <rect
        x="0"
        y="0"
        class="draggable actual-sign"
        :width="signWidth"
        :height="height"
        :stroke="borderColor"
        :fill="color"
        :signID="id"
        :class="{active: isSelected}"
        :stroke-width="isSelected ? borderWidth + 1: borderWidth">
      </rect>
      <text x="10" y="20" class="text no-select" fill="black" :signID="id">{{name}}</text>
      <ResizeHandle :isFirst="true" :isActive="isSelected && canResize" :signHeight="height" :signID="id"/>
      <ResizeHandle :isFirst="false" :isActive="isSelected && canResize" :signHeight="height" :signID="id"/>
    </g>
</template>

<script>
import ResizeHandle from "../ResizeHandle.vue"

/**
 * The generic laban sign component.
 * - Signs that can be resized must be wrapped in a group containing the sign, as well as two resize handles
 * - All sign categories must have a corresponding "SignName" + "Context.vue" component that is loaded by the score, that implements the context menu for that category 
 * @emits requestListeners at mount, so that the score can implement dragging, resizing, clicking and double clicking
 * @displayName Generic Sign
 */
export default {
  name: "GenericSign",
  components: {
    ResizeHandle,
  },
  emits: ["requestListeners"],
  props: {
    id: Number,
    isSelected: Boolean,
    height: Number,
    x: Number,
    y: Number,
    canResize: Boolean,
    color: String,
    borderColor: String,
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
    let sign = this.$refs.GenericSign;
    //request event listeners on the outer group
    this.$emit("requestListeners", sign);
  },
  methods: {
    
  },
  computed: {
  }
};
</script>

<style scoped>

.dragging {
  touch-action: none;
  overscroll-behavior: none;
  user-select: none;

}

  .dragging > rect {
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
