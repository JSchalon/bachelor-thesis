<template>
    <div id="canvasContainer">
      <div>
        <svg preserveAspectRatio="xMinYMax meet" ref="canvas" id="canvas" :width="canvasDimensions.x" :height="canvasDimensions.y" fill="white">
          <rect x="0" y="0" :width="canvasDimensions.x" :height="canvasDimensions.y" ref="canvasBG" />
          <g :transform="'translate(' + canvasMarginTopLeft + ', ' + canvasMarginTopLeft +')'" ref="bounding">
            <rect x="0" y="0" :width="canvasDimNoPad.x" :height="canvasDimNoPad.y" />
            <Grid @unselect="selectSign(-1)" :beats="beats" :bars="bars" :collumnsLeft="collumnsLeft" :collumnsRight="collumnsRight" :fullHeight="canvasDimNoPad.y" />
            <component :is="item.signType" @requestListeners="initListeners" :id="index" :isSelected="item.isSelected" :canResize="item.canResize" :height="item.height" :x="item.x" :y="item.y" :key="index" v-for="(item, index) in signs"/>
          </g>
          <AddRemoveKnob :place="'left'" :canvasDim="canvasDimensions" @addCollumn="addCollumn"/>
          <AddRemoveKnob :place="'right'" :canvasDim="canvasDimensions" @addCollumn="addCollumn"/>
          <AddRemoveKnob :place="'top'" :canvasDim="canvasDimensions" @addBar="addBar"/>
          <GenericSignContext :signData="{}"/>
        </svg>
      </div>
    </div>
</template>

<script>
import GenericSign from "./Base Signs/GenericSign.vue"
import Grid from "./Grid.vue"
import AddRemoveKnob from "./AddRemoveKnob.vue"
import interact from "interactjs";

//TODO: make space below grid for pre-signs
//TODO: sort methods for better visibility
//TODO: comment all functions
//TODO: MAKE SHADOW STUFF SEPERATE FUNCTIONS

