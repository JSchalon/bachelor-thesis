<template>
    <div id="canvasContainer">
      <div>
        <svg preserveAspectRatio="xMinYMax meet" ref="canvas" id="canvas" :width="canvasDimensions.x" :height="canvasDimensions.y" fill="white">
          <rect x="0" y="0" :width="canvasDimensions.x" :height="canvasDimensions.y" ref="canvasBG" @click="selectSign(-1)"/>
          <AddRemoveKnob :place="'left'" :canvasDim="canvasDimensions" @addCollumn="addCollumn(-collumnsLeft)"/>
          <AddRemoveKnob :place="'right'" :canvasDim="canvasDimensions" @addCollumn="addCollumn(collumnsRight + 1)"/>
          <AddRemoveKnob :place="'top'" :canvasDim="canvasDimensions" @addBar="addBar(bars + 1)"/>
          <g :transform="'translate(' + canvasMarginLeft + ', ' + canvasMarginTop +')'" ref="bounding">
            <rect x="0" y="0" :width="canvasDimNoPad.x" :height="canvasDimNoPad.y" />
            <Grid @unselect="selectSign(-1)" :beats="beats" :bars="bars" :collumnsLeft="collumnsLeft" :collumnsRight="collumnsRight" :fullHeight="canvasDimNoPad.y" :contextActive="contextActive" :signsSelected="signsSelected" />
            <component
              :is="item.signData.signType"
              @requestListeners="initListeners"
              :id="index"
              :isSelected="item.isSelected"
              :canResize="item.signData.canResize"
              :height="item.height" :x="item.x"
              :y="item.y"
              :borderColor="item.signData.borderColor"
              :color="item.signData.color"
              :key="index"
              v-for="(item, index) in signs"/>
          </g>
        </svg>
        
      </div>
      <GenericSignContext :signData="signs[contextSign].signData" :signIndex="contextSign" :isActive="contextActive" :x="contextPos.x" :y="contextPos.y" @updateSignData="updateSignData" @delete="removeSign"/>
    </div>
</template>

<script>
import interact from "interactjs";

import GenericSign from "./Base Signs/GenericSign.vue"
import Grid from "./Grid.vue"
import AddRemoveKnob from "./AddRemoveKnob.vue"
import GenericSignContext from "./Context Menus/GenericSignContext.vue"

