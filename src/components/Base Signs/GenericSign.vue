<template>
    <g :x="x" :y="y" :transform="'translate(' + x + ',' + y +')'" ref="GenericSign" :signID="id">
      
      <rect x="0" y="0" width="60" :height="height" class="draggable actual-sign" :signID="id" :class="{active: isSelected}">
        
      </rect>
      <text x="0" y="20" class="text" fill="black">{{name}}</text>
      <circle cx="30" cy="0" r="7" class="resize-handle handle-first" :display="isSelected ? 'block' : 'none'" :signID="id"/>
      <circle cx="30" :cy="height" r="7" class="resize-handle handle-second" :display="isSelected ? 'block' : 'none'" :signID="id"/>
    </g>
</template>

<script>
/**
 * The generic laban sign component.
 * @displayName Generic Sign
 */
export default {
  name: "GenericSign",
  props: {
    id: Number,
    isSelected: Boolean,
    height: Number,
    x: Number,
    y: Number,
  },
  data() {
    return {
      signType: "Generic",
      name: ""
    };
  },
  mounted () {
    //TODO: REPLACE IMPLICIT CALLING FOR MYSIGN AND DRAGGABLE WITH REFS
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.dragging {
  touch-action: none;
  overscroll-behavior: none;
  user-select: none;

}

  .dragging > rect {
    opacity: 0.5;
    stroke-width: 4;
    stroke:#5e9fc7;
    z-index: 100;
  }

.draggable {
  fill: white;
  stroke-width: 2;
  stroke:rgb(0,0,0);

  touch-action: none;
}

  .draggable.active {
    stroke-width: 3;
    stroke:#5e9fc7;
  }

.shadow {
  fill: #a42a42;
  stroke-width: 2;
  stroke: rgb(0,0,0);
  
}

.resize-handle {
  stroke: #5e9fc7; 
  stroke-width: 3;
  fill: white;
}
</style>
