<template>
    <div id="canvasContainer">
      <svg preserveAspectRatio="xMinYMax meet" ref="canvas" id="canvas" :width="canvasDimensions.x" :height="canvasDimensions.y" fill="white">
        <rect x="0" y="0" :width="canvasDimensions.x" :height="canvasDimensions.y" ref="canvasBG" />
        <g :transform="'translate(' + canvasMarginTopLeft + ', ' + canvasMarginTopLeft +')'" ref="bounding">
          <rect x="0" y="0" :width="canvasDimNoPad.x" :height="canvasDimNoPad.y" />
          <Grid @unselect="selectSign(-1)" :beats="beats" :bars="bars" :collumnsLeft="collumnsLeft" :collumnsRight="collumnsRight" :fullHeight="canvasDimNoPad.y" />
          <component :is="item.signType" @requestListeners="initListeners" :id="index" :isSelected="item.isSelected" :height="item.height" :x="item.x" :y="item.y" :key="index" v-for="(item, index) in signs"/>
        </g>
        <AddRemoveKnob :place="'left'" :canvasDim="canvasDimensions" @addCollumn="addCollumn"/>
        <AddRemoveKnob :place="'right'" :canvasDim="canvasDimensions" @addCollumn="addCollumn"/>
        <AddRemoveKnob :place="'top'" :canvasDim="canvasDimensions" @addBar="addBar"/>
      </svg>
    </div>
</template>

<script>
import GenericSign from "./Base Signs/GenericSign.vue"
import Grid from "./Grid.vue"
import AddRemoveKnob from "./AddRemoveKnob.vue"
import interact from "interactjs";

export default {
  name: 'Score',
  components: {
    GenericSign,
    Grid,
    AddRemoveKnob
  },
  inject: ["signWidth", "barHeight", "collumnWidth", "handleDiam", "canvasMargin", "borderWidth", "addRemoveHeight", "addRemoveWidth"],
  data() {
    return {
      signs: [{isSelected: false, signType: "GenericSign", height: 100, x: 15, y: 0},{isSelected: false, signType: "GenericSign", height: 100, x:95, y: 100}],
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
      return {x: this.collumnWidth * (this.collumnsLeft + this.collumnsRight) + 2 * ( 2 * this.canvasMargin + this.addRemoveHeight), y: this.barHeight * (this.bars + 1) + 2 * (this.canvasMargin + this.addRemoveHeight)};
    },
    canvasDimNoPad () {
      return {x: this.collumnWidth * (this.collumnsLeft + this.collumnsRight), y: this.barHeight * (this.bars + 1)};
    },
    canvasMarginTopLeft () {
      return 2 * this.canvasMargin + this.addRemoveHeight;
    }
  },
  mounted () {
  },
  methods: {
    addCollumn(side) {
      this.$store.dispatch('addCollumn',side);
    },
    removeCollumn(side) {
      this.$store.dispatch('removeCollumn',side);
    },
    addBar() {
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
    placeOnTop (elem) {
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
          move: this.resizeMove,
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
      interact(selector).on("tap", this.click);
    },

    /**
     * The click event listener, fires a selection request to the score component
     * @arg event the click event
     */
    click (event) {
      this.placeOnTop(event.target.parentElement);
      this.selectSign(event.target.getAttribute("signID"));
    },

    /**
     * The resize move event listener, resizes the event target
     * @arg event the resize-move event
     */
    resizeMove (event) {
      //TODO: MAKE RESIZE SNAP TO GRID
      //get the saved x and y data
      let target = event.target;
      const targetID = target.getAttribute("signID");

      let x = (parseFloat(target.getAttribute("data-x")) || 0);
      let y = (parseFloat(target.getAttribute("data-y")) || 0);

      // update the element height (-14 for the handles)
      this.signs[targetID].height = event.rect.height - this.handleDiam * 2;

      // keep the same position when resizing from the top
      y += event.deltaRect.top;

      //set new x and y data
      target.setAttribute("data-x", x);
      target.setAttribute("data-y", y);

      //translate group
      this.signs[targetID].y = this.signs[targetID].y + event.deltaRect.top;
      
    },

    /**
     * The drag-start event listener, sets up the shadow element for the dragging
     * @arg event the drag-start event
     */
    dragStart: function(event) {
      let target = event.target;
      //fire a selection request to the score component for proper styling
      this.selectSign(-1);
      //TODO: MAKE SHADOW BY ADDING TO SIGNS LIST TEMPORARILY BY ADDING ADD/REMOVE FUNCTIONS

      //move element to top of Render
      this.placeOnTop(target);

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

      //get the current position from the x and y chords
      let  x = (this.signs[targetID].x || 0) + event.dx;
      let  y = (this.signs[targetID].y || 0) + event.dy;

      //TODO: GET/SET BLOCKSIZE AUTOMATICALLY FROM SETTINGS 
      const blocksizeX = this.collumnWidth;
      const blocksizeY = this.barHeight / this.beats;
      const collumnOffset = (this.collumnWidth - this.signWidth) / 2;
      let actualx = Math.round(x / blocksizeX) * blocksizeX + collumnOffset;
      let actualy = Math.round(y / blocksizeY) * blocksizeY;

      //check if the current position is above (below in actual browser) a certain point -> snap there
      //if (this.signs[targetID].y >= target.parentElement.clientHeight - 200) {
      //    actualy = target.parentElement.clientHeight - 200;
      //}

        //set new element position
        this.signs[targetID].x = x;
        this.signs[targetID].y = y;

        //set new shadow element position
        shadow.setAttribute("x", actualx);
        shadow.setAttribute("y", actualy);
    },
    
    /**
     * The drag-end event listener, places the sign at the proper position and removes the shadow
     * @arg event the drag-move event
     */
    dragEnd: function(event) {
      let target = event.target;

      const targetID = target.getAttribute("signID");
      this.selectSign(targetID);
      
      target.classList.remove("dragging");

      //get the new x and y chords
      let x = this.signs[targetID].x;
      let y = this.signs[targetID].y;

      //get the blocksize TODO: GET FROM GLOBAL VAR?
      const blocksizeX = this.collumnWidth;
      const blocksizeY = this.barHeight / this.beats;
      const collumnOffset = (this.collumnWidth - this.signWidth) / 2;
      let screenX = Math.round(x / blocksizeX) * blocksizeX + collumnOffset;
      let screenY = Math.round(y / blocksizeY) * blocksizeY;

      this.signs[targetID].x = screenX;
      this.signs[targetID].y = screenY;

      //if (this.signs[targetID].y >= target.parentElement.clientHeight - 200) {
      //    this.signs[targetID].y = target.parentElement.clientHeight - 200;
      //}

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
