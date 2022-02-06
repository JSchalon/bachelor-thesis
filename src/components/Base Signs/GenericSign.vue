<template>
    <g :x="x" :y="y" :data-y="y" :transform="'translate(' + x + ',' + y +')'" ref="GenericSign" :signID="id">
      
      <rect x="0" y="0" :width="signWidth" :height="height" class="draggable actual-sign" :signID="id" :class="{active: isSelected}" :stroke-width="isSelected ? borderWidth + 1: borderWidth">
        
      </rect>
      <text x="10" y="20" class="text" fill="black">{{name}}</text>
      <ResizeHandle :isFirst="true" :isActive="isSelected && canResize" :signHeight="height" :signID="id"/>
      <ResizeHandle :isFirst="false" :isActive="isSelected && canResize" :signHeight="height" :signID="id"/>
    </g>
</template>

<script>
import ResizeHandle from "../ResizeHandle.vue"

/**
 * The generic laban sign component.
 * Signs that can be resized must be wrapped in a group containing the sign, as well as two resize handles
 * Signs must have the "requestlisteners" emit on mounted so that dragging them and clicking on them is possible
 * @displayName Generic Sign
 */
export default {
  name: "GenericSign",
  components: {
    ResizeHandle,
  },
  props: {
    id: Number,
    isSelected: Boolean,
    height: Number,
    x: Number,
    y: Number,
    canResize: Boolean
  },
  inject: ["signWidth","borderWidth"],
  data() {
    return {
      signType: "Generic",
      name: ""
    };
  },
  mounted () {
    this.name= Math.round(Math.random() * 100);
    let sign = this.$refs.GenericSign;
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
  fill: white;
  stroke:rgb(0,0,0);

  touch-action: none;
}

  .draggable.active {
    stroke:#5e9fc7;
  }
</style>
