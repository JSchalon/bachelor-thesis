<template>
    <g ref="grid" id="grid">
      <g :id="'grid-collumn' + (index - 1)" :x="collumnWidth * (index - 1)" y="0" :key="index" v-for="index in (collumnsLeft+collumnsRight)" fill="white">
        <rect :class="'ba' + getBar(rect) + ' ' +  'be' + getBeat(rect)" :x="collumnWidth * (index - 1)" :y="(barHeight / beats) * (rect - 1)" :width="collumnWidth" :height="(barHeight / beats)"  :key="rect" v-for="rect in (bars * beats)"/>
        <rect :x="collumnWidth * (index - 1)" :y="barHeight * bars + startBarOffset" :width="collumnWidth" :height="(barHeight / beats * 2)" />
      </g>
      <!--horizontal lines-->
      <!-- beat lines-->
      <line :x1="collumnWidth * (collumnsLeft - 0.5)" :y1="(barHeight / beats) * (line - 1)" :x2="collumnWidth * (collumnsLeft +  0.5)" :y2="(barHeight / beats) * (line - 1)" :key="line" v-for="line in ((bars) * beats)" stroke-width="2" stroke="black"/>
      <!-- bar lines-->
      <line :x1="collumnWidth * (collumnsLeft - 2)" :y1="barHeight * (line - 1)" :x2="collumnWidth * (collumnsLeft + 2)" :y2="barHeight * (line - 1)" :key="line" v-for="line in (bars + 1)" stroke-width="2" stroke="black"/>
      <!-- additional start lines -->
      <line :x1="collumnWidth * (collumnsLeft - 2)" :y1="barHeight * bars + startBarOffset" :x2="collumnWidth * (collumnsLeft + 2)" :y2="barHeight * bars + startBarOffset" stroke-width="2" stroke="black"/>
      <line :x1="collumnWidth * (collumnsLeft - 2)" :y1="fullHeight" :x2="collumnWidth * (collumnsLeft + 2)" :y2="fullHeight" stroke-width="2" stroke="black"/>

      <!--vertical lines-->
      <!-- left outer line -->
      <line :x1="collumnWidth * (collumnsLeft - 2)" y1="0" :x2="collumnWidth * (collumnsLeft - 2)" :y2="fullHeight" stroke-width="2" stroke="black"/>
      <!-- middle line -->
      <line :x1="collumnWidth * (collumnsLeft)" y1="0" :x2="collumnWidth * (collumnsLeft)" :y2="fullHeight" stroke-width="3" stroke="black"/>
      <!-- right outer line -->
      <line :x1="collumnWidth * (collumnsLeft + 2)" y1="0" :x2="collumnWidth * (collumnsLeft + 2)" :y2="fullHeight" stroke-width="2" stroke="black"/>
      <!-- help lines left -->
      <line class="help" :x1="collumnWidth * (helpLine - 1)" y1="0" :x2="collumnWidth * (helpLine - 1)" :y2="fullHeight" stroke-width="2" :key="helpLine" v-for="helpLine in (collumnsLeft - 2)"/>
      <!-- help lines right -->
      <line class="help" :x1="collumnWidth * (collumnsLeft + helpLine + 2)" y1="0" :x2="collumnWidth * (collumnsLeft + helpLine + 2)" :y2="fullHeight" stroke-width="2" :key="helpLine" v-for="helpLine in (collumnsRight - 2)"/>
    </g>
</template>

<script>
import interact from "interactjs";
//TODO: simplify the line generation
//TODO: change the collumn and bar naming according to the scheme
//TODO: test snaping via the beat rects
/**
 * The visual grid component
 * @displayName Grid
 */
export default {
  name: "Grid",
  inject: ["barHeight", "collumnWidth", "canvasMargin","borderWidth", "startBarOffset"],
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
    /**
     * When the grid is clicked -> unselect all signs
     */
    click () {
      this.$emit("unselect");
    },
    /**
     * Calculates the bar of a grid rect based on its' index
     * @arg nr the index 
     */
    getBar(nr) {
      return Math.floor(((this.beats * this.bars - nr) / this.beats) % this.bars);
    },
    /**
     * Calculates the beat of a grid rect based on its' index
     * @arg nr the index 
     */
    getBeat(nr) {
      return (this.totalBeats - nr) % this.beats;
    },
    /**
     * Highlights all rects in the specified collumn
     * @arg collumn the the collumn 
     */
    highlightCol (collumn) {
      let elem = this.$refs.grid.querySelector("#grid-collumn" + collumn);
      elem.setAttribute("fill", "red");
    },
    /**
     * Highlights all width the specified beat and or bar
     * @arg bar the bar to highlight, optional
     * @arg beat the bar to highlight, optional
     */
    highlight (bar = -1, beat = -1) {
      let highl = "";
      if (bar >= 0) {
        highl = highl + ".ba" + bar;
      }
      if (beat >= 0) {
        highl = highl + ".be" + beat;
      }
      if (highl != "") {
        console.log(highl);
        let elems = this.$refs.grid.querySelectorAll(highl);
        console.log(elems);
        for (let el of elems) {
          console.log(el);
          el.setAttribute("fill", "red");
        }
      }
    }
  },
  computed: {
    /**
     * Calculates the total amount of beats in the score
     */
    totalBeats() {
      return this.beats * this.bars;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .help {
    stroke-dasharray: 5,5;
    stroke: #c1c1c1;
  }
</style>