export default {
  name: 'Score',
  components: {
    GenericSign,
    Grid,
    AddRemoveKnob,
    GenericSignContext
  },
  inject: ["signWidth", "barHeight", "collumnWidth", "handleDiam", "innerCanvasMargin", "outerCanvasMargin", "borderWidth", "addRemoveHeight", "startBarOffset",],
  props: {
    signs: Array
  },
  emits: ["editSign"],
  data() {
    return {
      contextActive: false,
      contextPos: {x: 0, y: 0},
      selectedSigns: [],
      contextSign: 0,
      keyCommandsEnabled: true,
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
    blocksizeX () {
      return this.collumnWidth;
    },
    blocksizeY () {
      return this.barHeight / this.beats;
    },
    canvasDimensions () {
      return {
        x: this.collumnWidth * (this.collumnsLeft + this.collumnsRight) + 2 * this.canvasMarginLeft, 
        y: this.barHeight * (this.bars + 0.5) + this.minHeight + this.innerCanvasMargin + this.outerCanvasMargin / 2 + 2 * (this.addRemoveHeight) + this.startBarOffset
      };
    },
    canvasDimNoPad () {
      return {x: this.collumnWidth * (this.collumnsLeft + this.collumnsRight), y: this.barHeight * (this.bars + 0.5) + this.minHeight + this.startBarOffset};
    },
    canvasMarginTop () {
      return this.innerCanvasMargin + this.outerCanvasMargin / 2 + this.addRemoveHeight;
    },
    canvasMarginLeft () {
      return this.innerCanvasMargin + this.outerCanvasMargin + this.addRemoveHeight;
    },
    signsSelected () {
      if (this.selectedSigns.length == 0) {
        return false;
      } else {
        return true;
      }
    }
  },
  mounted () {
    window.addEventListener('keydown', this.keyEvent);
  },
  methods: {
    /**
     * Method for adding a collumn on the chosen side in the vuex state
     * @arg side the side to add a collumn to  
     * @arg beforeIndex the index to insert the new collumn after
     */
    addCollumn(beforeIndex) {
      this.contextActive = false;
      let side = "right";
      if (beforeIndex < 1) {
        side = "left";
      }
      for (let elem of this.signs) {
        if (elem.signData.col >= beforeIndex) {
          this.$emit("editSign", {type: "move", index: this.signs.indexOf(elem), data: {x: (elem.x + this.collumnWidth), y: elem.y}});
        }
      }
      
      this.$store.dispatch('addCollumn',side);
    },
    /**
     * Method for removing a collumn on the chosen side in the vuex state
     * @arg side the side to remove a collumn from
     * @arg col the collumn to remove  
     */
    removeCollumn(side, col) {
      this.contextActive = false;
      if ((side == "left" && this.collumnsLeft == 2) || (side == "right" && this.collumnsRight == 2)) {
        return false;
      }
      let remove = [];
      for (let elem of this.signs) {
        if (elem.signData.col == col) {
          remove.push(this.signs.indexOf(elem));
        }
        if (side == "left") {
          this.$emit("editSign", {type: "move", index: this.signs.indexOf(elem), data: {x: (elem.x - this.collumnWidth), y: elem.y}});
        }
      }
      for (let last = remove.length - 1; last >= 0; last--) {
        this.$emit("editSign", {type: "remove", index: remove[last]});
      }
      this.$store.dispatch('removeCollumn',side);
    },

    /**
     * Method for adding a bar in the vuex state
     * @arg beforeIndex the index to insert the new bar before
     */
    addBar(beforeIndex) {
      this.contextActive = false;
      for (let elem of this.signs) {
        if (elem.signData.bar < beforeIndex) {
          this.$emit("editSign", {type: "move", index: this.signs.indexOf(elem), data: {x: elem.x, y: (elem.y + this.barHeight)}});
        } else {
          this.$emit("editSign", {type: "changeSignData", index: this.signs.indexOf(elem), data: {bar: (elem.signData.bar + 1), beat: elem.signData.beat}});
        }
      }
      this.$store.dispatch('addBar');
    },
    /**
     * Method for removing a bar in the vuex state
     */
    removeBar(bar) {
      //only delete existing bars and always leave at least one bar
      if (this.bars < bar || this.bars == 1) {
        return false;
      }
      this.contextActive = false;
      let remove = [];
      for (let elem of this.signs) {
        
        if (elem.signData.bar == bar) {
          
          remove.push(this.signs.indexOf(elem));
        }  else if (elem.signData.bar < bar) {
          this.$emit("editSign", {type: "move", index: this.signs.indexOf(elem), data: {x: elem.x, y: (elem.y - this.barHeight)}});
        } else {
          this.$emit("editSign", {type: "changeSignData", index: this.signs.indexOf(elem), data: {bar: elem.signData.bar -1, beat: elem.signData.beat}});
        }
      }
      for (let last = remove.length - 1; last >= 0; last--) {
        this.$emit("editSign", {type: "remove", index: remove[last]});
      }
      this.$store.dispatch('removeBar');
    },



    /**
     * Method for adding a sign to the score
     * @arg type the sign type
     * @arg height the height of the sign
     * @arg x the x position of the sign
     * @arg y the y position of the sign
     */
    addSign (type, height, x, y) {
      const newSign = {isSelected: false, signType: type, height: height, x: x, y: y};
      this.$emit("editSign", {type: "add", data: newSign});
    },
    /**
     * Method for removing a sign from the score
     * @arg id the id of the sign to remove
     */
    removeSign (id = -1) {
        this.selectSign(-1);
        this.contextActive = false;
        if (id > 0) {
          this.$emit("editSign", {type: "delete", index: id});
          this.contextSign = 0;
        }
    },

    /**
     * Method for calculating the new beat and bar of an element after a vertical move
     * @arg index the index of the sign
     * @arg startY the y position before moving
     * @arg startH the height of the element before moving
     * @arg endY the y position after moving
     * @arg endH the height of the element after moving
     */
    calcBeatMove(index, startY, startH, endY, endH) {
      let beatsMoved = ((endY + endH) - (startY + startH)) / -this.blocksizeY;
      let elem = this.signs[index];
      if (beatsMoved != 0) {
        let beatsOverall = elem.signData.beat + beatsMoved;
        if (beatsOverall >= 0) {
          if (beatsMoved % 1 != 0) {
            beatsMoved = Math.floor(beatsMoved + 2);
            beatsOverall = elem.signData.beat + beatsMoved;
          } 
          if (beatsOverall < this.beats) {
            this.$emit("editSign", {type: "changeSignData", index: this.signs.indexOf(elem), data: {bar: elem.signData.bar, beat: beatsOverall}});
          } else {
            let barsMoved =  (beatsOverall - beatsOverall % this.beats) / this.beats;
            this.$emit("editSign", {type: "changeSignData", index: this.signs.indexOf(elem), data: {bar: (elem.signData.bar + barsMoved), beat: (beatsOverall % this.beats)}});
          }
        } else {
          if (beatsMoved % 1 != 0) {
            beatsMoved = Math.floor(beatsMoved - 1);
            beatsOverall = elem.signData.beat + beatsMoved;
          } 
          if (beatsOverall > -this.beats) {
            this.$emit("editSign", {type: "changeSignData", index: this.signs.indexOf(elem), data: {bar: (elem.signData.bar - 1), beat: (beatsOverall + this.beats)}});
          } else {
            let barsMoved = (beatsOverall - ((beatsOverall % this.beats) + this.beats) % this.beats) / this.beats;
            this.$emit("editSign", {type: "changeSignData", index: this.signs.indexOf(elem), data: {bar: (elem.signData.bar + barsMoved), beat: (((beatsOverall % this.beats) + this.beats) % this.beats)}});
          }
        }
      }
    },

    /**
     * Method for updating the data of a sign in the signs object
     * @arg data the new sign data and the index of that sign in the signs object 
     */
    updateSignData(data) {
      this.$emit("editSign", {type: "changeSignData", index: data.index, data: data.data});
    },

    /**
     * Method for selecting a sign via the attribute in the signs object
     * @arg id the index of the sign in the signs object 
     */
    selectSign(id, selectMultiple = false) {
      
      if (!selectMultiple) {
        for (let elem of this.signs) {
          this.$emit("editSign", {type: "changeSelection", index: this.signs.indexOf(elem), data: {isSelected: false}});
        }
      }
      if (id >= 0) {
        this.$emit("editSign", {type: "changeSelection", index: id, data: {isSelected: true}});
        this.selectedSigns.push(id);
      } else {
        this.selectedSigns = [];
      }
      this.contextActive = false;
    },

    /**
     * Method for placing an element on top of the canvas (placing it as the last element on the canvas svg)
     * @arg elem the element node to place on top 
     */
    placeSignOnTop (elem) {
      this.$refs.bounding.appendChild(elem);
    },



    /**
     * Method for checking the key of a keydown event and using its functions
     * @arg event the keydown event 
     */
    keyEvent(event) {
      if (!this.keyCommandsEnabled) {
        return false;
      }
      //delete sign on x or del
      if (event.key == "x" || event.key == "Delete") {
        let sortedSelected = this.selectedSigns.sort();
        
        for (let max = sortedSelected.length - 1; max >= 0; max--) {
            this.removeSign (sortedSelected[max]);
        }
      }
      //move sign with arrow keys key.id are 37 to 40
      if (event.which >= 37 && event.which <= 40) {
        let move = this.getArrowKeyAction (event.which);
        for (let elem of this.signs) {
          if (elem.isSelected == true) {
            //if the key id is odd -> left / right arrow key, move the sign(s) to the next collumn
            if (event.which % 2 == 1) {
              if (elem.signData.col + move.collumn  >= -this.collumnsLeft && elem.signData.col + move.collumn < this.collumnsRight) {
                this.$emit("editSign", {type: "changeSignData", index: this.signs.indexOf(elem), data: {col: (elem.signData.col + move.collumn)}});
                if (elem.col < 0) {
                  this.$emit("editSign", {type: "changeSignData", index: this.signs.indexOf(elem), data: {col: (elem.signData.col + move.collumn), side: "left"}});
                } else {
                  this.$emit("editSign", {type: "changeSignData", index: this.signs.indexOf(elem), data: {side: "right"}});
                }
                this.$emit("editSign", {type: "move", index: this.signs.indexOf(elem), data: {x: (elem.x + move.collumn * this.collumnWidth), y: elem.y}});
              }
            //if the key id is even -> up / down arrow key, move the sign up or down one beat if possible 
            } else {
              let startY = elem.y;
              let startH = elem.height;
              if (move.beat > 0) {
                if (this.checkStartingPos(elem.y, elem.height)) {
                  //if start pos and moving up -> change to bar 1 beat 0
                  this.$emit("editSign", {type: "move", index: this.signs.indexOf(elem), data: {x: elem.x, y: (elem.y - this.minHeight * 2 - this.startBarOffset)}});
                } else if (elem.y - move.beat * this.minHeight >= 0) {
                  this.$emit("editSign", {type: "move", index: this.signs.indexOf(elem), data: {x: elem.x, y: (elem.y - this.minHeight)}});
                }
              } else {
                let newY = elem.y + this.minHeight;
                if (this.checkStartingPos(newY, elem.height) && newY + elem.height < this.canvasDimNoPad.y) {
                  //if start pos and moving up -> change to bar 1 beat 0
                  elem.y = elem.y + elem.height + this.startBarOffset;
                  this.$emit("editSign", {type: "move", index: this.signs.indexOf(elem), data: {x: elem.x, y: (elem.y + elem.height + this.startBarOffset)}});
                  this.$emit("editSign", {type: "resize", index: this.signs.indexOf(elem), data: {height: (this.minHeight * 2)}});
                } else if (!this.checkStartingPos(newY, elem.height)) {
                  this.$emit("editSign", {type: "move", index: this.signs.indexOf(elem), data: {x: elem.x, y: (elem.y - this.minHeight)}});
                }
              }
              this.calcBeatMove(this.signs.indexOf(elem), startY, startH, elem.y, elem.height);
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

    /**
     * Method for checking which arrow key is pressed and adjusting the action of the key event on the keylog function above
     * @arg keyNr the id of the keydown event  
     */
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



    /**
     * Method for initializing event listeners on a sign
     * @arg elem the grouping element of the sign
     */
    initListeners (elem) {
      this.initSignInteraction(elem);
      this.initSignClick(elem);
      elem.addEventListener("contextmenu", this.openContextMenu, false);
      ["touchstart", "touchmove", "touchend"].forEach((et) => elem.addEventListener(et, this.ignoreTouch));
    },

    /**
     * Method for calling the custom sign context menu
     * @arg event the context menu call event
     */
    openContextMenu (event) {
      event.preventDefault();
      let target = event.target;
      const targetID = target.getAttribute("signID");
      this.contextSign = targetID;
     
      const boundingRect = event.target.parentElement.getBoundingClientRect();
      this.contextPos.x = boundingRect.right;
      if (this.signs[targetID].isSelected) {
        this.contextPos.y = boundingRect.top + this.handleDiam;
      } else {
        this.contextPos.y = boundingRect.top;
      }
      
      this.selectSign(targetID);
      this.contextActive = true;
      this.placeSignOnTop(event.target.parentElement);
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
    initSignClick: function(selector) {
      interact(selector).on("tap", this.clickSign);
      interact(selector).on("doubletap", this.doubleClickSign);
    },

    /**
     * The click event listener, fires a selection request to the score component
     * @arg event the click event
     */
    clickSign (event) {
      if (event.button == 0) {
        this.placeSignOnTop(event.target.parentElement);
        this.selectSign(event.target.getAttribute("signID"), event.ctrlKey);
      }
    },

    /**
     * The double click event listener, opens the context menu of a sign
     * @arg event the double click event
     */
    doubleClickSign (event) {
      this.openContextMenu(event)
    },



    makeShadow (elem) {
      let shadow = {};
      for (const [key, value] of Object.entries(elem)) {
        shadow[key] = value;
      }

      this.$emit("editSign", {type: "add", data: shadow});
    },

    checkStartingPos(y, height) {
      if (y + height > (this.canvasDimNoPad.y - this.minHeight - this.barHeight / this.beats * 2- this.startBarOffset)) {
        return true;
      } else {
        return false;
      }
    },

    /**
     * The resize start event listener, creats the shadow element for resizing
     * @arg event the resize-start event
     */
    resizeStart (event) {
      this.keyCommandsEnabled = false;
      let target = event.target;
      const targetID = target.getAttribute("signID");
      
      //get current element position
      let  y = (this.signs[targetID].y || 0) + event.dy;
      target.setAttribute("start-y", y);
      target.setAttribute("start-h", this.signs[targetID].height);

      this.makeShadow(this.signs[targetID]);

      //apply dragging styling to group
      target.classList.add("dragging");

       //move element to top of Render
      this.placeSignOnTop(target);
    },

    /**
     * The resize move event listener, resizes the event target
     * @arg event the resize-move event
     */
    resizeMove (event) {
      //get the saved x and y data
      let target = event.target;
      const targetID = target.getAttribute("signID");
      const shadowID = this.signs.length - 1;
      let targetElem = this.signs[targetID];
      let shadowElem = this.signs[shadowID];
      let y = (parseFloat(target.getAttribute("data-y")) || 0);

      // keep the same position when resizing from the top
      y += event.deltaRect.top;
      

      let actualY = Math.round(y / this.blocksizeY) * this.blocksizeY;
      let newHeight = targetElem.height + y - actualY;
      let actualH = Math.round(newHeight / this.blocksizeY) * this.blocksizeY;

      // update the element height (-14 for the handles)
      this.$emit("editSign", {type: "resize", index: targetID, data: {height: (event.rect.height - this.handleDiam * 2)}});
      //check if the element was resized from the top
      if (event.deltaRect.top != 0) {
        //top handle -> adjust y position to nearest grid position
        this.$emit("editSign", {type: "move", index: shadowID, data: {x: shadowElem.x, y: actualY}});

      }

      //stop resizing at the starting line
      if (!this.checkStartingPos(actualY, actualH)) {
        this.$emit("editSign", {type: "resize", index: shadowID, data: {height: actualH}});
      }

      //set new y data
      target.setAttribute("data-y", y);
      
      //translate group
      this.$emit("editSign", {type: "move", index: targetID, data: {x: targetElem.x, y: (targetElem.y + event.deltaRect.top)}});
    },

    /**
     * The resize end listener, sets the actual height/position after a resize
     * @arg event the resize-end event
     */
    resizeEnd (event) {
      this.keyCommandsEnabled = true;
      let target = event.target;
      const targetID = target.getAttribute("signID");
      const shadowID = this.signs.length - 1;
      let targetElem = this.signs[targetID];
      let shadowElem = this.signs[shadowID];

      let y = parseFloat(target.getAttribute("data-y"));
      let actualY = Math.round(y / this.blocksizeY) * this.blocksizeY;
      
      //check if the element was resized from the top
      if (event.deltaRect.top != 0) {
        //top handle -> adjust y position to nearest grid position
        target.setAttribute("data-y", actualY);
        this.$emit("editSign", {type: "move", index: targetID, data: {x: targetElem.x, y: actualY}});
      }
      this.$emit("editSign", {type: "resize", index: targetID, data: {height: shadowElem.height}});

      if (actualY == 0 && this.signs[targetID].y != 0) {
        this.$emit("editSign", {type: "move", index: targetID, data: {x: targetElem.x, y: 0}});
      }
      this.calcBeatMove (targetID, parseFloat(target.getAttribute("start-y")), parseFloat(target.getAttribute("start-h")), this.signs[targetID].y, this.signs[targetID].height);
      
      this.removeSign(shadowID);
      target.classList.remove("dragging");
      this.selectSign(targetID);
    },

    /**
     * The drag-start event listener, sets up the shadow element for the dragging
     * @arg event the drag-start event
     */
    dragStart: function(event) {
      this.keyCommandsEnabled = false;
      
      let target = event.target;
      const targetID = target.getAttribute("signID");
      //fire a selection request to the score component for proper styling
      this.selectSign(-1);
      
      //get current element position
      let  x = (this.signs[targetID].x || 0) + event.dx;
      let  y = (this.signs[targetID].y || 0) + event.dy;
      target.setAttribute("start-x", x);
      target.setAttribute("start-y", y);
      target.setAttribute("start-h", this.signs[targetID].height);

      this.makeShadow(this.signs[targetID]);

      //apply dragging styling to group
      target.classList.add("dragging");

       //move element to top of Render
      this.placeSignOnTop(target);
    },

    /**
     * The drag-move event listener, moves the sign and the shadow element
     * @arg event the drag-move event
     */
    dragMove: function(event) {
      this.selectSign(-1);
      let target = event.target;
      
      const targetID = target.getAttribute("signID");
      const shadowID = this.signs.length - 1;
      let targetElem = this.signs[targetID];
      this.$emit("editSign", {type: "resize", index: shadowID, data: {height: targetElem.height}});

      //get the current position from the x and y chords
      let  x = (this.signs[targetID].x || 0) + event.dx;
      let  y = (this.signs[targetID].y || 0) + event.dy;

      const collumnOffset = (this.collumnWidth - this.signWidth) / 2;
      let actualX = Math.round(x / this.blocksizeX) * this.blocksizeX + collumnOffset;
      let actualY = Math.round(y / this.blocksizeY) * this.blocksizeY;
      //check if the current position is above (below in actual browser) the starting line -> snap there
      if (this.checkStartingPos(actualY, this.signs[targetID].height)) {
        this.$emit("editSign", {type: "resize", index: shadowID, data: {height: (this.barHeight / this.beats * 2)}});
        actualY = this.canvasDimNoPad.y - this.minHeight - this.barHeight / this.beats * 2;
      }

        //set new element position
        this.$emit("editSign", {type: "move", index: targetID, data: {x: x, y: y}});

        //set new shadow element position
        this.$emit("editSign", {type: "move", index: shadowID, data: {x: actualX, y: actualY}});
    },
    
    /**
     * The drag-end event listener, places the sign at the proper position and removes the shadow
     * @arg event the drag-move event
     */
    dragEnd: function(event) {
      this.keyCommandsEnabled = true;
      let target = event.target;

      const targetID = target.getAttribute("signID");

      target.classList.remove("dragging");

      //get the new x and y chords
      let x = this.signs[targetID].x;
      let y = this.signs[targetID].y;

      const collumnOffset = (this.collumnWidth - this.signWidth) / 2;
      let screenX = Math.round(x / this.blocksizeX) * this.blocksizeX + collumnOffset;
      let screenY = Math.round(y /this.blocksizeY) * this.blocksizeY;
      
      //check if the current position is above (below in actual browser) the starting line -> snap there
      if (this.checkStartingPos(screenY, this.signs[targetID].height)) {
        this.$emit("editSign", {type: "resize", index: targetID, data: {height: (this.barHeight / this.beats * 2)}});
        screenY = this.canvasDimNoPad.y - this.barHeight / this.beats * 2 - this.minHeight;
        this.$emit("editSign", {type: "changeSignData", index: targetID, data: {canResize: false}});
      } else {
        this.$emit("editSign", {type: "changeSignData", index: targetID, data: {canResize: true}});
      }

      this.$emit("editSign", {type: "move", index: targetID, data: {x: screenX, y: screenY}});
      target.setAttribute("data-y", screenY);

      let collumnsMoved = (parseFloat(target.getAttribute("start-x")) - this.signs[targetID].x) / -this.blocksizeX;
      this.$emit("editSign", {type: "changeSignData", index: targetID, data: {col: (this.signs[targetID].signData.col + collumnsMoved)}});

      this.calcBeatMove(targetID, parseFloat(target.getAttribute("start-y")), parseFloat(target.getAttribute("start-h")), this.signs[targetID].y, this.signs[targetID].height);

      const shadowID = this.signs.length - 1;
      this.removeSign(shadowID);
      this.selectSign(targetID);
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

svg text {
  user-select: none;
}

.shadow {
  fill: #a42a42;
  stroke-width: 2;
  stroke: rgb(0,0,0);
  
}
</style>
