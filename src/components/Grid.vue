<template>
    <g ref="grid" id="grid">
      <g class="column lasso-able" :id="'grid-column' + (index - 1 - columnsLeft)" :x="columnWidth * (index - 1)" y="0" :key="index" v-for="index in (columnsLeft+columnsRight)">
        <rect
          :class="'beat-rect ba' + (getBar(rect) + 1) + ' ' +  'be' + getBeat(rect)" 
          :x="columnWidth * (index - 1)" 
          :y="(barHeight / beats) * (rect - 1)" 
          :width="columnWidth" :height="(barHeight / beats)" 
          :col="index - 1 - columnsLeft"
          :beat="getBeat(rect)"
          :bar="getBar(rect) + 1"
          :key="rect" 
          v-for="rect in (bars * beats)"/>
        <rect class="fill-rect" :x="columnWidth * (index - 1)" :y="barHeight * bars" :width="columnWidth" :height="startBarOffset" :col="index - 1 - columnsLeft" />
        <rect class="beat-rect ba0 be0" :x="columnWidth * (index - 1)" :y="barHeight * bars + startBarOffset" :width="columnWidth" :height="(barHeight / beats * 2)" bar="0" beat="0" :col="index - 1 - columnsLeft"/>
        <rect class="beat-rect ba-1 be0" :x="columnWidth * (index - 1)" :y="barHeight * bars + startBarOffset + barHeight / 2" :width="columnWidth" :height="(barHeight / beats)" bar="-1" beat="0" :col="index - 1 - columnsLeft"/>
      </g>
      <!--horizontal lines-->
      <!-- beat lines-->
      <line class="grid-line lasso-able" :x1="columnWidth * columnsLeft - beatLineWidth" :y1="(barHeight / beats) * (line - 1)" :x2="columnWidth * columnsLeft + beatLineWidth" :y2="(barHeight / beats) * (line - 1)" :key="line" v-for="line in ((bars) * beats)" stroke-width="2" stroke="black"/>
      <!-- bar lines-->
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft - 2)" :y1="barHeight * (line - 1)" :x2="columnWidth * (columnsLeft + 2)" :y2="barHeight * (line - 1)" :key="line" v-for="line in (bars + 1)" stroke-width="2" stroke="black"/>
      <!-- start bar lines -->
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft - 2)" :y1="barHeight * bars + startBarOffset" :x2="columnWidth * (columnsLeft + 2)" :y2="barHeight * bars + startBarOffset" stroke-width="2" stroke="black"/>
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft - 2)" :y1="barHeight * (bars + .5) + startBarOffset" :x2="columnWidth * (columnsLeft + 2)" :y2="barHeight * (bars + .5) + startBarOffset" stroke-width="2" stroke="black"/>

      <!--vertical lines-->
      <!-- left outer line -->
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft - 2)" y1="0" :x2="columnWidth * (columnsLeft - 2)" :y2="barHeight * (bars + .5) + startBarOffset" stroke-width="2" stroke="black"/>
      <!-- middle line -->
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft)" y1="0" :x2="columnWidth * (columnsLeft)" :y2="barHeight * (bars + .5) + startBarOffset" stroke-width="3" stroke="black"/>
      <!-- right outer line -->
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft + 2)" y1="0" :x2="columnWidth * (columnsLeft + 2)" :y2="barHeight * (bars + .5) + startBarOffset" stroke-width="2" stroke="black"/>
      <g v-if="showHelpLines">
        <!-- help lines left -->
        <line class="grid-line lasso-able help" :x1="columnWidth * (helpLine - 1)" y1="0" :x2="columnWidth * (helpLine - 1)" :y2="barHeight * (bars + .5) + startBarOffset" stroke-width="2" :key="helpLine" v-for="helpLine in (columnsLeft - 2)"/>
        <!-- help lines right -->
        <line class="grid-line lasso-able help" :x1="columnWidth * (columnsLeft + helpLine + 2)" y1="0" :x2="columnWidth * (columnsLeft + helpLine + 2)" :y2="barHeight * (bars + .5) + startBarOffset" stroke-width="2" :key="helpLine" v-for="helpLine in (columnsRight - 2)"/>
      </g>
      <rect :x="lasso.x" :y="lasso.y" :width="lasso.w" :height="lasso.h" fill="#fff" fill-opacity="0" stroke="#5e9fc7" stroke-width="3" stroke-dasharray="5 10" id="lasso-rect"/>
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
  inject: ["barHeight", "columnWidth", "borderWidth", "startBarOffset", "beatLineWidth"],
  emits: ["unselect", "placeSign", "getGridHandles","removeGridHandles", "selectColumn", "selectBar", "lassoSelect"],
  props: {
    bars: Number,
    beats: Number,
    fullHeight: Number,
    contextActive: Boolean,
    signsSelected: Boolean,
    selectedColumn: [Number,Boolean],
    selectedBar: [Number,Boolean]
  },
  data() {
    return {
      barSelected: false,
      colSelected: false,
      lasso: {x: 0, y: 0, startY: 0, startX: 0, w: 0, h: 0},
    };
  },
  computed: {
    /**
     * Calculates the total amount of beats in the score
     */
    totalBeats() {
      return this.beats * this.bars;
    },
    curSign() {
      return this.$store.state["curSign"];
    },
    columnsLeft () {
      return this.$store.state["columnsLeft"] + 1;
    },
    columnsRight () {
      return this.$store.state["columnsRight"] + 1;
    },
    gridDimensions() {
      return {w: (this.columnsLeft + this.columnsRight) * this.columnWidth, h: this.fullHeight};
    },
    showHelpLines(){
      return this.$store.state["showHelpLines"];
    }
  },
  watch: {
    columnsLeft () {
      //if a column is added, the highlighted column has to be changed
      //without a timeout, this does not work properly
      setTimeout(function () {this.colHighlightAfterAddRemove()}.bind(this), 1);
    },
    columnsRight () {
      //if a column is added, the highlighted column has to be changed
      //without a timeout, this does not work properly
      setTimeout(function () {this.colHighlightAfterAddRemove()}.bind(this), 1);
    },
    signsSelected (value) {
      if (value != []) {
        this.highlight();
      }
    },
    bars() {
      //if a column is added/removed, the highlighted column has to be changed
      //without a timeout, this does not work properly
      setTimeout(function () {this.barHighlightAfterAddRemove()}.bind(this), 1);
    }
  },
  mounted () {
    interact(".beat-rect").on("tap", this.click);
    interact(".grid-line").on("tap", this.lineClick);
    interact(".beat-rect").on("doubletap", this.doubleClick);
    interact(".lasso-able").draggable({
      inertia: false,
      autoScroll: false,

      // functions to call on event
      onstart: this.lassoStart,
      onmove: this.lassoScale,
      onend: this.lassoEnd
    }).styleCursor(false);
    this.$refs.grid.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });
  },
  methods: {
    colHighlightAfterAddRemove() {
      if (!(this.selectedColumn === false)) {
        this.highlight();
        if (this.selectedColumn < -this.columnsLeft) {
          this.highlightCol(this.selectedColumn + 1, true);
        } else if (this.selectedColumn > this.columnsRight) {
          
          this.highlightCol(this.selectedColumn - 1, true);
        } else {
          this.highlightCol(this.selectedColumn, true);
        }
      } else {
        this.highlight();
        this.$emit("removeGridHandles")
      }
    },
    barHighlightAfterAddRemove() {
      if (!(this.selectedBar === false)) {
        this.highlight(this.selectedBar);
      } else {
        this.highlight();
        this.$emit("removeGridHandles")
      }
    },
    /**
     * When the grid is clicked -> unselect all signs
     */
    click (event) {
      if (event.button == 2 || event.double || this.contextActive || this.signsSelected) {
        this.$emit("unselect");
        this.$emit("removeGridHandles")
        this.highlight();
      } else if (event.button == 0){
        if (event.target.parentElement.classList.contains("highlighted")) {
          this.highlightCol(parseInt(event.target.getAttribute("col")), false);
        } else {
          this.$emit("removeGridHandles");
          this.$emit("selectColumn", parseInt(event.target.getAttribute("col")));
          this.highlightCol(parseInt(event.target.getAttribute("col")), true);
        }
        if (this.barSelected) {
          this.barSelected = false;
        }
      }
    },
    doubleClick (event) {
      if (event.button == 0) {
        if (this.barSelected) {
          this.highlight();
          this.barSelected = false;
          this.$emit("removeGridHandles");
        } else {
          this.highlightCol(parseInt(event.target.getAttribute("col")), false);
          this.highlight(parseInt(event.target.getAttribute("bar")));
          this.$emit("selectBar", parseInt(event.target.getAttribute("bar")));
          if (parseInt(event.target.getAttribute("bar")) > -1) {
            this.$emit("getGridHandles", {type: "bar", x: event.target.getBoundingClientRect().x, y: event.target.parentElement.querySelector(".beat-rect.ba" + event.target.getAttribute("bar")).getBoundingClientRect().y});
          }
          this.barSelected = true;
        }
      }
    },
    lineClick () {
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
     * Highlights all rects in the specified column
     * @arg column the the column 
     */
    highlightCol (column, highlight) {
      
      let elem = this.$refs.grid.querySelector("#grid-column" + column);
      let isHighlighted = elem.classList.contains("highlighted");
      this.highlight();
      if (highlight) {
        if (!isHighlighted) {
          elem.classList.toggle("highlighted");
          this.$emit("getGridHandles", {type: "col", x: elem.getBoundingClientRect().x, y: elem.getBoundingClientRect().y});
        }
      } else {
        elem.classList.remove("highlighted");
        this.$emit("removeGridHandles");
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
    },
    lassoStart (event) {
      const outerRect = this.$refs.grid.getBoundingClientRect();
      this.lasso.x = Math.round(event.client.x - outerRect.x);
      this.lasso.y = Math.round(event.client.y - outerRect.y);
      this.lasso.startX = Math.round(event.client.x - outerRect.x);
      this.lasso.startY = Math.round(event.client.y - outerRect.y);
    },

    /**
     * The drag-move event listener, moves the sign and the shadow element
     * @arg event the drag-move event
     */
    lassoScale (event) {
      if (event.dx < 0) {
        if (this.lasso.x < this.lasso.startX) {
          this.lasso.x = this.lasso.x + event.dx;
          this.lasso.w = this.lasso.startX - (this.lasso.x);
        } else {
          if (this.lasso.w + event.dx < 0) {
            this.lasso.x = this.lasso.x + event.dx;
            this.lasso.w = this.lasso.startX - (this.lasso.x);
          } else {
            this.lasso.x = this.lasso.startX;
            this.lasso.w = this.lasso.w + event.dx;
          }
        }
      } else if (event.dx > 0) {
        if (this.lasso.x < this.lasso.startX) {
          if (this.lasso.x + event.dx >= this.lasso.startX) {
            this.lasso.x = this.lasso.startX;
            this.lasso.w = event.dx;
          } else {
            this.lasso.x = this.lasso.x + event.dx;
            this.lasso.w = this.lasso.startX - (this.lasso.x);
            if (this.lasso.w < 0) {
              this.lasso.w = 0;
            }
          }
        } else {
          this.lasso.x = this.lasso.startX;
          this.lasso.w = this.lasso.w + event.dx;
        }
      }

      if (event.dy < 0) {
        if (this.lasso.y < this.lasso.startY) {
          this.lasso.y = this.lasso.y + event.dy;
          this.lasso.h = this.lasso.startY - (this.lasso.y);
        } else {
          if (this.lasso.h + event.dy < 0) {
            this.lasso.y = this.lasso.y + event.dy;
            this.lasso.h = this.lasso.startY - (this.lasso.y);
          } else {
            this.lasso.y = this.lasso.startY;
            this.lasso.h = this.lasso.h + event.dy;
          }
        }
      } else if (event.dy > 0) {
        if (this.lasso.y < this.lasso.startY) {
          if (this.lasso.y + event.dy >= this.lasso.startY) {
            this.lasso.y = this.lasso.startY;
            this.lasso.h = event.dy;
          } else {
            this.lasso.y = this.lasso.y + event.dy;
            this.lasso.h = this.lasso.startY - (this.lasso.y);
            //console.log((this.lasso.y + event.dx) + " " + this.lasso.startY);
            if (this.lasso.h < 0) {
              this.lasso.h = 0;
            }
          }
        } else {
          this.lasso.y = this.lasso.startY;
            this.lasso.h = this.lasso.h + event.dy;
        }
      }
    },
    
    /**
     * The drag-end event listener, places the sign at the proper position and removes the shadow
     * @arg event the drag-move event
     */
    lassoEnd () {
      this.$emit("lassoSelect", {x: this.lasso.x, y: this.lasso.y, w: this.lasso.w, h: this.lasso.h});
      this.lasso = {x: 0, y: 0, startY: 0, startX: 0, w: 0, h: 0};
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .help {
    stroke-dasharray: 5,5;
    stroke: #c1c1c1;
  }
  .column {
    fill: white;
  }

  .highlighted {
    fill: #ecbc1e;
  }
</style>
