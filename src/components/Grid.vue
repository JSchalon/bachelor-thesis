<template>
    <g ref="grid" id="grid">
      <g class="collumn" :id="'grid-collumn' + (index - 1 - collumnsLeft)" :x="collumnWidth * (index - 1)" y="0" :key="index" v-for="index in (collumnsLeft+collumnsRight)">
        <rect :class="'beat-rect ba' + (getBar(rect) + 1) + ' ' +  'be' + getBeat(rect)" :x="collumnWidth * (index - 1)" :y="(barHeight / beats) * (rect - 1)" :width="collumnWidth" :height="(barHeight / beats)"  :key="rect" v-for="rect in (bars * beats)"/>
        <rect class="fill-rect" :x="collumnWidth * (index - 1)" :y="barHeight * bars" :width="collumnWidth" :height="startBarOffset" />
        <rect class="beat-rect ba0 be0" :x="collumnWidth * (index - 1)" :y="barHeight * bars + startBarOffset" :width="collumnWidth" :height="(barHeight / beats * 2)" />
      </g>
      <!--horizontal lines-->
      <!-- beat lines-->
      <line :x1="collumnWidth * collumnsLeft - beatLineWidth" :y1="(barHeight / beats) * (line - 1)" :x2="collumnWidth * collumnsLeft + beatLineWidth" :y2="(barHeight / beats) * (line - 1)" :key="line" v-for="line in ((bars) * beats)" stroke-width="2" stroke="black"/>
      <!-- bar lines-->
      <line :x1="collumnWidth * (collumnsLeft - 2)" :y1="barHeight * (line - 1)" :x2="collumnWidth * (collumnsLeft + 2)" :y2="barHeight * (line - 1)" :key="line" v-for="line in (bars + 1)" stroke-width="2" stroke="black"/>
      <!-- start bar lines -->
      <line :x1="collumnWidth * (collumnsLeft - 2)" :y1="barHeight * bars + startBarOffset" :x2="collumnWidth * (collumnsLeft + 2)" :y2="barHeight * bars + startBarOffset" stroke-width="2" stroke="black"/>
      <line :x1="collumnWidth * (collumnsLeft - 2)" :y1="barHeight * (bars + .5) + startBarOffset" :x2="collumnWidth * (collumnsLeft + 2)" :y2="barHeight * (bars + .5) + startBarOffset" stroke-width="2" stroke="black"/>

      <!--vertical lines-->
      <!-- left outer line -->
      <line :x1="collumnWidth * (collumnsLeft - 2)" y1="0" :x2="collumnWidth * (collumnsLeft - 2)" :y2="barHeight * (bars + .5) + startBarOffset" stroke-width="2" stroke="black"/>
      <!-- middle line -->
      <line :x1="collumnWidth * (collumnsLeft)" y1="0" :x2="collumnWidth * (collumnsLeft)" :y2="barHeight * (bars + .5) + startBarOffset" stroke-width="3" stroke="black"/>
      <!-- right outer line -->
      <line :x1="collumnWidth * (collumnsLeft + 2)" y1="0" :x2="collumnWidth * (collumnsLeft + 2)" :y2="barHeight * (bars + .5) + startBarOffset" stroke-width="2" stroke="black"/>
      <!-- help lines left -->
      <line class="help" :x1="collumnWidth * (helpLine - 1)" y1="0" :x2="collumnWidth * (helpLine - 1)" :y2="barHeight * (bars + .5) + startBarOffset" stroke-width="2" :key="helpLine" v-for="helpLine in (collumnsLeft - 2)"/>
      <!-- help lines right -->
      <line class="help" :x1="collumnWidth * (collumnsLeft + helpLine + 2)" y1="0" :x2="collumnWidth * (collumnsLeft + helpLine + 2)" :y2="barHeight * (bars + .5) + startBarOffset" stroke-width="2" :key="helpLine" v-for="helpLine in (collumnsRight - 2)"/>
    </g>
</template>

<script>
import interact from "interactjs";
/**
 * The visual grid component
 * @displayName Grid
 */
export default {
  name: "Grid",
  inject: ["barHeight", "collumnWidth", "borderWidth", "startBarOffset", "beatLineWidth"],
  props: {
    collumnsLeft: Number,
    collumnsRight: Number,
    bars: Number,
    beats: Number,
    fullHeight: Number,
    contextActive: Boolean,
  },
  data() {
    return {
      barSelected: false,
    };
  },
  mounted () {
    interact(".beat-rect").on("tap", this.click);
    interact(".beat-rect").on("doubletap", this.doubleClick);
    this.$refs.grid.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });
  },
  methods: {
    /**
     * When the grid is clicked -> unselect all signs
     */
    click (event) {
      if (event.button == 2 || this.contextActive) {
        this.$emit("unselect");
        this.highlight();
      } else if (event.button == 0){
        //collumn select/unselect
        this.highlightCol(event.target.parentElement.id, true);
        if (!event.double && this.barSelected) {
          this.barSelected = false;
          this.highlight();

        }
      }
    },
    doubleClick (event) {
      if (event.button == 0) {
        if (this.barSelected) {
          this.highlight();
          this.barSelected = false;
        } else {
          this.highlightCol(event.target.parentElement.id, false);
          this.highlight(event.target.classList[1].slice(-1));
          this.barSelected = true;
        }
      }
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
    highlightCol (collumn, highlight) {
      let elem = this.$refs.grid.querySelector("#" + collumn);
      let isHighlighted = elem.classList.contains("highlighted");
      this.highlight();
      if (highlight) {
        if (!isHighlighted) {
          elem.classList.toggle("highlighted");
        }
      } else {
        elem.classList.remove("highlighted");
      }
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
        let elems = this.$refs.grid.querySelectorAll(highl);
        for (let el of elems) {
          el.classList.toggle("highlighted");
        }
      } else {
        for (let elem of this.$refs.grid.querySelectorAll(".highlighted")) {
          elem.classList.remove("highlighted");
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
  .collumn {
    fill: white;
  }

  .highlighted {
    fill: #22ee99;
  }
</style>