export default {
  name: 'Score',
  components: {
    GenericSign,
    Grid,
    AddRemoveKnob
  },
  inject: ["signWidth", "barHeight", "collumnWidth", "handleDiam", "canvasMargin", "borderWidth", "addRemoveHeight", "startBarOffset"],
  data() {
    return {
      signs: [
        {isSelected: false, signType: "GenericSign", height: 100, side: "left", x: 100, y: 100, col: 2, bar: 2, beat: 1, canResize: true},
        {isSelected: false, signType: "GenericSign", height: 50, side: "left", x: 15, y: 0, col: 1, bar: 2, beat: 4, canResize: true}
      ],
    };
  },
  computed: {
    collumnsLeft () {
      return this.$store.state["collumnsLeft"];
    },
    collumnsRight () {
      return this.$store.state["collumnsRight"];
    },
    bars () {
      return this.$store.state["bars"];
    },
    beats () {
      return this.$store.state["beatsPerBar"];
    },
    minHeight () {
      return this.barHeight / this.beats;
    },
    canvasDimensions () {
      return {x: this.collumnWidth * (this.collumnsLeft + this.collumnsRight) + 2 * ( 2 * this.canvasMargin + this.addRemoveHeight), y: this.barHeight * (this.bars + 0.5) + 2 * (this.canvasMargin + this.addRemoveHeight) + this.startBarOffset};
    },
    canvasDimNoPad () {
      return {x: this.collumnWidth * (this.collumnsLeft + this.collumnsRight), y: this.barHeight * (this.bars + 0.5) + this.startBarOffset};
    },
    canvasMarginTopLeft () {
      return 2 * this.canvasMargin + this.addRemoveHeight;
    }
  },
  mounted () {
    window.addEventListener('keydown', this.logKey);
  },
  methods: {
    logKey(event) {
      //delete sign
      if (event.key == "x" || event.key == "Delete") {
        for (let elem of this.signs) {
          if (elem.isSelected == true) {
            this.removeSign (elem.id);
          }
        }
      }
      //move sign with arrow keys... //TODO: MAKE SEPERATE FUNCTIONS FOR CHANGING BEAT/BAR AND HEIGHT
      if (event.which >= 37 && event.which <= 40) {
        let move = this.getArrowKeyAction (event.which);
        for (let elem of this.signs) {
          if (elem.isSelected == true) {
            if (event.which % 2 == 1) {
              if (elem.col + move.collumn >= 1 && elem.col + move.collumn <= this.collumnsLeft + this.collumnsRight) {
                elem.col = elem.col + move.collumn;
                elem.x = elem.x + move.collumn * this.collumnWidth;
              }
            } else {
              if (move.beat == 1 && elem.y - this.minHeight >= 0) {
                if (elem.beat + move.beat <= this.beats) {
                  if (elem.bar == 0) {
                    elem.beat = 1;
                    elem.bar = 1;
                    elem.y = elem.y - this.minHeight * 2 - this.startBarOffset;
                  } else {
                    elem.beat = elem.beat + move.beat;
                    elem.y = elem.y - this.minHeight;
                  }
                } else {
                  elem.beat = 1;
                  elem.bar = elem.bar + 1;
                  elem.y = elem.y - this.minHeight;
                }
              } else if (move.beat == -1) {
                if (elem.beat + move.beat >= 1) {
                  elem.beat = elem.beat + move.beat;
                  elem.y = elem.y + this.minHeight;
                } else {
                  if (elem.bar == 1) {
                    elem.beat = 1;
                    elem.y = elem.y + elem.height + this.startBarOffset;
                    elem.height = this.minHeight * 2;
                    elem.bar = elem.bar -1;
                  } else if (elem.bar > 1) {
                    elem.beat = this.beats;
                    elem.y = elem.y + this.minHeight;
                    elem.bar = elem.bar -1;
                  }
                }
              }
              console.log("beat: " + elem.beat + " bar: " + elem.bar);
            }
          }
        }
      }
      //undo command listener
      if (event.key == "z" && event.ctrlKey) {
        console.log("undo");
      }
      //redo event listener
      if (event.key == "y" && event.ctrlKey) {
        console.log("redo");
      }
    },
    getArrowKeyAction (keyNr) {
      let beat = 0;
      let collumn = 0;
      if (keyNr == 37) {
        collumn = -1;
      } else if (keyNr == 38) {
        beat = 1;
      } else if (keyNr == 39) {
        collumn = 1;
      } else {
        beat = -1;
      }
      return {beat: beat, collumn: collumn};
    },
    addCollumn(side) {
      if (side == "left") {
        for (let elem of this.signs) {
          elem.x = elem.x + this.collumnWidth;
          elem.col = elem.col + 1;
        }
      }
      this.$store.dispatch('addCollumn',side);
    },
    removeCollumn(side) {
      if (side == "left") {
        for (let elem of this.signs) {
          elem.x = elem.x - this.collumnWidth;
        }
      }
      this.$store.dispatch('removeCollumn',side);
    },
    addBar() {
      for (let elem of this.signs) {
        elem.y = elem.y + this.barHeight;
      }
      this.$store.dispatch('addBar');
    },
    removeBar() {
      this.$store.dispatch('removeBarBar');
    },
    selectSign(id) {
      for (let elem of this.signs) {
        elem.isSelected = false;
      }
      if (id >= 0) {
        this.signs[id].isSelected = true;
      }
    },
    placeSignOnTop (elem) {
      this.$refs.bounding.appendChild(elem);
    },
    addSign (type, height, x, y) {
      const newSign = {isSelected: false, signType: type, height: height, x: x, y: y};
      this.signs.push(newSign);
    },
    removeSign (id) {
      this.signs.splice(id,1);
    },
    initListeners (elem) {
      this.initSignInteraction(elem);
      this.initClick(elem);
      elem.addEventListener("contextmenu", this.bob, false);
      ["touchstart", "touchmove", "touchend"].forEach((et) => elem.addEventListener(et, this.ignoreTouch));
    },
    /**
     * Method for calling the custom sign context menu
     * @arg event the context menu call event
     */
    bob (event) {
      console.log("You've tried to open " + this.name);
      /* TODO: ADD CUSTOM MENU CALLER */
      event.preventDefault();
    },

    /**
     * Inititalizes the dragging and resizing settings and event listeners
     * @arg sign the draggable & resizable element
     */
    initSignInteraction (sign) {
      interact(sign).draggable({
        inertia: false,
        restrict: {
          restriction: "parent",
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        // enable autoScroll
        autoScroll: false,

        // functions to call on 
        onstart: this.dragStart,
        onmove: this.dragMove,
        onend: this.dragEnd
      }).resizable({
        // resize from top and bottom via the handles. no resize -> no handles
        edges: { 
          left: false, 
          right: false,
          bottom: ".handle-second",  
          top: ".handle-first", 
        },
        listeners: {
          start: this.resizeStart,
          move: this.resizeMove,
          end: this.resizeEnd,
        },
        modifiers: [
          // minimum size
          interact.modifiers.restrictSize({
            min: { width: 0, height: this.minHeight + this.handleDiam * 2 }
          }),
          interact.modifiers.restrictEdges({
            outer: "parent",
          })
        ],

        inertia: false
      })
    },

    /**
     * Inititalizes the clicking event listener
     * @arg selector the clickable element
     */
    initClick: function(selector) {
      //TODO: rename to indicate the funcion is for the clicking on signs
      interact(selector).on("tap", this.click);
    },

    /**
     * The click event listener, fires a selection request to the score component
     * @arg event the click event
     */
    click (event) {
      //TODO: rename to indicate the funcion is for the clicking on signs
      if (event.button == 0) {
        
        this.placeSignOnTop(event.target.parentElement);
        this.selectSign(event.target.getAttribute("signID"));
      }
    },
    resizeStart (event) {
      let target = event.target;

      //load svg -> TODO: do via global link or smth in actual editor
      const svgns = "http://www.w3.org/2000/svg";
      //create shadow element to show the effect of the drag on end
      let shadow = document.createElementNS( svgns,"rect" );
      
      //get current element position
      let  x = (parseFloat(target.getAttribute("x")) || 0) + event.dx;
      let  y = (parseFloat(target.getAttribute("y")) || 0) + event.dy;
      //set shadow position to element and give styling
      shadow.setAttributeNS( null,"x",x );
      shadow.setAttributeNS( null,"y",y );
      shadow.setAttribute("width", parseFloat(target.querySelector(".draggable").getAttribute("width")));
      shadow.setAttribute("height", parseFloat(target.querySelector(".draggable").getAttribute("height")));
      shadow.classList.add("shadow");
      shadow.setAttribute("id", "shadow");

      //apply dragging styling to group
      target.classList.add("dragging");

      //insert shadow before sign
      target.parentElement.insertBefore(shadow, target);
    },
    /**
     * The resize move event listener, resizes the event target
     * @arg event the resize-move event
     */
    resizeMove (event) {
      //TODO: MAKE RESIZE IN STARTING POSITION IMPOSSIBLE -> data-y?
      //get the saved x and y data
      let target = event.target;
      const targetID = target.getAttribute("signID");

      let shadow = this.$refs.canvas.querySelector("#shadow");
      let y = (parseFloat(target.getAttribute("data-y")) || 0);

      // keep the same position when resizing from the top
      y += event.deltaRect.top;
      

      const blocksizeY = this.barHeight / this.beats;
      let actualY = Math.round(y / blocksizeY) * blocksizeY;
      let newHeight = this.signs[targetID].height + y - actualY;

      // update the element height (-14 for the handles)
      this.signs[targetID].height = event.rect.height - this.handleDiam * 2;
      //check if the element was resized from the top
      if (event.deltaRect.top != 0) {
        //top handle -> adjust y position to nearest grid position
        
        shadow.setAttribute("y", actualY);

      }

      let actualH = Math.round(newHeight / blocksizeY) * blocksizeY;

      shadow.setAttribute("height", actualH);
      
      //set new y data
      target.setAttribute("data-y", y);
      
      //translate group
      this.signs[targetID].y = this.signs[targetID].y + event.deltaRect.top;
    },
    /**
     * The resize end listener, sets the actual height/position after a resize
     * @arg event the resize-end event
     */
    resizeEnd (event) {
      //TODO: set bar/beat after 
      let target = event.target;
      const targetID = target.getAttribute("signID");

      const blocksizeY = this.barHeight / this.beats;
      let y = this.signs[targetID].y;
      let actualY = Math.round(y / blocksizeY) * blocksizeY;
      
      //check if the element was resized from the top
      if (event.deltaRect.top != 0) {
        //top handle -> adjust y position to nearest grid position
        target.setAttribute("data-y", actualY);
        this.signs[targetID].height += this.signs[targetID].y - actualY;
        this.signs[targetID].y = actualY;
      }
      let height = this.signs[targetID].height;
      let actualH = Math.round(height / blocksizeY) * blocksizeY;
      this.signs[targetID].height = actualH;

      if (actualY == 0 && target.getAttribute("y") != 0) {
        this.signs[targetID].y = 0;
      }
      
      this.$refs.canvas.querySelector("#shadow").remove();
      target.classList.remove("dragging");
     },

    /**
     * The drag-start event listener, sets up the shadow element for the dragging
     * @arg event the drag-start event
     */
    dragStart: function(event) {
      let target = event.target;
      //fire a selection request to the score component for proper styling
      this.selectSign(-1);
      //TODO: MAKE SHADOW BY ADDING TO SIGNS LIST TEMPORARILY BY ADDING ADD/REMOVE FUNCTIONS? or by copying element

      //move element to top of Render
      this.placeSignOnTop(target);

      //load svg -> TODO: do via global link or smth in actual editor
      const svgns = "http://www.w3.org/2000/svg";
      //create shadow element to show the effect of the drag on end
      let shadow = document.createElementNS( svgns,"rect" );
      
      //get current element position
      let  x = (parseFloat(target.getAttribute("x")) || 0) + event.dx;
      let  y = (parseFloat(target.getAttribute("y")) || 0) + event.dy;
      //set shadow position to element and give styling
      shadow.setAttributeNS( null,"x",x );
      shadow.setAttributeNS( null,"y",y );
      shadow.setAttribute("width", parseFloat(target.querySelector(".draggable").getAttribute("width")));
      shadow.setAttribute("height", parseFloat(target.querySelector(".draggable").getAttribute("height")));
      shadow.classList.add("shadow");
      shadow.setAttribute("id", "shadow");

      //apply dragging styling to group
      target.classList.add("dragging");

      //insert shadow before sign
      target.parentElement.insertBefore(shadow, target);
    },

    /**
     * The drag-move event listener, moves the sign and the shadow element
     * @arg event the drag-move event
     */
    dragMove: function(event) {
      this.selectSign(-1);
      let target = event.target;
      const targetID = target.getAttribute("signID");
      let shadow = this.$refs.canvas.querySelector("#shadow");
      shadow.setAttribute("height", parseFloat(target.querySelector(".draggable").getAttribute("height")));

      //get the current position from the x and y chords
      let  x = (this.signs[targetID].x || 0) + event.dx;
      let  y = (this.signs[targetID].y || 0) + event.dy;

      const blocksizeX = this.collumnWidth;
      const blocksizeY = this.barHeight / this.beats;
      const collumnOffset = (this.collumnWidth - this.signWidth) / 2;
      let actualX = Math.round(x / blocksizeX) * blocksizeX + collumnOffset;
      let actualY = Math.round(y / blocksizeY) * blocksizeY;
      //check if the current position is above (below in actual browser) the starting line -> snap there
      if (actualY + target.getBoundingClientRect().height > this.canvasDimNoPad.y - this.barHeight / this.beats * 2 - this.startBarOffset) {
        shadow.setAttribute("height", this.barHeight / this.beats * 2);
        actualY = this.canvasDimNoPad.y - this.barHeight / this.beats * 2;
      }

        //set new element position
        this.signs[targetID].x = x;
        this.signs[targetID].y = y;

        //set new shadow element position
        shadow.setAttribute("x", actualX);
        shadow.setAttribute("y", actualY);
    },
    
    /**
     * The drag-end event listener, places the sign at the proper position and removes the shadow
     * @arg event the drag-move event
     */
    dragEnd: function(event) {
      //TODO: change beat/bar/collumn after drag
      let target = event.target;

      const targetID = target.getAttribute("signID");
      this.selectSign(targetID);
      
      target.classList.remove("dragging");

      //get the new x and y chords
      let x = this.signs[targetID].x;
      let y = this.signs[targetID].y;

      //get the blocksize
      const blocksizeX = this.collumnWidth;
      const blocksizeY = this.barHeight / this.beats;
      const collumnOffset = (this.collumnWidth - this.signWidth) / 2;
      let screenX = Math.round(x / blocksizeX) * blocksizeX + collumnOffset;
      let screenY = Math.round(y / blocksizeY) * blocksizeY;

      //check if the current position is above (below in actual browser) the starting line -> snap there
      if (screenY >= (this.canvasDimNoPad.y - target.getBoundingClientRect().height - this.barHeight / this.beats - this.startBarOffset)) {
        this.signs[targetID].height = this.barHeight / this.beats * 2;
        screenY = this.canvasDimNoPad.y - this.barHeight / this.beats * 2;
        this.signs[targetID].canResize = false;
      } else {
        this.signs[targetID].canResize = true;
      }

      this.signs[targetID].x = screenX;
      this.signs[targetID].y = screenY;
      target.setAttribute("data-y", screenY);

      this.$refs.canvas.querySelector("#shadow").remove();
    },
    /**
     * InteractJS workaround: touch events immediately end resize and drag events -> cancel them before that happens and implement scrolling elsewhere
     * @arg event the drag-move event
     */
    ignoreTouch (event) {
      if (event.cancelable) {
        event.preventDefault();
      } else {
        console.warn(`The following event couldn't be canceled:`);
        console.dir(event);
      }
        
    },
  }
}
</script>

<style>
#canvasContainer {
  width: 100%;
  height: 87vh;
  background-color: #e4e4e4;
  overflow: auto;
}

svg {
  margin: auto auto;
  display: block;
  box-shadow: 0 1px 6px 3px rgba(0, 0, 0, 0.15);
}
.shadow {
  fill: #a42a42;
  stroke-width: 2;
  stroke: rgb(0,0,0);
  
}
</style>
