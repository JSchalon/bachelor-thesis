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
      <line :id="line == bars + 1 ? 'startbar':''" class="grid-line lasso-able" :x1="columnWidth * (columnsLeft - 2)" :y1="barH * (line - 1)" :x2="columnWidth * (columnsLeft + 2)" :y2="barH * (line - 1)" :key="line" v-for="line in (bars + 1)" stroke-width="2" stroke="black"/>
      <!-- start bar lines -->
      <line id="startbar-lower" class="grid-line lasso-able" :x1="columnWidth * (columnsLeft - 2)" :y1="barH * bars + startBarOffset" :x2="columnWidth * (columnsLeft + 2)" :y2="barH * bars + startBarOffset" stroke-width="2" stroke="black"/>
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft - 2)" :y1="barH * bars + (barH/beats) * 2 + startBarOffset" :x2="columnWidth * (columnsLeft + 2)" :y2="barH * bars + (barH/beats) * 2 + startBarOffset" stroke-width="2" stroke="black"/>

      <!--vertical lines-->
      <!-- left outer line -->
      <line class="grid-line lasso-able" :x1="columnWidth * (columnsLeft - 2)" y1="0" :x2="columnWidth * (columnsLeft - 2)" :y2="barH * bars + (barH/beats) * 2 + startBarOffset" stroke-width="2" stroke="black"/>
      <!-- middle line -->
      <line id="middle-line" class="grid-line lasso-able" :x1="columnWidth * (columnsLeft)" y1="0" :x2="columnWidth * (columnsLeft)" :y2="barH * bars + (barH/beats) * 2 + startBarOffset" stroke-width="3" stroke="black"/>
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
 * @emits unselect requests unselecting all signs
 * @emits getGridHandles requests the activation of the grid handles
 * @emits removeGridHandles requests the deactivation of the grid handles
 * @emits selectColumn request the selection of a column
 * @emits selectBar request the selection of a bar
 * @emits lassoSelect emits the position of the lasso box after dragging
 * @displayName Grid
 */
