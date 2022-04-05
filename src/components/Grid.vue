<template>
    <g ref="grid" id="grid">
      <g class="column lasso-able" :id="'grid-column' + (index - 1 - columnsLeft)" :x="columnWidth * (index - 1)" y="0" :key="index" v-for="index in (columnsLeft+columnsRight)">
        <rect
          :class="'beat-rect ba' + (getBar(rect) + 1) + ' ' +  'be' + getBeat(rect)" 
          :x="columnWidth * (index - 1)" 
          :y="(barH / beats) * (rect - 1)" 
          :width="columnWidth" :height="(barH / beats)" 
          :col="index - 1 - columnsLeft"
          :beat="getBeat(rect)"
          :bar="getBar(rect) + 1"
          :key="rect" 
          v-for="rect in (bars * beats)"/>
        <rect class="fill-rect" :x="columnWidth * (index - 1)" :y="barH * bars" :width="columnWidth" :height="startBarOffset" :col="index - 1 - columnsLeft" />
        <rect class="beat-rect ba0 be0" :x="columnWidth * (index - 1)" :y="barH * bars + startBarOffset" :width="columnWidth" :height="(barH / beats * 2)" bar="0" beat="0" :col="index - 1 - columnsLeft"/>
        <rect class="beat-rect ba-1 be0" :x="columnWidth * (index - 1)" :y="barH * bars + startBarOffset + (barH/beats) * 2" :width="columnWidth" :height="(barH / beats)" bar="-1" beat="0" :col="index - 1 - columnsLeft"/>
      </g>
      <!--horizontal lines-->
      <!-- beat lines-->
      <line class="grid-line lasso-able" :x1="columnWidth * columnsLeft - beatLineWidth" :y1="(barH / beats) * (line - 1)" :x2="columnWidth * columnsLeft + beatLineWidth" :y2="(barH / beats) * (line - 1)" :key="line" v-for="line in ((bars) * beats)" stroke-width="2" stroke="black"/>
      <!-- bar lines-->
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft - 2)" :y1="barH * (line - 1)" :x2="columnWidth * (columnsLeft + 2)" :y2="barH * (line - 1)" :key="line" v-for="line in (bars + 1)" stroke-width="2" stroke="black"/>
      <!-- start bar lines -->
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft - 2)" :y1="barH * bars + startBarOffset" :x2="columnWidth * (columnsLeft + 2)" :y2="barH * bars + startBarOffset" stroke-width="2" stroke="black"/>
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft - 2)" :y1="barH * bars + (barH/beats) * 2 + startBarOffset" :x2="columnWidth * (columnsLeft + 2)" :y2="barH * bars + (barH/beats) * 2 + startBarOffset" stroke-width="2" stroke="black"/>

      <!--vertical lines-->
      <!-- left outer line -->
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft - 2)" y1="0" :x2="columnWidth * (columnsLeft - 2)" :y2="barH * bars + (barH/beats) * 2 + startBarOffset" stroke-width="2" stroke="black"/>
      <!-- middle line -->
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft)" y1="0" :x2="columnWidth * (columnsLeft)" :y2="barH * bars + (barH/beats) * 2 + startBarOffset" stroke-width="3" stroke="black"/>
      <!-- right outer line -->
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft + 2)" y1="0" :x2="columnWidth * (columnsLeft + 2)" :y2="barH * bars + (barH/beats) * 2 + startBarOffset" stroke-width="2" stroke="black"/>
      <g v-if="showHelpLines">
        <!-- help lines left -->
        <line class="grid-line lasso-able help" :x1="columnWidth * (helpLine - 1)" y1="0" :x2="columnWidth * (helpLine - 1)" :y2="barH * bars + (barH/beats) * 2 + startBarOffset" stroke-width="2" :key="helpLine" v-for="helpLine in (columnsLeft - 2)"/>
        <!-- help lines right -->
        <line class="grid-line lasso-able help" :x1="columnWidth * (columnsLeft + helpLine + 2)" y1="0" :x2="columnWidth * (columnsLeft + helpLine + 2)" :y2="barH * bars + (barH/beats) * 2 + startBarOffset" stroke-width="2" :key="helpLine" v-for="helpLine in (columnsRight - 2)"/>
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
    barH() {
      return this.barHeight();
    },
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
    },
    gridSelection() {
      return this.$store.state["gridSelected"];
    },
    multiselectActive () {
      return this.$store.state["multiselectActive"];
    },
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
    },
    selectedColumn(value) {
      if (value === false ) {
        this.highlight();
        this.$emit("removeGridHandles");
        this.barSelected = false;
        this.colSelected = false;
      }
    },
    selectedBar(value) {
      if (value === false ) {
        this.highlight();
        this.$emit("removeGridHandles");
        this.barSelected = false;
        this.colSelected = false;
      }
    },
    gridSelection: {
      deep: true,
      handler(value) {
        if (value == []) {
          this.highlight();
        } else {
          this.$emit("removeGridHandles");
          if (value.length == 1) {
            if ("col" in value[0]) {
              let col = value[0].col;
              if ("selectBar" in value[0] && value[0].selectBar == true && "bar" in value[0]) {
                let bar = value[0].bar;
                const parent = this.$refs.grid.querySelector("#grid-column" + col);
                this.$emit("getGridHandles", {type: "bar", x: parent.querySelector(".beat-rect.ba" + bar).getBoundingClientRect().x, y: parent.querySelector(".beat-rect.ba" + bar).getBoundingClientRect().y});
                this.highlight(false, bar);
              } else if ("selectCol" in value[0] && value[0].selectCol == true ) {
                const parent = this.$refs.grid.querySelector("#grid-column" + col);
                this.$emit("getGridHandles", {type: "col", x: parent.getBoundingClientRect().x, y: parent.getBoundingClientRect().y});
                this.highlight(col);
              }
            }
          } else {
            this.highlight();
            for (const elem of value) {
              let col = false;
              let bar = -2;
              let beat = -1;
              if ("col" in elem) {
                col = elem.col;
              }
              if ("bar" in elem) {
                bar = elem.bar;
              }
              if ("beat" in elem) {
                beat = elem.beeat;
              }
              this.highlight(col, bar, beat, true, true);
            }
          }
        }
      }
    }
  },
  mounted () {
    interact(".beat-rect").on("tap", this.click);
    interact(".grid-line").on("tap", this.lineClick);
    interact(".lasso-able").draggable({
      inertia: false,
      autoScroll: false,

      // functions to call on event
      onstart: this.lassoStart,
      onmove: this.lassoScale,
      onend: this.lassoEnd
    }).styleCursor(false);
    interact(".lasso-able").on('hold',
      function () {
        if (!this.multiselectActive) {
          this.$store.dispatch("toggleMultiSelect");
        }
      }.bind(this)
    );
    for (let elem of document.getElementsByClassName("lasso-able")) {
      ["touchstart", "touchmove", "touchend"].forEach((et) => elem.addEventListener(et, this.ignoreTouch));
    }
  },
  methods: {
    colHighlightAfterAddRemove() {
      if (!(this.selectedColumn === false)) {
        this.highlight();
        if (this.selectedColumn < -this.columnsLeft) {
          this.highlight(this.selectedColumn + 1);
          const newHighlight = this.$refs.grid.querySelector("#grid-column" + (this.selectedColumn + 1));
          this.$emit("getGridHandles", {type: "col", x: newHighlight.getBoundingClientRect().x, y: newHighlight.getBoundingClientRect().y});
        } else if (this.selectedColumn > this.columnsRight) {
          this.highlight(this.selectedColumn - 1);
          const newHighlight = this.$refs.grid.querySelector("#grid-column" + (this.selectedColumn - 1));
          this.$emit("getGridHandles", {type: "col", x: newHighlight.getBoundingClientRect().x, y: newHighlight.getBoundingClientRect().y});
        } else {
          this.highlight(this.selectedColumn);
          const newHighlight = this.$refs.grid.querySelector("#grid-column" + this.selectedColumn);
          this.$emit("getGridHandles", {type: "col", x: newHighlight.getBoundingClientRect().x, y: newHighlight.getBoundingClientRect().y});
        }
      } else {
        this.highlight();
        this.$emit("removeGridHandles");
      }
    },
    barHighlightAfterAddRemove() {
      if (!(this.selectedBar === false)) {
        this.highlight(false, this.selectedBar);
      } else {
        this.highlight();
        this.$emit("removeGridHandles");
      }
    },
    /**
     * When the grid is clicked -> unselect all signs
     */
    click (event) {
      if (event.button == 2 || this.contextActive || this.signsSelected) {
        this.$emit("unselect");
        this.$emit("removeGridHandles")
        this.highlight();
      } else if (event.button == 0){
        if (this.colSelected === false && this.barSelected === false && parseInt(event.target.getAttribute("bar")) > -1) {
          this.$emit("removeGridHandles");
          this.highlight(false, parseInt(event.target.getAttribute("bar")));
          this.barSelected = parseInt(event.target.getAttribute("bar"));
          this.$emit("selectBar", parseInt(event.target.getAttribute("bar")));
          this.$emit("getGridHandles", {type: "bar", x: event.target.getBoundingClientRect().x, y: event.target.parentElement.querySelector(".beat-rect.ba" + event.target.getAttribute("bar")).getBoundingClientRect().y});
        } else if (this.colSelected === false && this.barSelected == parseInt(event.target.getAttribute("bar")) && this.barSelected !== false) {
           this.highlight(parseInt(event.target.getAttribute("col")));
           this.colSelected = parseInt(event.target.getAttribute("col"));
           this.$emit("removeGridHandles");
           this.$emit("selectColumn", parseInt(event.target.getAttribute("col")));
           this.$emit("getGridHandles", {type: "col", x: event.target.parentElement.getBoundingClientRect().x, y: event.target.parentElement.getBoundingClientRect().y});
        } else {
          this.barSelected = false;
          this.colSelected = false;
          this.highlight();
          this.$emit("removeGridHandles");
        }
      }
    },
    lineClick () {
      this.$emit("unselect");
      this.colSelected = false;
      this.barSelected = false;
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
     * Highlights all width the specified beat and or bar
     * @arg col the column to highlight, optional
     * @arg bar the bar to highlight, optional
     * @arg beat the bar to highlight, optional
     * @arg multi if true, the selection does not get reset before (allows multi-selection)
     * @arg green if true, changes the selection color to green (used when placing a sign)
     */
    highlight (col = false, bar = -2, beat = -1, multi = false, green = false) {
      if (!multi) {
        for (let elem of this.$refs.grid.querySelectorAll(".highlighted")) {
          elem.classList.remove("highlighted");
          elem.classList.remove("green");
        }
      }
      let highl = "";
      if (bar >= -1) {
        highl = highl + ".ba" + bar;
      }
      if (beat >= 0 && this.beats > beat) {
        highl = highl + ".be" + beat;
      }
      if (highl != "") {
        let elems = this.$refs.grid.querySelectorAll(highl);
        if (col !== false && typeof col == "number") {
          elems = this.$refs.grid.querySelector("#grid-column" + col).querySelectorAll(highl);
        }
        for (let el of elems) {
          el.classList.toggle("highlighted");
          if (green) {
            el.classList.toggle("green");
          }
        }
      } else if (col !== false) {
        let elems = this.$refs.grid.querySelector("#grid-column" + col).children;
        for (let el of elems) {
          el.classList.toggle("highlighted");
          if (green) {
            el.classList.toggle("green");
          }
        }
      } else {
        for (let elem of this.$refs.grid.querySelectorAll(".highlighted")) {
          elem.classList.remove("highlighted");
          elem.classList.remove("green");
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
      if (this.multiselectActive) {
         this.$store.dispatch("toggleMultiSelect");
      }
    },
    /**
     * InteractJS workaround: touch events immediately end resize and drag events -> cancel them before that happens and implement scrolling elsewhere
     * @arg event the drag-move event
     */
    ignoreTouch (event) {
      if (event.cancelable && this.multiselectActive) {
        event.preventDefault();
      } 
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .help {
    stroke-dasharray: 5,5;
    stroke: var(--bg-light-less-2);
  }
  .column {
    fill: white;
  }

  .highlighted {
    fill: var(--selected-lighter);
  }

  .highlighted.green {
    fill: var(--add);
  }
</style>
