<template>
    <g ref="grid" >
      <g :x="collumnWidth * (index - 1)" y="0" :key="index" v-for="index in (collumnsLeft+collumnsRight)">
        <rect :x="collumnWidth * (index - 1)" :y="(barHeight / beats) * (rect - 1)" :width="collumnWidth" :height="(barHeight / beats)" fill="#fff" :key="rect" v-for="rect in ((bars) * beats)"/>
      </g>
      <!--horizontal lines-->
      <line :x1="collumnWidth * (collumnsLeft - 0.5)" :y1="(barHeight / beats) * (line - 1)" :x2="collumnWidth * (collumnsLeft +  0.5)" :y2="(barHeight / beats) * (line - 1)" :key="line" v-for="line in ((bars) * beats)" stroke-width="2" stroke="black"/>
      <line :x1="collumnWidth * (collumnsLeft - 2)" :y1="barHeight * (line - 1)" :x2="collumnWidth * (collumnsLeft + 2)" :y2="barHeight * (line - 1)" :key="line" v-for="line in (bars + 2)" stroke-width="2" stroke="black"/>
      <line :x1="collumnWidth * (collumnsLeft - 2)" :y1="barHeight * bars + 5" :x2="collumnWidth * (collumnsLeft + 2)" :y2="barHeight * bars + 5" stroke-width="2" stroke="black"/>

      <!--vertical lines-->
      <line :x1="collumnWidth * (collumnsLeft - 2)" y1="0" :x2="collumnWidth * (collumnsLeft - 2)" :y2="fullHeight" stroke-width="2" stroke="black"/>
      <line :x1="collumnWidth * (collumnsLeft)" y1="0" :x2="collumnWidth * (collumnsLeft)" :y2="fullHeight" stroke-width="3" stroke="black"/>
      <line :x1="collumnWidth * (collumnsLeft + 2)" y1="0" :x2="collumnWidth * (collumnsLeft + 2)" :y2="fullHeight" stroke-width="2" stroke="black"/>
    </g>
</template>

<script>
import interact from "interactjs";

/**
 * The generic laban sign component.
 * @displayName Grid
 */
export default {
  name: "Grid",
  inject: ["barHeight", "collumnWidth", "canvasMargin","borderWidth"],
  props: {
    collumnsLeft: Number,
    collumnsRight: Number,
    bars: Number,
    beats: Number,
    fullHeight: Number,
  },
  data() {
    return {
    };
  },
  mounted () {
    interact(this.$refs.grid).on("tap", this.click);
  },
  methods: {
    click () {
      this.$emit("unselect");
    },
    randomColor () {
      return "#" + Math.floor(Math.random()*16777215).toString(16);
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>
