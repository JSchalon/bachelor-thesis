<template>
    <div id="canvasContainer" @scroll="getScroll">
      <div class="normal" style="visibility: hidden"/>
      <div class="margin-box" @mousedown.self="selectSign(-1)">
        <svg preserveAspectRatio="xMinYMax meet" ref="canvas" id="canvas" :width="canvasDimensions.x" :height="canvasDimensions.y" fill="white" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="direction-high-left" width="10" height="10" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="10" height="10" fill="white"/>
              <line x1="0" y1="0" x2="0" y2="10" stroke="black" stroke-width="2" />
            </pattern>
            <pattern id="direction-high-right" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="10" height="10" fill="white"/>
              <line x1="0" y1="0" x2="0" y2="10" stroke="black" stroke-width="2" />
            </pattern>
          </defs>
          <rect x="0" y="0" :width="canvasDimensions.x" :height="canvasDimensions.y" ref="canvasBG" class="lasso-able" @click="selectSign(-1)"/>
          <g :transform="'translate(' + outerCanvasMargin + ', ' + canvasMarginTop +')'" ref="bounding">
            <rect x="0" y="0" :width="columnWidth" :height="innerCanvasDimFull.y" ref="boundingOuterLeft" />
            <rect :x="columnWidth * (columnsLeft + 1 + columnsRight)" y="0" :width="columnWidth" :height="innerCanvasDimRight.y" ref="boundingOuterRight" />
            <rect :x="columnWidth" y="0" :width="innerCanvasDim.x" :height="innerCanvasDim.y" ref="boundingInner" />
            <rect :x="columnWidth" :y="innerCanvasDim.y - minHeight + 5" :width="innerCanvasDim.x" :height="minHeight" ref="boundinColumnDef" />
            <Grid 
              @unselect="selectSign(-1)" 
              @selectColumn="updateSelectedColumn" 
              @selectBar="updateSelectedBar" 
              @placeSign="addSign" 
              @getGridHandles="placeGridHandles" 
              @removeGridHandles="columnHandlesActive = false; barHandlesActive = false;"
              @lassoSelect="lassoSelect" 
              :beats="beats" 
              :bars="bars" 
              :selectedColumn="selectedColumn"
              :selectedBar="selectedBar"
              :fullHeight="innerCanvasDimFull.y" 
              :contextActive="contextActive" 
              :signsSelected="signsSelected"
            />
            <SignContainer
              @requestListeners="initSignListeners"
              :signData="item"
              :id="index"
              :localData="localSignData[index]"
              :key="index"
              v-for="(item, index) in signs"
            />
            <use href="#lasso-rect"/>
          </g>
        </svg>
      </div>
      <ContextMenu v-if="contextActive" :signData="signs[contextSign]" :signIndex="contextSign" :isActive="contextActive" :x="contextPos.x" :y="contextPos.y" @updateSignData="updateSignData" :key="'context' + contextSign" @delete="removeSign"/>
      <div class="column-handles" :style="columnHandleTranslate" v-if="columnHandlesActive && selectedSigns.length == 0">
        <p v-if="selectedColumn >= -columnsLeft" class="add-remove-container green" @click="addColumn(selectedColumn)"/>
        <p v-if="selectedColumn < -columnsLeft" class="add-remove-container invisible"/>
        <p v-if="selectedColumn >= -columnsLeft && selectedColumn < columnsRight && ((selectedColumn < 0 && columnsLeft > 2) || (selectedColumn >= 0 && columnsRight > 2))" class="add-remove-container red" @click="removeColumn(selectedColumn)"/>
        <p v-if="selectedColumn < -columnsLeft || selectedColumn >= columnsRight || (selectedColumn < 0 && columnsLeft <= 2) || (selectedColumn >= 0 && columnsRight <= 2)" class="add-remove-container red invisible"/>
        <p v-if="selectedColumn < columnsRight" class="add-remove-container green" @click="addColumn(selectedColumn + 1)"/>
        <p v-if="selectedColumn >= columnsRight" class="add-remove-container invisible"/>
      </div>
      <div class="bar-handles" :style="barHandleTranslate" v-if="barHandlesActive && selectedSigns.length == 0">
        <p class="add-remove-container green" @click="addBar(selectedBar + 1)"/>
        <p v-if="selectedBar > 0 && bars > 1" class="add-remove-container red" @click="removeBar(selectedBar)"/>
        <p v-if="selectedBar > 0 && bars == 1" class="add-remove-container red invisible"/>
        <div v-if="selectedBar == 0" :style="'transform: translateY(' + -(minHeight + 15) + 'px)'">
          <p class="add-remove-container red invisible" />
        </div>
        <p v-if="selectedBar > 0" class="add-remove-container green" @click="addBar(selectedBar)"/>
        <p v-if="selectedBar == 0" class="add-remove-container invisible" :style="'transform: translateY(' + -(minHeight + 10) + 'px)'"/>
      </div>
    </div>
</template>

<script>
import interact from "interactjs";

