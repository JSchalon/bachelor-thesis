<template>
    
    <g :x="x" :y="y" :transform="'translate(' + x + ',' + y +')'" ref="grid">

    </g>
</template>

<script>
/**
 * The generic laban sign component.
 * @displayName Grid
 */
export default {
  name: "Grid",
  props: {
    x: Number,
    y: Number,
    sex: Number
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