export default {
  name: "Grid",
  inject: ["barHeight", "columnWidth", "borderWidth", "startBarOffset", "beatLineWidth"],
  emits: ["unselect","getGridHandles","removeGridHandles", "selectColumn", "selectBar", "lassoSelect"],
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
     * @returns the height of a bar
     */
    barH() {
      return this.barHeight();
    },
    /**
     * @returns the total number of beats
     */
    totalBeats() {
      return this.beats * this.bars;
    },
    /**
     * @returns the width and height of the grid
     */
    gridDimensions() {
      return {w: (this.columnsLeft + this.columnsRight) * this.columnWidth, h: this.fullHeight};
    },
    /**
     * @returns the left columns + the room direction sign column
     */
    columnsLeft () {
      return this.$store.state["columnsLeft"] + 1;
    },
    /**
     * @returns the right columns + the path sign column
     */
    columnsRight () {
      return this.$store.state["columnsRight"] + 1;
    },
    // further computed methods load variables from the vuex state
    curSign() {
      return this.$store.state["curSign"];
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
    /**
     * observes the changes in left columns
     */
    columnsLeft () {
      //if a column is added, the highlighted column has to be changed
      //without a timeout, this does not work properly
      setTimeout(function () {this.colHighlightAfterAddRemove()}.bind(this), 1);
    },
    /**
     * observes the changes in right columns
     */
    columnsRight () {
      //if a column is added, the highlighted column has to be changed
      //without a timeout, this does not work properly
      setTimeout(function () {this.colHighlightAfterAddRemove()}.bind(this), 1);
    },
    /**
     * observes the changes in selected signs on the score
     */
    signsSelected (value) {
      // if a sign is selected -> clear the grid selection
      if (value != []) {
        this.highlight();
      }
    },
    /**
     * observes the change in bars
     */
    bars() {
      //if a column is added/removed, the highlighted column has to be changed
      //without a timeout, this does not work properly
      setTimeout(function () {this.barHighlightAfterAddRemove()}.bind(this), 1);
    },
    /**
     * observes changes in the selected column
     */
    selectedColumn(value) {
      if (value === false ) { // no selected column -> unhighlight and remove grid handles
        this.highlight();
        this.$emit("removeGridHandles");
        this.barSelected = false;
        this.colSelected = false;
      }
    },
    /**
     * observes changes in the selected bar
     */
    selectedBar(value) {
      if (value === false ) { // no selected bar -> unhighlight and remove grid handles
        this.highlight();
        this.$emit("removeGridHandles");
        this.barSelected = false;
        this.colSelected = false;
      }
    },
    /**
     * observes the vuex specific grid selection. this is used by the introductions to highlight certain things 
     * and by the sign library when placing a sign
     */
    gridSelection: {
      deep: true,
      handler(value) {
        if (value == []) { // no selection -> unhighlight
          this.highlight();
        } else { 
          this.$emit("removeGridHandles");
          if (value.length == 1 && ('selectBar' in value[0] || 'selectCol' in value[0])) { // if only one bar/col is selected and the grid handles are supposed to be active
            if ("col" in value[0]) { // col is needed to place the grid handles 
              let col = value[0].col;
              if ("selectBar" in value[0] && value[0].selectBar == true && "bar" in value[0]) { // select a bar
                let bar = value[0].bar;
                const parent = this.$refs.grid.querySelector("#grid-column" + col); // parent column is needed to get the position of a "block" in the bar
                // get the position and place the grid handles
                this.$emit("getGridHandles", {type: "bar", x: parent.querySelector(".beat-rect.ba" + bar).getBoundingClientRect().x, y: parent.querySelector(".beat-rect.ba" + bar).getBoundingClientRect().y});
                // highlight the bar
                this.highlight(false, bar);
              } else if ("selectCol" in value[0] && value[0].selectCol == true ) {
                const parent = this.$refs.grid.querySelector("#grid-column" + col);
                // calculate the grid handle position
                this.$emit("getGridHandles", {type: "col", x: parent.getBoundingClientRect().x, y: parent.getBoundingClientRect().y});
                // select the column
                this.highlight(col);
              }
            }
          } else { // multiple blocks
            //unhighlight
            this.highlight();
            // check all elements
            for (const elem of value) {
              let col = false;
              let bar = -2;
              let beat = -1;
              let green = true;
              if ("green" in elem) {
                green = elem.green;
              }
              if ("col" in elem) {
                col = elem.col;
              }
              if ("bar" in elem) {
                bar = elem.bar;
              }
              if ("beat" in elem) {
                beat = elem.beeat;
              }
              // highlight the curent element
              this.highlight(col, bar, beat, true, green);
            }
          }
        }
      }
    }
  },
  mounted () {
    // activate click listeners
    interact(".beat-rect").on("tap", this.click);
    interact(".grid-line").on("tap", this.lineClick);
    //activate lasso interact listeners
    interact(".lasso-able").draggable({
      inertia: false,
      autoScroll: false,

      // functions to call on event
      onstart: this.lassoStart,
      onmove: this.lassoScale,
      onend: this.lassoEnd
    }).styleCursor(false);
    //activate holding interact listeners
    interact(".lasso-able").on('hold',
      function () {
        if (!this.multiselectActive) {
          this.$store.dispatch("toggleMultiSelect");
        }
      }.bind(this)
    );
    //disable touch events, since they break interact events
    for (let elem of document.getElementsByClassName("lasso-able")) {
      ["touchstart", "touchmove", "touchend"].forEach((et) => elem.addEventListener(et, this.ignoreTouch));
    }
  },
  methods: {
    /**
     * changes the selection after a column has been added or removed
     */
    colHighlightAfterAddRemove() {
      if (!(this.selectedColumn === false)) { // selected column
        //unhighlight
        this.highlight();
        // check if current selected column is out of bounds -> pull back into bounds and re-place grid handles 
        if (this.selectedColumn < -this.columnsLeft) {
          this.highlight(this.selectedColumn + 1);
          const newHighlight = this.$refs.grid.querySelector("#grid-column" + (this.selectedColumn + 1));
          this.$emit("getGridHandles", {type: "col", x: newHighlight.getBoundingClientRect().x, y: newHighlight.getBoundingClientRect().y});
        } else if (this.selectedColumn > this.columnsRight) {
          this.highlight(this.selectedColumn - 1);
          const newHighlight = this.$refs.grid.querySelector("#grid-column" + (this.selectedColumn - 1));
          this.$emit("getGridHandles", {type: "col", x: newHighlight.getBoundingClientRect().x, y: newHighlight.getBoundingClientRect().y});
        } else { // selected column still in bounds -> just re-highlight and place grid handles
          this.highlight(this.selectedColumn);
          const newHighlight = this.$refs.grid.querySelector("#grid-column" + this.selectedColumn);
          this.$emit("getGridHandles", {type: "col", x: newHighlight.getBoundingClientRect().x, y: newHighlight.getBoundingClientRect().y});
        }
      } else { // no selected column -> unhighlight and remove handles
        this.highlight();
        this.$emit("removeGridHandles");
      }
    },
    /**
     * changes the selection after a bar has been added or removed
     */
    barHighlightAfterAddRemove() {
      if (!(this.selectedBar === false)) { 
        // highlight new bar
        this.highlight(false, this.selectedBar);
      } else { // no selected bar -> unhighlight and remove handles
        this.highlight();
        this.$emit("removeGridHandles");
      }
    },
    /**
     * click event listener for the grid 
     * @param event the click event
     */
    click (event) {
      if (event.button == 2 || this.contextActive || this.signsSelected) { // rightclick, having signs selected or the context menu open unselects the grid
        this.$emit("unselect");
        this.$emit("removeGridHandles")
        this.highlight();
      } else if (event.button == 0){
        // if no columns or bars are selected -> select the bar of the event target
        if (this.colSelected === false && this.barSelected === false && parseInt(event.target.getAttribute("bar")) > -1) {
          this.$emit("removeGridHandles");
          this.highlight(false, parseInt(event.target.getAttribute("bar")));
          this.barSelected = parseInt(event.target.getAttribute("bar"));
          this.$emit("selectBar", parseInt(event.target.getAttribute("bar")));
          this.$emit("getGridHandles", {type: "bar", x: event.target.getBoundingClientRect().x, y: event.target.parentElement.querySelector(".beat-rect.ba" + event.target.getAttribute("bar")).getBoundingClientRect().y});
        // else if the bar of the event target is selected -> select the column of the target
        } else if (this.colSelected === false && this.barSelected == parseInt(event.target.getAttribute("bar")) && this.barSelected !== false) {
           this.highlight(parseInt(event.target.getAttribute("col")));
           this.colSelected = parseInt(event.target.getAttribute("col"));
           this.$emit("removeGridHandles");
           this.$emit("selectColumn", parseInt(event.target.getAttribute("col")));
           this.$emit("getGridHandles", {type: "col", x: event.target.parentElement.getBoundingClientRect().x, y: event.target.parentElement.getBoundingClientRect().y});
        } else { // unselect all
          this.barSelected = false;
          this.colSelected = false;
          this.highlight();
          this.$emit("removeGridHandles");
        }
      }
    },
    /**
     * grid line click listener
     */
    lineClick () {
      // unselect grid
      this.$emit("unselect");
      this.colSelected = false;
      this.barSelected = false;
    },
    /**
     * Calculates the bar of a grid rect based on its' index
     * @param nr the index 
     */
    getBar(nr) {
      return Math.floor(((this.beats * this.bars - nr) / this.beats) % this.bars);
    },
    /**
     * Calculates the beat of a grid rect based on its index
     * @param nr the index 
     */
    getBeat(nr) {
      return (this.totalBeats - nr) % this.beats;
    },
    /**
     * Highlights all grid elements width the specified beat and or bar
     * @param col the column to highlight, optional
     * @param bar the bar to highlight, optional
     * @param beat the bar to highlight, optional
     * @param multi if true, the selection does not get reset before (allows multi-selection)
     * @param green if true, changes the selection color to green (used when placing a sign)
     */
    highlight (col = false, bar = -2, beat = -1, multi = false, green = false) {
      if (!multi) { // normally reset the selection before reselection
        for (let elem of this.$refs.grid.querySelectorAll(".highlighted")) {
          elem.classList.remove("highlighted");
          elem.classList.remove("green");
        }
      }
      // first checking if a specific bar or beat is selected
      let highl = "";
      if (bar >= -1) {
        highl = highl + ".ba" + bar;
      }
      if (beat >= 0 && this.beats > beat) {
        highl = highl + ".be" + beat;
      }
      if (highl != "") { 
        // highlight based on the bar and beat
        let elems = this.$refs.grid.querySelectorAll(highl);
        if (col !== false && typeof col == "number") { // if col is selected -> further restric selection
          elems = this.$refs.grid.querySelector("#grid-column" + col).querySelectorAll(highl);
        }
        // highlight elements
        for (let el of elems) {
          el.classList.toggle("highlighted");
          if (green) {
            el.classList.toggle("green");
          }
        }
      } else if (col !== false) { // only column selected -> highlight all children of the column group
        let elems = this.$refs.grid.querySelector("#grid-column" + col).children;
        for (let el of elems) {
          el.classList.toggle("highlighted");
          if (green) {
            el.classList.toggle("green");
          }
        }
      } else { // no selection -> unhighlight
        for (let elem of this.$refs.grid.querySelectorAll(".highlighted")) {
          elem.classList.remove("highlighted");
          elem.classList.remove("green");
        }
      }
    },
    /**
     * the start listener for the lasso selection
     * @param event the interact drag-start event 
     */
    lassoStart (event) {
      // get the rectangle
      const outerRect = this.$refs.grid.getBoundingClientRect();
      // offset the starting position by the grid
      this.lasso.x = Math.round(event.client.x - outerRect.x);
      this.lasso.y = Math.round(event.client.y - outerRect.y);
      // set the starting pos for the event
      this.lasso.startX = Math.round(event.client.x - outerRect.x);
      this.lasso.startY = Math.round(event.client.y - outerRect.y);
    },

    /**
     * the move listener for the lasso selection
     * @param event the interact drag-move event 
     */
    lassoScale (event) {

      if (event.dx < 0) { // moving left
        if (this.lasso.x < this.lasso.startX) { // lasso is left of the starting position
          //increase lasso size
          this.lasso.x = this.lasso.x + event.dx;
          this.lasso.w = this.lasso.startX - (this.lasso.x);
        } else { // lasso is right of the starting position
          if (this.lasso.w + event.dx < 0) { // new width would be negative
            // move x left and set width to the starting position 
            this.lasso.x = this.lasso.x + event.dx;
            this.lasso.w = this.lasso.startX - (this.lasso.x);
          } else { // width still positive
            // decrease the width and set the x to the starting position
            this.lasso.x = this.lasso.startX;
            this.lasso.w = this.lasso.w + event.dx;
          }
        }
      } else if (event.dx > 0) { // moving right
        if (this.lasso.x < this.lasso.startX) { // lasso left of the starting position
          if (this.lasso.x + event.dx >= this.lasso.startX) { // lasso would overtake the starting position
            // set the x to the starting position and 
            this.lasso.x = this.lasso.startX;
            this.lasso.w = event.dx;
          } else { // lasso still left of the starting position
            // move lasso x and adjust width
            this.lasso.x = this.lasso.x + event.dx;
            this.lasso.w = this.lasso.startX - (this.lasso.x);
            if (this.lasso.w < 0) { // width sometimes comes out to < 0 -> readjust
              this.lasso.w = 0;
            }
          }
        } else { // lasso right of starting position
          // increase the width
          this.lasso.x = this.lasso.startX;
          this.lasso.w = this.lasso.w + event.dx;
        }
      }

      if (event.dy < 0) { // lasso moving upward
        if (this.lasso.y < this.lasso.startY) { // lasso is above the starting position
          // move y up, adjust height
          this.lasso.y = this.lasso.y + event.dy;
          this.lasso.h = this.lasso.startY - (this.lasso.y);
        } else { // lasso below starting position
          if (this.lasso.h + event.dy < 0) { // lasso height would be negative
            // move y up and adjust width
            this.lasso.y = this.lasso.y + event.dy;
            this.lasso.h = this.lasso.startY - (this.lasso.y);
          } else { // lasso height still above 0
            // keep y at starting position, reduce height
            this.lasso.y = this.lasso.startY;
            this.lasso.h = this.lasso.h + event.dy;
          }
        }
      } else if (event.dy > 0) { // lasso moving down
        if (this.lasso.y < this.lasso.startY) { // lasso above starting position
          if (this.lasso.y + event.dy >= this.lasso.startY) { // lasso would be below starting position
            // set lasso y to starting position, increase height
            this.lasso.y = this.lasso.startY;
            this.lasso.h = event.dy;
          } else { // lasso still above starting position
            // increase y and adjust height
            this.lasso.y = this.lasso.y + event.dy;
            this.lasso.h = this.lasso.startY - (this.lasso.y);
            if (this.lasso.h < 0) { // if lasso height becomes negative -> adjust to 0 
              this.lasso.h = 0;
            }
          }
        } else { // lasso below starting position
          // keep lasso at starting pos, adjust height
          this.lasso.y = this.lasso.startY;
            this.lasso.h = this.lasso.h + event.dy;
        }
      }
    },
    
    /**
     * The drag-end event listener, emits the lasso dimensions to the score
     */
    lassoEnd () {
      this.$emit("lassoSelect", {x: this.lasso.x, y: this.lasso.y, w: this.lasso.w, h: this.lasso.h});
      // reset lasso
      this.lasso = {x: 0, y: 0, startY: 0, startX: 0, w: 0, h: 0};
      if (this.multiselectActive) {
         this.$store.dispatch("toggleMultiSelect");
      }
    },
    /**
     * InteractJS workaround: touch events immediately end resize and drag events -> cancel them before that happens and implement scrolling elsewhere
     * @param event the touch event
     */
    ignoreTouch (event) {
      if (event.cancelable && this.multiselectActive) {
        event.preventDefault();
      } 
    },
  },
};
</script>

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
  .grid-line.tut-highlight {
    stroke: var(--selected-lighter);
    stroke-width: 4;
  }
</style>