export default {
  name: 'Score',
  inject: ["signWidth", "barHeight", "columnWidth", "handleDiam", "outerCanvasMargin", "borderWidth", "addRemoveHeight", "startBarOffset","contextMenuWidth"],
  data() {
    return {
      canvasScroll: {x: 0, y:0},
      contextPos: {x: 0, y: 0},
      contextSign: 0,
      keyCommandsEnabled: true,
      contextWasActive: false,
      columnHandlesActive: false,
      selectedColumnTranslate: {x: 0, y: 0},
      barHandlesActive: false,
      selectedBarTranslate: {x: 0, y: 0},
      interacting: false,
      interactingSigns: [],
      localSignData: [],
      canMoveGhost: false,
    };
  },
  computed: {
    signs () {
      return this.$store.state["signs"];
    },
    contextActive() {
      return this.$store.state["contextActive"];
    },
    selectedSigns(){
      return this.$store.state["selectedSigns"];
    },
    multiselectActive () {
      return this.$store.state["multiselectActive"];
    },
    columnHandleTranslate () {
      return "left: " + this.selectedColumnTranslate.x + "px; top: " + this.selectedColumnTranslate.y + "px;";
    },
    barHandleTranslate () {
      return "left: " + this.selectedBarTranslate.x + "px; top: " + this.selectedBarTranslate.y + "px;";
    },
    columnsLeft () {
      return this.$store.state["columnsLeft"];
    },
    columnsRight () {
      return this.$store.state["columnsRight"];
    },
    bars () {
      return this.$store.state["bars"];
    },
    beats () {
      return this.$store.state["beatsPerBar"];
    },
    selectedColumn () {
      return this.$store.state["selectedColumn"];
    },
    selectedBar () {
      return this.$store.state["selectedBar"];
    },
    curLibrarySign () {
      return this.$store.state["curSign"];
    },
    xmlScore () {
      return this.$store.state["signsXML"];
    },
    minHeight () {
      return this.barHeight / this.beats;
    },
    blocksizeX () {
      return this.columnWidth;
    },
    blocksizeY () {
      return this.barHeight / this.beats;
    },
    canvasDimensions () {
      return {
        x: this.columnWidth * (this.columnsLeft + this.columnsRight + 2) + 2 * this.outerCanvasMargin, 
        y: this.barHeight * (this.bars + 0.5) + this.minHeight + this.outerCanvasMargin + this.startBarOffset
      };
    },
    innerCanvasDimFull () {
      return {x: this.columnWidth * (this.columnsLeft + this.columnsRight + 2), y: this.barHeight * (this.bars + 0.5) + this.minHeight + this.startBarOffset};
    },
    innerCanvasDimRight () {
      return {x: this.columnWidth * (this.columnsLeft + this.columnsRight + 1), y: this.barHeight * (this.bars + 0.5) + this.minHeight + this.startBarOffset};
    },
    innerCanvasDim () {
      return {x: this.columnWidth * (this.columnsLeft + this.columnsRight), y: this.barHeight * (this.bars + 0.5) + this.minHeight + this.startBarOffset};
    },
    canvasMarginTop () {
      return this.outerCanvasMargin / 2;
    },
    signsSelected () {
      if (this.selectedSigns.length == 0) {
        return false;
      } else {
        return true;
      }
    },
    ghostOverCanvas () {
      return this.$store.state["ghostOverCanvas"];
    },
    ghostPos () {
      return this.$store.state["ghostPos"];
    },
    ghostActive () {
      return this.$store.state["ghostActive"];
    }
  },
  watch: {
    signs: {
      deep: true,
      handler() {
        if (!this.interacting) {
          this.makeLocalSignData();
        }
      }
    },
    ghostOverCanvas (bool) {
      if (bool) {
        let pos = this.getGhostScorePos();
        this.addSign(pos, false);
        this.canMoveGhost = true;
      } else if (this.ghostActive) {
        this.removeSign(this.signs.length - 1);
        this.canMoveGhost = false;
      } else {
        this.canMoveGhost = false;
      }
    },
    ghostPos () {
      if (this.ghostOverCanvas && this.canMoveGhost) {
        let pos = this.getGhostScorePos();
        pos.colRight = pos.col + 1;
        this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.length - 1, data: pos});
      }
    }
  },
  mounted () {
    window.addEventListener('keydown', this.keyEvent);
    window.addEventListener('resize', this.initInteractListeners);
    
    
    this.makeLocalSignData();
    this.initInteractListeners();
    setTimeout(() => {
      this.addBar(this.bars+1);
      this.removeBar(this.bars);
      this.makeLocalSignData();
      this.$store.dispatch("clearHistory");
    }, 10);
    
},
  unmounted () {
    //remove all interact listeners on unmount to avoid wrong interactions
    interact(".sign-container.bound-inner").unset()
    interact(".room-direction").unset();
    interact(".path").unset();
    interact(".body-part").unset();
    interact(".normal").unset();
    interact(".bow").unset();
    interact(".sign-container").unset();
  },
  methods: {
    getScroll (event) {
      if (this.canvasScroll.x != event.target.scrollLeft && this.columnHandlesActive) {
        this.placeGridHandles({type: "col", x: this.selectedColumnTranslate.x + (this.canvasScroll.x - event.target.scrollLeft), y: this.selectedColumnTranslate.y - document.getElementById("canvasContainer").scrollTop - (this.barHeight / 2 - 15)})
      }
      if (this.canvasScroll.y != event.target.scrollTop && this.barHandlesActive) {
        this.placeGridHandles({type: "bar", x: this.selectedBarTranslate.x - (this.columnWidth - this.signWidth - 15), y: this.selectedBarTranslate.y + (this.canvasScroll.y - event.target.scrollTop)})
      }
      if (this.interacting) {
        for (let index of this.interactingSigns) {
          this.localSignData[index].x = (this.localSignData[index].x + (this.canvasScroll.x - event.target.scrollLeft));
          this.localSignData[index].y = (this.localSignData[index].y - (this.canvasScroll.y - event.target.scrollTop));
        }
        //move the shadow elem as well
        const shadowIndex = this.signs.length - 1;
        let shadowX = (this.localSignData[shadowIndex].x + (this.canvasScroll.x - event.target.scrollLeft));
        let shadowY = (this.localSignData[shadowIndex].y - (this.canvasScroll.y - event.target.scrollTop));

        this.localSignData[shadowIndex].x = shadowX;
        this.localSignData[shadowIndex].y = shadowY;
      }
      this.canvasScroll = {x: event.target.scrollLeft, y: event.target.scrollTop};
      
    },
    getGhostScorePos () {
      const canvasRect = this.$refs.canvas.getBoundingClientRect();
      let canvasPos = {x: this.ghostPos.x - canvasRect.x, y: this.ghostPos.y - canvasRect.y};

      let signX = Math.round(canvasPos.x / this.blocksizeX) * this.blocksizeX - this.columnWidth;
      if (signX < this.columnWidth) {
        signX = this.columnWidth;
      } else if (signX > this.innerCanvasDim.x) {
        signX = this.innerCanvasDim.x;
      }
      let signY = Math.round(canvasPos.y / this.blocksizeY) * this.blocksizeY - this.minHeight;
      if (signY < 0) {
        signY = 0;
      }
      const totalCol = signX / this.columnWidth;
      let col = totalCol - this.columnsLeft - 1;
      let bar = this.bars - Math.floor(signY / this.barHeight);
      let beat = this.beats - Math.round((signY - (this.bars-bar) * this.barHeight) / this.minHeight) - this.curLibrarySign.signData.beatHeight;
      if (this.curLibrarySign.signData.baseType == "BodyPartSign") {
        bar = -1;
        beat = 0;
      } else if (this.checkStartingPos(signY, this.curLibrarySign.signData.beatHeight * this.minHeight)) {
        bar = 0;
        beat = 0;
      } 
      if (this.curLibrarySign.signData.baseType == "RelationshipBow" && col >= this.columnsRight - 1) {
        col = this.columnsRight - 2;
      }

      if (this.curLibrarySign.signData.baseType == "RoomDirectionSign") {
        col = -this.columnsLeft - 1;
      } else if (this.curLibrarySign.signData.baseType == "PathSign") {
        col = this.columnsRight;
      }
      return {col: col, bar: bar, beat: beat};
    },
    makeLocalSignData() {
      this.localSignData = [];
      for (let elem of this.signs) {
        
        if (this.signs.indexOf(elem) == 0) {
          this.localSignData.push({height: 0, x: 0, y: 0, purpose: "dummy sign"})
        } else {
          let elemData = {canResize: true};
          elemData.height = elem.beatHeight * this.minHeight;

          elemData.x = (this.columnsLeft + 1 + elem.col) * this.columnWidth + (this.columnWidth - this.signWidth) / 2;
          
          if (elem.bar > 0) {
            elemData.y = (this.bars - elem.bar) * this.barHeight + (this.beats - elem.beat) * this.minHeight - elemData.height;
          } else if (elem.bar == 0) {
            elemData.canResize = false;
            if (elem.resizable && elem.baseType != "RelationshipBow") {
              elemData.y = this.bars * this.barHeight + this.startBarOffset;
              if (elem.beatHeight != 2) {
                this.interacting = true;
                this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.indexOf(elem), data: {beatHeight: 2}});
                this.interacting = false;
              }
            } else {
              elemData.y = this.bars * this.barHeight + this.startBarOffset + this.minHeight;
            }
          } else if (elem.bar == -1) {
            elemData.y = this.bars * this.barHeight + 2 * this.minHeight + this.startBarOffset * 2;
            elemData.canResize = false;
          }

          if (elem.baseType == "RelationshipBow") {
            elemData.width = (elem.colRight + 1 - elem.col) * this.columnWidth;
            elemData.x = elemData.x - (this.columnWidth - this.signWidth) / 2;
          } else {
            elemData.width = this.signWidth;
          }

          this.localSignData.push(elemData)
        }
      }
    },
    placeGridHandles(data) {
      this.$store.dispatch("changeContextMenu", false);
      if (data.type == "col") {
        this.columnHandlesActive = true;
        this.selectedColumnTranslate = {x: data.x, y: (data.y + document.getElementById("canvasContainer").scrollTop) + this.barHeight / 2 - 15};
      } else {
        //special case for bar 0 -> only add, topside
        this.barHandlesActive = true;
        this.selectedBarTranslate = {x: data.x + this.columnWidth - this.signWidth - 15, y: data.y};
      }
    },
    updateSelectedColumn (data) {
      this.$store.dispatch("setSelectedColumn", data);
    },
    updateSelectedBar (data) {
      this.$store.dispatch("setSelectedBar", data);
    },
    lassoSelect (data) {
      this.selectSign(-1);
      for (let index = 1; index < this.localSignData.length; index++) {
        let elem = this.localSignData[index];
        if (elem.x >= data.x && elem.x <= data.x + data.w) {
          if (elem.y >= data.y && elem.y <= data.y + data.h) {
            this.selectSign(index, true);
          } else if (elem.y + elem.height >= data.y && elem.y + elem.height <= data.y + data.h) { 
            this.selectSign(index, true);
          }
        } else if (elem.x + elem.width >= data.x && elem.x + elem.width <= data.x + data.w) { 
          if (elem.y >= data.y && elem.y <= data.y + data.h) {
            this.selectSign(index, true);
          } else if (elem.y + elem.height >= data.y && elem.y + elem.height <= data.y + data.h) { 
            this.selectSign(index, true);
          }
        }
      }
    },
    /**
     * Method for adding a column on the chosen side in the vuex state
     * @arg side the side to add a column to  
     * @arg beforeIndex the index to insert the new column after
     */
    addColumn(beforeIndex) {
      this.$store.dispatch("changeContextMenu", false);
      this.contextSign = 0;
      let side = "right";
      if (beforeIndex < 0) {
        side = "left";
      }
      if (side == "left" && beforeIndex > this.selectedColumn) {
        this.updateSelectedColumn(this.selectedColumn - 1);
      }
      if (side == "right" && beforeIndex <= this.selectedColumn) {
        this.updateSelectedColumn(this.selectedColumn + 1);
      }
      for (let elem of this.signs) {
        if (elem.col >= beforeIndex) {
          this.localSignData[this.signs.indexOf(elem)].x = (this.localSignData[this.signs.indexOf(elem)].x + this.columnWidth);
          if (side == "right") {
            this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.indexOf(elem), data: {col: elem.col + 1}});
          }
        }else if (elem.col < beforeIndex) {
          if (side == "left") {
            this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.indexOf(elem), data: {col: elem.col - 1}});
          }
        }
      }
      
      this.$store.dispatch('addColumn',side);
      this.$store.dispatch("saveStateInHistory");
      setTimeout(function () {this.initInteractListeners()}.bind(this), 1);
    },
    /**
     * Method for removing a column on the chosen side in the vuex state
     * @arg col the column to remove  
     */
    removeColumn(col) {
      this.$store.dispatch("changeContextMenu", false);
      this.contextSign = 0;
      let side = "left";
      if (col >= 0) {
        side = "right";
      }
      if ((side == "left" && this.columnsLeft == 2) || (side == "right" && this.columnsRight == 2)) {
        return false;
      }
      if (side == "left") {
        this.updateSelectedColumn(col + 1)
      } else {
        this.updateSelectedColumn(col - 1)
      }
      let remove = [];
      for (let elem of this.signs) {
        if (elem.col == col || (elem.baseType == "RelationshipBow" && elem.col < col && elem.colRight >= col)) {
          
          remove.push(this.signs.indexOf(elem));
        }
        if (side == "left") {
          if (elem.col > col) {
            this.localSignData[this.signs.indexOf(elem)].x = (this.localSignData[this.signs.indexOf(elem)].x - this.columnWidth);
          } else if (elem.col < col) {
            this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.indexOf(elem), data: {col: (elem.col + 1)}});
          }
        } else {
          if (elem.col > col) {
            this.localSignData[this.signs.indexOf(elem)].x = (this.localSignData[this.signs.indexOf(elem)].x - this.columnWidth);
            this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.indexOf(elem), data: {col: (elem.col - 1)}});
          }
        }
      }
      
      for (let last = remove.length - 1; last >= 0; last--) {
        this.$store.dispatch("editSigns", {type: "delete", index: remove[last]});
        this.localSignData.splice(remove[last], 1);
      }
      this.$store.dispatch('removeColumn',side);
      this.$store.dispatch("saveStateInHistory");
      setTimeout(function () {this.initInteractListeners()}.bind(this), 1);
    },

    /**
     * Method for adding a bar in the vuex state
     * @arg beforeIndex the index to insert the new bar before
     */
    addBar(beforeIndex) {
      this.$store.dispatch("changeContextMenu", false);
      this.contextSign = 0;
      if (beforeIndex > this.selectedBar) {
        this.selectedBarTranslate.y = this.selectedBarTranslate.y + this.barHeight;
      } else {
        this.updateSelectedBar (this.selectedBar + 1)
      }
      for (let elem of this.signs) {
        if (elem.bar < beforeIndex) {
          this.localSignData[this.signs.indexOf(elem)].y = this.localSignData[this.signs.indexOf(elem)].y + this.barHeight;
        } else if (elem.bar >= beforeIndex) {
          this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.indexOf(elem), data: {bar: (elem.bar + 1), beat: elem.beat}});
        }
      }
      this.$store.dispatch('addBar');
      this.$store.dispatch("saveStateInHistory");
      setTimeout(function () {this.initInteractListeners()}.bind(this), 1);
    },
    /**
     * Method for removing a bar in the vuex state
     */
    removeBar(bar) {
      //only delete existing bars and always leave at least one bar
      if (this.bars < bar || this.bars == 1) {
        return false;
      }
      this.$store.dispatch("changeContextMenu", false);
      this.contextSign = 0;
      let remove = [];
      if (bar == this.bars) {
        this.$store.dispatch("setSelectedBar", (bar - 1));
      } else {
        this.selectedBarTranslate.y = this.selectedBarTranslate.y - this.barHeight
      }
      for (let elem of this.signs) {
        const index = this.signs.indexOf(elem);
        if (index > 0) {
          if (elem.bar == bar) {
            remove.push(this.signs.indexOf(elem));
          } else if (elem.bar < bar) {
            const offset = Math.abs(this.barHeight - this.localSignData[index].y);
            
            if ((this.localSignData[index].y - this.barHeight) >= 0) {
              this.localSignData[index].y = this.localSignData[index].y - this.barHeight;
            } else if (elem.beatHeight > 1) {
              this.localSignData[index].y = this.localSignData[index].y + offset - this.barHeight;
              this.localSignData[index].height = this.localSignData[index].height - offset;
              this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {beatHeight: (this.localSignData[index].height / this.minHeight)}});
            }
          } else {
            this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {bar: elem.bar -1, beat: elem.beat}});
          }
        }
      }
      for (let last = remove.length - 1; last >= 0; last--) {
        this.$store.dispatch("editSigns", {type: "delete", index: remove[last]});
        this.localSignData.splice(remove[last], 1);
      }
      this.$store.dispatch('removeBar');
      this.$store.dispatch("saveStateInHistory");
      setTimeout(function () {this.initInteractListeners()}.bind(this), 1);
    },
    /**
     * Method for adding a sign to the score
     * @arg obj contains the col, bar and beat, where the sign is supposed to be placed 
     * @arg permanent whether or not the sign will be permanently placed. If not, don't delete the current library sign
     */
    addSign (obj, permanent = true) {
      let signData = {};
      for (const [key, value] of Object.entries(this.curLibrarySign.signData)) {
        signData[key] = value;
      } 
      
      signData.col = obj.col;
      signData.bar = obj.bar;
      signData.beat = obj.beat;
      if (!("beatHeight" in signData)) {
        signData.beatHeight = this.curLibrarySign.height / this.minHeight;
      }
      
      if (signData.col < 0) {
        signData.side = "left";
      } else {
        signData.side = "right";
      }
      if (this.curLibrarySign.signData.baseType == "RelationshipBow") {
        signData.colRight = signData.col + 1;
      }
      
      //if the sign is larger than one beat and supposed to be placed at the top-most beat -> make it smaller to fit
      if (signData.bar == this.bars && signData.beat == this.beats - 1 && signData.beatHeight > 1) {
        signData.beatHeight = 1;
      }
      this.$store.dispatch("editSigns", {type: "add", data: signData});
      if (permanent) {
        this.$store.dispatch('changeCurSign',false);
        this.$store.dispatch("saveStateInHistory");
      }
      
      this.makeLocalSignData();
    },
    /**
     * Method for removing a sign from the score
     * @arg id the id of the sign to remove
     */
    removeSign (id = -1) {
      this.selectSign(-1);
      this.$store.dispatch("changeContextMenu", false);
      if (id > 0) {
        this.$store.dispatch("editSigns", {type: "delete", index: id});
        this.localSignData.splice(id, 1);
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
        let beatsOverall = elem.beat + beatsMoved;
        if (beatsOverall >= 0) {
          if (beatsMoved % 1 != 0) {
            beatsMoved = Math.floor(beatsMoved + 2);
            beatsOverall = elem.beat + beatsMoved;
          } 
          if (beatsOverall < this.beats) {
            this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {bar: elem.bar, beat: beatsOverall}});
          } else {
            let barsMoved = (beatsOverall - beatsOverall % this.beats) / this.beats;
            this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {bar: (elem.bar + barsMoved), beat: (beatsOverall % this.beats)}});
          }
        } else {
          if (beatsMoved % 1 != 0) {
            beatsMoved = Math.floor(beatsMoved - 1);
            beatsOverall = elem.beat + beatsMoved;
          } 
          if (beatsOverall > -this.beats) {
            this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {bar: (elem.bar - 1), beat: (beatsOverall + this.beats)}});
          } else {
            let barsMoved = (beatsOverall - ((beatsOverall % this.beats) + this.beats) % this.beats) / this.beats;
            this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {bar: (elem.bar + barsMoved), beat: (((beatsOverall % this.beats) + this.beats) % this.beats)}});
          }
        }
      }
    },

    calcColumnMove(index, startX, startW, endX, endW) {
      let movedRight = Math.round(((endX + endW) - (startX + startW)) / this.blocksizeX);
      let movedLeft = Math.round((endX - startX)/this.blocksizeX);
      const elem = this.signs[index];
      this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {col: (elem.col + movedLeft), colRight: (elem.colRight + movedRight)}});
    },

    /**
     * Method for updating the data of a sign in the signs object
     * @arg data the new sign data and the index of that sign in the signs object 
     */
    updateSignData(data) {
      this.$store.dispatch("editSigns", {type: "changeSignData", index: data.index, data: data.data});
      this.$store.dispatch("saveStateInHistory");
    },

    /**
     * Method for selecting a sign via the attribute in the signs object
     * @arg id the index of the sign in the signs object 
     */
    selectSign(id, selectMultiple = false) {
      if (!(selectMultiple || this.multiselectActive)) {
        this.$store.dispatch("clearSelectedSigns");
      }
      if (id >= 0) {
        if (this.signs[id].isSelected == false) {
          this.$store.dispatch("addToSelectedSigns", id);
          this.barHandlesActive = false;
          this.columnHandlesActive = false;
        } else {
          this.$store.dispatch("removeFromSelectedSigns", id);
        }
      } else if (id == -1) {
        this.$store.dispatch("clearSelectedSigns");
        this.contextSign = 0;
      }
      this.$store.dispatch("changeContextMenu", false);
    },

    /**
     * Method for placing an element on top of the canvas (placing it as the last element on the canvas svg)
     * @arg elem the element node to place on top 
     */
    placeSignOnTop (index) {
      let elem = this.$refs.bounding.querySelector(".sign-container[signID='"+ index + "']");
      this.$refs.bounding.appendChild(elem);
    },

    getSignRect(index) {
      let elem = this.$refs.bounding.querySelector(".sign-container[signID='"+ index + "']");
      let rect = elem.getBoundingClientRect();
      return rect;
    },



    /**
     * Method for checking the key of a keydown event and using its functions
     * @arg event the keydown event 
     */
    keyEvent(event) {
      if (!this.keyCommandsEnabled || this.ghostActive) {
        return false;
      }
      if (event.key == "e") {
        console.log(this.signs)
        console.log(this.xmlScore);
        return;
      }
      if ((event.key == "s" || event.key == "p") && (event.ctrlKey || event.metaKey )) {
        event.preventDefault();

        const serializer = new XMLSerializer();
        const xml = serializer.serializeToString(this.xmlScore);
        
        let filename = this.$store.state["title"];
        let bb = new Blob([xml], {type: 'application/xml'});
        if (!filename.includes(".xml")) {
          filename = filename + ".xml";
        }
        if (event.key == "p") { //ctrl + p -> save svg instead of xml
          filename = this.$store.state["title"] + ".svg";
          const svg = serializer.serializeToString(document.getElementById("canvas"));
          bb = new Blob([svg], {type: 'application/xml'});
        }
        //console.log(filename + ".xml");
        const pom = document.createElement('a');
        pom.setAttribute('href', window.URL.createObjectURL(bb));
        pom.setAttribute('download', filename);
        pom.dataset.downloadurl = ['application/xml', pom.download, pom.href].join(':');
        pom.draggable = true; 
        pom.classList.add('dragout');
        document.body.appendChild(pom);
        pom.click();
        document.body.removeChild(pom);
        return;
      }
      //delete sign on x or del
      if (event.key == "Delete" && this.selectedSigns.length > 0) {
        const sortedSelected = this.selectedSigns.sort();
        
        for (let max = sortedSelected.length - 1; max >= 0; max--) {
            this.removeSign (sortedSelected[max]);
        }
        this.$store.dispatch("saveStateInHistory");
        return;
      }
      //move sign with arrow keys key.id are 37 to 40
      if (event.which >= 37 && event.which <= 40) {
        let move = this.getArrowKeyAction (event.which);
        for (let elem of this.signs) {
          const index = this.signs.indexOf(elem);
          if (elem.isSelected == true) {
            //if the key id is odd -> left / right arrow key, move the sign(s) to the next column
            if (event.which % 2 == 1) {
              if (elem.col + move.column  >= -this.columnsLeft && elem.col + move.column < this.columnsRight && elem.baseType != "RoomDirectionSign" && elem.baseType != "PathSign") {
                if (elem.baseType == "RelationshipBow") {
                  this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {col: (elem.col + move.column), colRight: (elem.colRight + move.column)}});
                } else {
                  this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {col: (elem.col + move.column)}});
                }
                if (elem.col < 0) {
                  this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {side: "left"}});
                } else {
                  this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {side: "right"}});
                }
                this.localSignData[index].x = this.localSignData[index].x + move.column * this.columnWidth;
              }
            //if the key id is even -> up / down arrow key, move the sign up or down one beat if possible 
            } else if (elem.baseType != "BodyPartSign") {
              let startY = this.localSignData[index].y;
              let startH = this.localSignData[index].height;
              if (move.beat > 0) {
                if (this.checkStartingPos(this.localSignData[index].y, this.localSignData[index].height)) {
                  //if start pos and moving up -> change to bar 1 beat 0
                  this.localSignData[index].y = this.localSignData[index].y - this.minHeight * 2 - this.startBarOffset;
                } else if (this.localSignData[index].y - move.beat * this.minHeight >= 0) {
                  this.localSignData[index].y = this.localSignData[index].y - this.minHeight;
                }
              } else {
                let newY = this.localSignData[index].y + this.minHeight;
                if (this.checkStartingPos(newY, this.localSignData[index].height) && newY + this.localSignData[index].height < this.innerCanvasDimFull.y) {
                  //if start pos and moving up -> change to bar 1 beat 0
                  this.localSignData[index].y = this.localSignData[index].y + this.localSignData[index].height + this.startBarOffset;
                  if (elem.resizable) {
                    this.localSignData[index].height = (this.minHeight * 2);
                    this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {beatHeight: (this.localSignData[index].height / this.minHeight)}});
                  } else {
                    this.localSignData[index].y = this.localSignData[index].y + this.minHeight;
                  }
                } else if (!this.checkStartingPos(newY, this.localSignData[index].height)) {
                  this.localSignData[index].y = this.localSignData[index].y + this.minHeight;
                }
              }
              this.calcBeatMove(index, startY, startH, this.localSignData[index].y, this.localSignData[index].height);
            }
          }
        }
        this.$store.dispatch("saveStateInHistory");
        return;
      }
      //undo command listener
      if (event.key == "z" && (event.ctrlKey || event.metaKey)) {
        this.$store.dispatch("undoChanges");
        return;
      }
      //redo event listener
      if (event.key == "y" && (event.ctrlKey || event.metaKey)) {
        this.$store.dispatch("redoChanges");
        return;
      }
      //select/unselect all event listener
      if (event.key == "a" && (event.ctrlKey || event.metaKey )) {
        if (this.selectedSigns.length > 0) {
          this.selectSign(-1);
        } else {
          for (let index = 1; index < this.signs.length; index++) {
            this.selectSign(index, true)
          }
        }
        return;
      }
      //inverse selection event listener
      if (event.key == "i" && (event.ctrlKey || event.metaKey )) {
        if (this.selectedSigns.length > 0) {
          let unselected = [];
          for (let index = 1; index < this.signs.length; index++) {
            unselected.push(index);
          }
          const sortedSelected = this.selectedSigns.sort();
          for (let index = sortedSelected.length - 1; index >= 0; index--) {
            unselected.splice(sortedSelected[index] - 1, 1);
          }
          
          this.selectSign(-1);
          for (let index of unselected) {
            this.selectSign(index, true);
          }
        }
        return;
      }
    },

    /**
     * Method for checking which arrow key is pressed and adjusting the action of the key event on the keylog function above
     * @arg keyNr the id of the keydown event  
     */
    getArrowKeyAction (keyNr) {
      let beat = 0;
      let column = 0;
      if (keyNr == 37) {
        column = -1;
      } else if (keyNr == 38) {
        beat = 1;
      } else if (keyNr == 39) {
        column = 1;
      } else {
        beat = -1;
      }
      return {beat: beat, column: column};
    },



    /**
     * Method for initializing the event listeners on a sign
     */
    initInteractListeners () {
      this.initSignInteraction();
      this.initSignClick();
    },
    initSignListeners (elem) {
      elem.addEventListener("contextmenu", this.openContextMenu, false);
      ["touchstart", "touchmove", "touchend"].forEach((et) => elem.addEventListener(et, this.ignoreTouch));
      if (elem.classList.contains("normal")) {
        interact(".normal").resizable({
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
        });
      } else {
        interact(".bow").resizable({
          // resize from top and bottom via the handles. no resize -> no handles
          edges: { 
            left: ".handle-first", 
            right: ".handle-second",
            bottom: false,  
            top: false, 
          },
          listeners: {
            start: this.bowResizeStart,
            move: this.bowResizeMove,
            end: this.bowResizeEnd,
          },
          modifiers: [
            // minimum size
            interact.modifiers.restrictSize({
              min: { width: this.columnWidth * 2 + this.handleDiam * 2, height: this.minHeight}
            }),
            interact.modifiers.restrictEdges({
              outer: this.$refs.boundingInner.getBoundingClientRect(),
            })
          ],

          inertia: false
        })
      }
    },

    /**
     * Method for calling the custom sign context menu
     * @arg event the context menu call event
     */
    openContextMenu (event, additionalX = 0, additionalY = 0) {
      event.preventDefault();
      this.$store.dispatch("changeContextMenu", false);
      this.contextSign = 0;
      let target = event.target;
      const targetID = target.getAttribute("signID");
      this.contextSign = targetID;
      let boundingRect = this.getSignRect(targetID);

      this.placeSignOnTop(targetID);
      this.contextPos.x = boundingRect.right + additionalX;
      if (this.contextPos.x + this.contextMenuWidth >= window.innerWidth) {
        this.contextPos.x = boundingRect.x + additionalX - this.contextMenuWidth - 5; 
      }
      if (this.signs[targetID].isSelected) {
        this.contextPos.y = boundingRect.top + additionalY;
      } else {
        this.contextPos.y = boundingRect.top;
      }
      
      
      this.selectSign(targetID);
      this.$store.dispatch("changeContextMenu", true);

      setTimeout(function () {this.moveContextIntoView()}.bind(this), 0);
    },

    moveContextIntoView () {
      if (this.contextPos.y + document.getElementById("context-menu").offsetHeight >= window.innerHeight) {
        this.contextPos.y = this.contextPos.y - (this.contextPos.y + document.getElementById("context-menu").offsetHeight - window.innerHeight);
      }
    },

    /**
     * Inititalizes the dragging and resizing settings and event listeners
     */
    initSignInteraction () {
      interact(".sign-container.bound-inner").unset()
      interact(".room-direction").unset();
      interact(".path").unset();
      interact(".body-part").unset();
      interact(".sign-container.bound-inner").draggable({
        inertia: false,
        restrict: {
          restriction: this.$refs.boundingInner.getBoundingClientRect(),
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
        },
        autoScroll: false,

        // functions to call on event
        onstart: this.dragStart,
        onmove: this.dragMove,
        onend: this.dragEnd
      });
      interact(".room-direction").draggable({
        inertia: false,
        restrict: {
          restriction: this.$refs.boundingOuterLeft.getBoundingClientRect(),
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
        },
        autoScroll: false,

        // functions to call on event
        onstart: this.dragStart,
        onmove: this.dragMove,
        onend: this.dragEnd
      });
      interact(".path").draggable({
        inertia: false,
        restrict: {
          restriction: this.$refs.boundingOuterRight.getBoundingClientRect(),
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
        },
        autoScroll: false,

        // functions to call on event
        onstart: this.dragStart,
        onmove: this.dragMove,
        onend: this.dragEnd
      });
      interact(".body-part").draggable({
        inertia: false,
        restrict: {
          restriction: this.$refs.boundinColumnDef.getBoundingClientRect(),
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
        },
        autoScroll: false,

        // functions to call on event
        onstart: this.dragStart,
        onmove: this.dragMove,
        onend: this.dragEnd
      });
    },

    

    /**
     * Inititalizes the clicking event listener
     */
    initSignClick () {
      interact(".sign-container").on("tap", this.clickSign)
      .on("doubletap", this.doubleClickSign);
    },

    /**
     * The click event listener, fires a selection request to the score component
     * @arg event the click event
     */
    clickSign (event) {
      if (event.button == 0) {
        const targetID = event.target.getAttribute("signID")
        this.placeSignOnTop(targetID);
        this.selectSign(targetID, (event.ctrlKey || event.metaKey));
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
      shadow.isShadow = true;
      this.$store.dispatch("editSigns", {type: "add", data: shadow});
      this.makeLocalSignData();
    },

    checkStartingPos(y, height) {
      if (y + height > (this.innerCanvasDimFull.y - this.minHeight - this.barHeight / this.beats * 2- this.startBarOffset)) {
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
      this.interacting = true;
      this.keyCommandsEnabled = false;
      let target = event.target;
      if (this.contextActive) {
        this.contextWasActive = true;
      }
      this.$store.dispatch("changeContextMenu", false);
      
      const targetID = target.getAttribute("signID");
      
      //get current element position
      let y = (this.localSignData[targetID].y || 0) + event.dy;
      target.setAttribute("start-y", y);
      target.setAttribute("start-h", this.localSignData[targetID].height);

      this.makeShadow(this.signs[targetID]);

      //apply dragging styling to group
      target.classList.add("dragging");

       //move element to top of Render
      this.placeSignOnTop(targetID);
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
      let targetElem = this.localSignData[targetID];
      let shadowElem = this.localSignData[shadowID];
      let y = (parseFloat(target.getAttribute("data-y")) || 0);

      // keep the same position when resizing from the top
      y += event.deltaRect.top;
      

      let actualY = Math.round(y / this.blocksizeY) * this.blocksizeY;
      let newHeight = targetElem.height + y - actualY;
      let actualH = Math.round(newHeight / this.blocksizeY) * this.blocksizeY;

      // update the element height (-14 for the handles)
      this.localSignData[targetID].height = (event.rect.height - this.handleDiam * 2);
      //this.$store.dispatch("editSigns", {type: "changeSignData", index: targetID, data: {beatHeight: (this.localSignData[targetID].height / this.minHeight)}});
      //check if the element was resized from the top
      if (event.deltaRect.top != 0) {
        //top handle -> adjust y position to nearest grid position
        this.localSignData[shadowID].x = shadowElem.x;
        this.localSignData[shadowID].y = actualY;
      }

      //stop resizing at the starting line
      if (!this.checkStartingPos(actualY, actualH)) {
        this.localSignData[shadowID].height = actualH;
        //this.$store.dispatch("editSigns", {type: "changeSignData", index: shadowID, data: {beatHeight: (this.localSignData[shadowID].height / this.minHeight)}});
      }

      //set new y data
      target.setAttribute("data-y", y);
      
      //translate group
      this.localSignData[targetID].y = this.localSignData[targetID].y + event.deltaRect.top;
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
      let shadowElem = this.localSignData[shadowID];

      let y = parseFloat(target.getAttribute("data-y"));
      let actualY = Math.round(y / this.blocksizeY) * this.blocksizeY;

      //check if the element was resized from the top
      if (event.deltaRect.top != 0) {
        //top handle -> adjust y position to nearest grid position
        target.setAttribute("data-y", actualY);
        this.localSignData[targetID].y = actualY;
      }
      this.localSignData[targetID].height = shadowElem.height;
      this.$store.dispatch("editSigns", {type: "changeSignData", index: targetID, data: {beatHeight: (this.localSignData[targetID].height / this.minHeight)}});
      
      if (actualY == 0 && this.localSignData[targetID].y != 0) {
        this.localSignData[targetID].y = 0;
      }
      this.calcBeatMove (targetID, parseFloat(target.getAttribute("start-y")), parseFloat(target.getAttribute("start-h")), this.localSignData[targetID].y, this.localSignData[targetID].height);
      this.removeSign(shadowID);
      target.classList.remove("dragging");
      this.interacting = false;
      this.makeLocalSignData();
      this.selectSign(targetID);
      if (this.contextWasActive) {
        this.openContextMenu(event, 0, actualY - y);
        this.contextWasActive = false;
      }
      this.$store.dispatch("saveStateInHistory");
    },

    /**
     * The resize start event listener for the horizontal bow resizing, creats the shadow element for resizing
     * @arg event the resize-start event
     */
    bowResizeStart (event) {
      this.keyCommandsEnabled = false;
      this.interacting = true;
      let target = event.target;
      if (this.contextActive) {
        this.contextWasActive = true;
      }
      this.$store.dispatch("changeContextMenu", false);
      
      const targetID = target.getAttribute("signID");
      
      //get current element position
      let x = (this.localSignData[targetID].x || 0) + event.dx;
      target.setAttribute("start-x", x);
      target.setAttribute("start-w", this.localSignData[targetID].width);

      this.makeShadow(this.signs[targetID]);

      //apply dragging styling to group
      target.classList.add("dragging");

       //move element to top of Render
      this.placeSignOnTop(targetID);
    },

    /**
     * The bow resize move event listener, resizes the event target along the x axis
     * @arg event the resize-move event
     */
    bowResizeMove (event) {
      //get the saved x and y data
      let target = event.target;
      const targetID = target.getAttribute("signID");
      const shadowID = this.signs.length - 1;
      let targetElem = this.localSignData[targetID];
      let shadowElem = this.localSignData[shadowID];
      let x = (parseFloat(target.getAttribute("data-x")) || 0);

      // keep the same position when resizing from the left
      x += event.deltaRect.left;
      

      let actualX = Math.round(x / this.blocksizeX) * this.blocksizeX;
      let newWidth = targetElem.width + x - actualX;
      let actualW = Math.round(newWidth / this.blocksizeX) * this.blocksizeX;

      // update the element width (-14 for the handles)
      this.localSignData[targetID].width = (event.rect.width - this.handleDiam * 2);
      //check if the element was resized from the left
      if (event.deltaRect.left != 0) {
        //top handle -> adjust x position to nearest grid position
        this.localSignData[shadowID].x = actualX;
        this.localSignData[shadowID].y = shadowElem.y;

      }

      this.localSignData[shadowID].width = actualW;

      //set new x data
      target.setAttribute("data-x", x);
      
      //translate group
      this.localSignData[targetID].x = targetElem.x + event.deltaRect.left;
    },

    /**
     * The bow resize end listener, sets the actual width/position after a resize
     * @arg event the resize-end event
     */
    bowResizeEnd (event) {
      this.keyCommandsEnabled = true;
      let target = event.target;
      const targetID = target.getAttribute("signID");
      const shadowID = this.signs.length - 1;
      let shadowElem = this.localSignData[shadowID];

      let x = parseFloat(target.getAttribute("data-x"));
      let actualX = Math.round(x / this.blocksizeX) * this.blocksizeX;

      //check if the element was resized from the left
      if (event.deltaRect.left != 0) {
        //left handle -> adjust x position to nearest grid position
        target.setAttribute("data-x", actualX);
        this.localSignData[targetID].x = actualX;
      }
      this.localSignData[targetID].width = shadowElem.width;

      if (actualX == this.columnWidth && this.localSignData[targetID].x != this.columnWidth) {
        this.localSignData[targetID].x = this.columnWidth;
      }
      //calculate new column
      this.calcColumnMove(targetID, parseFloat(target.getAttribute("start-x")), parseFloat(target.getAttribute("start-w")), this.localSignData[targetID].x, this.localSignData[targetID].width);
      this.removeSign(shadowID);
      target.classList.remove("dragging");
      this.interacting = false;
      this.makeLocalSignData();
      this.selectSign(targetID);
      if (this.contextWasActive) {
        this.openContextMenu(event, actualX - x);
        this.contextWasActive = false;
      }
      this.$store.dispatch("saveStateInHistory");
    },

    /**
     * The drag-start event listener, sets up the shadow element for the dragging
     * @arg event the drag-start event
     */
    dragStart (event) {
      this.keyCommandsEnabled = false;
      this.interacting = true;

      let target = event.target;
      const targetID = target.getAttribute("signID");
      this.interactingSigns.push(targetID);
      if (this.contextActive) {
        this.contextWasActive = true;
      }

      //fire a selection request to the score component for proper styling
      this.selectSign(-1);
      
      //get current element position
      let  x = (this.localSignData[targetID].x || 0) + event.dx;
      let  y = (this.localSignData[targetID].y || 0) + event.dy;
      target.setAttribute("start-x", x);
      target.setAttribute("start-y", y);
      target.setAttribute("start-h", this.localSignData[targetID].height);

      this.makeShadow(this.signs[targetID]);

      //apply dragging styling to group
      target.classList.add("dragging");

       //move element to top of Render
      this.placeSignOnTop(targetID);
    },

    /**
     * The drag-move event listener, moves the sign and the shadow element
     * @arg event the drag-move event
     */
    dragMove: function(event) {
      let target = event.target;
      
      const targetID = target.getAttribute("signID");
      const shadowID = this.signs.length - 1;
      let targetElem = this.localSignData[targetID];
      this.localSignData[shadowID].height = targetElem.height;
      //this.$store.dispatch("editSigns", {type: "changeSignData", index: shadowID, data: {beatHeight: (this.localSignData[shadowID].height / this.minHeight)}});
      const isBow = (this.signs[targetID].baseType == "RelationshipBow");
      const isBodyPart = (this.signs[targetID].baseType == "BodyPartSign");
      const isPath = (this.signs[targetID].baseType == "PathSign");
      const isRoomSign = (this.signs[targetID].baseType == "RoomDirectionSign");
     
      //get the current position from the x and y chords
      let  x = (this.localSignData[targetID].x || 0) + event.dx;
      let  y = (this.localSignData[targetID].y || 0) + event.dy;

      const columnOffset = (this.columnWidth - this.signWidth) / 2;

      let actualX = Math.round(x / this.blocksizeX) * this.blocksizeX + columnOffset;
      let actualY = Math.round(y / this.blocksizeY) * this.blocksizeY;
      if (isRoomSign && actualX >= this.$refs.boundingOuterLeft.getBBox().x + this.$refs.boundingOuterLeft.getBBox().width) {
        
        actualX = actualX - this.columnWidth;
      } else if (!isRoomSign && !isPath && actualX >= this.$refs.boundingOuterRight.getBBox().x) {
        actualX = actualX - this.columnWidth;
      } else if (isPath) {
        
        if (actualX >= this.$refs.boundingOuterRight.getBBox().x + this.$refs.boundingOuterRight.getBBox().width) {
          actualX = actualX - this.columnWidth;
        } else if (actualX < this.$refs.boundingOuterRight.getBBox().x) {

          actualX = actualX + this.columnWidth;
        }
      } else
      if (isBow) {
        actualX = actualX - columnOffset;
      }
      
      //check if the current position is above (below in actual browser) the starting line -> snap there
      if (this.checkStartingPos(actualY, this.localSignData[targetID].height)) {
        if (isBow) {
          actualY = this.innerCanvasDimFull.y - this.minHeight - this.barHeight / this.beats * 2 + this.blocksizeY;
        } else if (isBodyPart) {
          actualY = this.innerCanvasDimFull.y - this.minHeight - this.barHeight / this.beats * 2 + this.blocksizeY * 2 + this.startBarOffset;
        } else if (!this.signs[targetID].resizable) {
          actualY = this.innerCanvasDimFull.y - this.barHeight / this.beats * 2 - this.minHeight + this.blocksizeY;
        } else {
          this.localSignData[shadowID].height = (this.barHeight / this.beats * 2);
          //this.$store.dispatch("editSigns", {type: "changeSignData", index: shadowID, data: {beatHeight: (this.localSignData[shadowID].height / this.minHeight)}});
          actualY = this.innerCanvasDimFull.y - this.minHeight - this.barHeight / this.beats * 2;
        }
      }

        //set new element position
        this.localSignData[targetID].x = x;
        this.localSignData[targetID].y = y;

        //set new shadow element position
        this.localSignData[shadowID].x = actualX;
        this.localSignData[shadowID].y = actualY;
    },
    
    /**
     * The drag-end event listener, places the sign at the proper position and removes the shadow
     * @arg event the drag-move event
     */
    dragEnd (event) {
      this.keyCommandsEnabled = true;
      let target = event.target;

      const targetID = target.getAttribute("signID");

      const isBow = (this.signs[targetID].baseType == "RelationshipBow");
      const isBodyPart = (this.signs[targetID].baseType == "BodyPartSign");
      const isPath = (this.signs[targetID].baseType == "PathSign");
      const isRoomSign = (this.signs[targetID].baseType == "RoomDirectionSign");
      let bodyPartBelowScore = false;

      target.classList.remove("dragging");

      //get the new x and y chords
      let x = this.localSignData[targetID].x;
      let y = this.localSignData[targetID].y;

      const columnOffset = (this.columnWidth - this.signWidth) / 2;
      let screenX = Math.round(x / this.blocksizeX) * this.blocksizeX + columnOffset;
      let screenY = Math.round(y /this.blocksizeY) * this.blocksizeY;
      if (isRoomSign && screenX >= this.$refs.boundingOuterLeft.getBBox().x + this.$refs.boundingOuterLeft.getBBox().width) {
        screenX = screenX - this.columnWidth;
      } else if (!isRoomSign && !isPath && screenX >= this.$refs.boundingOuterRight.getBBox().x) {
        screenX = screenX - this.columnWidth;
      } else if (isPath) {
        if (screenX >= this.$refs.boundingOuterRight.getBBox().x + this.$refs.boundingOuterRight.getBBox().width) {
          screenX = screenX - this.columnWidth;
        } else if (screenX < this.$refs.boundingOuterRight.getBBox().x) {
          screenX = screenX + this.columnWidth;
        }
      } else if (isBow) {
        screenX = screenX - columnOffset;
      }
      
      
      //check if the current position is above (below in actual browser) the starting line -> snap there
      if (this.checkStartingPos(screenY, this.localSignData[targetID].height)) {
        if (isBodyPart) {
          screenY = this.innerCanvasDimFull.y - this.minHeight - this.barHeight / this.beats * 2 + this.blocksizeY * 2;
          bodyPartBelowScore = true;
        } else if (!this.signs[targetID].resizable || isBow) {
          screenY = this.innerCanvasDimFull.y - this.barHeight / this.beats * 2;
        } else {
          this.localSignData[targetID].height = (this.barHeight / this.beats * 2);
          this.$store.dispatch("editSigns", {type: "changeSignData", index: targetID, data: {beatHeight: (this.localSignData[targetID].height / this.minHeight)}});
          screenY = this.innerCanvasDimFull.y - this.barHeight / this.beats * 2 - this.minHeight;
          this.localSignData[targetID].canResize = false;
        }
      } else {
        this.localSignData[targetID].canResize = true;
      }

      this.localSignData[targetID].x = screenX;
      this.localSignData[targetID].y = screenY;
      target.setAttribute("data-y", screenY);

      let columnsMoved = (parseFloat(target.getAttribute("start-x")) - this.localSignData[targetID].x) / -this.blocksizeX;
      if (isBow) {
        this.$store.dispatch("editSigns", {type: "changeSignData", index: targetID, data: {col: (this.signs[targetID].col + columnsMoved), colRight: (this.signs[targetID].colRight + columnsMoved)}});
      } else {
        this.$store.dispatch("editSigns", {type: "changeSignData", index: targetID, data: {col: (this.signs[targetID].col + columnsMoved)}});
      }
      
      if (this.signs[targetID].col >= 0 ) {
        this.$store.dispatch("editSigns", {type: "changeSignData", index: targetID, data: {side: "right"}});
      } else {
        this.$store.dispatch("editSigns", {type: "changeSignData", index: targetID, data: {side: "left"}});
      }

      this.calcBeatMove(targetID, parseFloat(target.getAttribute("start-y")), parseFloat(target.getAttribute("start-h")), this.localSignData[targetID].y, this.localSignData[targetID].height);
      if (isBodyPart && bodyPartBelowScore) {
        this.$store.dispatch("editSigns", {type: "changeSignData", index: targetID, data: {bar: -1, beat: 0}});
      }
      const shadowID = this.signs.length - 1;
      this.removeSign(shadowID);
      this.interacting = false;
      this.makeLocalSignData();
      this.interactingSigns = [];
      this.selectSign(targetID);
      if (this.contextWasActive) {
        this.openContextMenu(event, screenX - x, screenY - y - this.handleDiam);
        this.contextWasActive = false;
      }

      
      this.$store.dispatch("saveStateInHistory");
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

#canvas {
  margin: auto auto;
  display: block;
  box-sizing: border-box;
  border: 1px solid #c1c1c1;
  border-top: none;
}

svg text {
  user-select: none;
}

.shadow {
  fill: #a42a42;
  stroke-width: 2;
  stroke: rgb(0,0,0);
  
}

.column-handles {
  width: 135px;
  height: 30px;
  position: absolute;
  display: flex;
  align-items: center;
  transform: translateX(-20px);
  z-index: 1;
}

.bar-handles {
  width: 30px;
  height: var(--barHeight);
  position: absolute;
  z-index: 1;
}

.add-remove-container {
  cursor: pointer;
  --c1:white;
  --c2:black;
  --move: 0px;
  --rotate: 0deg;

  width: 30px;
  height: 30px;
  border-radius: 30px;
  

  display: block;
  padding: 9px;
  box-sizing: border-box;
  background:
    linear-gradient(var(--c1) 0 0) content-box,
    linear-gradient(var(--c1) 0 0) content-box,
    var(--c2);
  background-position:center;
  background-size: 100% 2px,2px 100%;
  background-repeat:no-repeat;

  transform: translateY(var(--move)) rotateZ(var(--rotate));
}

.column-handles > .add-remove-container {
  margin: 10px 5px;
}

.bar-handles > .add-remove-container {
  margin: 0 0 calc(var(--barHeight) / 3 + 3px) 0;
  --move: -15px;
}

.add-remove-container.red {
  --c2:#ff3e3e;
  --rotate: 45deg;
}

.add-remove-container.green {
  --c2:green;
}
.add-remove-container.invisible {
  opacity: 0.9;
  cursor: not-allowed;
  --c2: #a3a3a3;
}

.invis {
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
}

</style>
