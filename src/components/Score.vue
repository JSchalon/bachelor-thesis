<template>
    <div id="canvasContainer" @scroll="getScroll" ref="container" @mousedown.self="selectSign(-1)">
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
            <rect :x="columnWidth" :y="innerCanvasDim.y - blocksizeY + 5" :width="innerCanvasDim.x" :height="blocksizeY" ref="boundinColumnDef" />
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
          </g>
          <g :transform="'translate(' + outerCanvasMargin + ', ' + canvasMarginTop +')'">
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
        <div v-if="selectedBar == 0" :style="'transform: translateY(' + -(blocksizeY + 15) + 'px)'">
          <p class="add-remove-container red invisible" />
        </div>
        <p v-if="selectedBar > 0" class="add-remove-container green" @click="addBar(selectedBar)"/>
        <p v-if="selectedBar == 0" class="add-remove-container invisible" :style="'transform: translateY(' + -(blocksizeY + 10) + 'px)'"/>
      </div>

      <div class="desc-box">
      <div class="box" v-if="storeDescActive">
        <h2 class="title is-5">{{$store.state["title"]}} <button class="delete is-large custom-close" aria-label="close" @click="this.$store.dispatch('changeSettings', {showScoreDescription: !storeDescActive});"><img src="@/assets/images/interaction-menu/x.svg" class="option-img"></button> </h2>
        <p><strong>Author: </strong> {{$store.state["author"]}}</p>
        <p><strong>Columns: </strong> {{$store.state["columnsLeft"] + $store.state["columnsRight"]}}</p>
        <p><strong>Bars: </strong> {{$store.state["bars"]}}</p>
        <p><strong>Beats: </strong> {{$store.state["beatsPerBar"]}}</p>
        <p><strong>Beat duration: </strong> {{$store.state["beatDuration"] + " " + $store.state["timeUnit"].slice(0,3)}}</p>
        <p><strong>Description: </strong></p>
        <p>{{$store.state["description"]}}</p>
      </div>
      <button v-else class="button has-background-white is-size-5 desc-btn" @click="this.$store.dispatch('changeSettings', {showScoreDescription: !storeDescActive});">!</button>
    </div>
    </div>
</template>

<script>
import interact from "interactjs";

export default {
  name: 'Score',
  inject: ["signWidth", "barHeight", "columnWidth", "handleDiam", "outerCanvasMargin", "startBarOffset","contextMenuWidth"],
  data() {
    return {
      canvasScroll: {x: 0, y:0},
      contextPos: {x: 0, y: 0},
      contextSign: 0,
      contextWasActive: false,
      columnHandlesActive: false,
      selectedColumnTranslate: {x: 0, y: 0},
      barHandlesActive: false,
      selectedBarTranslate: {x: 0, y: 0},
      interactingSigns: [],
      localSignData: [],
      canMoveGhost: false,
      interactBox: {x: 0, y: 0, x2: 0, y2: 0},
      interactBoxHasPath: false,
      interactBoxHasRoomDir: false,
      multiInteract: false,
      interactOverflow: {x: 0, y: 0},
    };
  },
  computed: {
    // vuex state var loaders 
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
    duplicateSign () {
      return this.$store.state["duplicateSignActive"];
    },
    interacting () {
      return this.$store.state["interacting"];
    },
    storeDescActive () {
      return this.$store.state['showScoreDescription'];
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
    ghostOverCanvas () {
      return this.$store.state["ghostOverCanvas"];
    },
    ghostPos () {
      return this.$store.state["ghostPos"];
    },
    ghostActive () {
      return this.$store.state["ghostActive"];
    },
    /**
     * needed, because barHeight does not update automatically
     * @returns the bar height 
     * 
     */
    barH () {
      return this.barHeight();
    },
    /**
     * @returns the translations of the column handles
     */
    columnHandleTranslate () {
      return "left: " + this.selectedColumnTranslate.x + "px; top: " + this.selectedColumnTranslate.y + "px;";
    },
    /**
     * @returns the translation of the bar handles
     */
    barHandleTranslate () {
      return "left: " + this.selectedBarTranslate.x + "px; top: " + this.selectedBarTranslate.y + "px;";
    },
    /**
     * @returns the column width (used for the sign snapping)
     */
    blocksizeX () {
      return this.columnWidth;
    },
    /**
     * @returns the beat height (used for the sign snapping)
     */
    blocksizeY () {
      return this.barH / this.beats;
    },
    /**
     * @returns the horizontal and vertical dimensions of the canvas
     */
    canvasDimensions () {
      return {
        x: this.columnWidth * (this.columnsLeft + this.columnsRight + 2) + 2 * this.outerCanvasMargin, 
        y: this.barH * this.bars+ 3 * this.blocksizeY + this.outerCanvasMargin + this.startBarOffset
      };
    },
    /**
     * @returns the inner horizontal and vertical dimensions of the canvas
     */
    innerCanvasDimFull () {
      return {x: this.columnWidth * (this.columnsLeft + this.columnsRight + 2), y: this.barH * this.bars+ 3 * this.blocksizeY + this.startBarOffset};
    },
    /**
     * @returns the x and y of right-most column
     */
    innerCanvasDimRight () {
      return {x: this.columnWidth * (this.columnsLeft + this.columnsRight + 1), y: this.barH * this.bars+ 3 * this.blocksizeY + this.startBarOffset};
    },
    /**
     * @returns the x and y of middle columns
     */
    innerCanvasDim () {
      return {x: this.columnWidth * (this.columnsLeft + this.columnsRight), y: this.barH * this.bars+ 3 * this.blocksizeY + this.startBarOffset};
    },
    /**
     * @returns the top canvas margin
     */
    canvasMarginTop () {
      return this.outerCanvasMargin / 2;
    },
    /**
     * @returns whether there are selected signs
     */
    signsSelected () {
      if (this.selectedSigns.length == 0) {
        return false;
      } else {
        return true;
      }
    },
  },
  watch: {
    /**
     * observes changes in the signs and recalculates local svg sign data
     */
    signs: {
      deep: true,
      handler() {
        if (!this.interacting) { // if there is no interaction happening -> redo the local signdata
          this.makeLocalSignData();
        }
      }
    },
    /**
     * observes changes in whether the context menu
     * @param value the contextActive boolean 
     */
    contextActive (value) {
      if (value && this.selectedSigns.length >= 1) { // context active && sign selected -> add context
        const elem = this.$refs.bounding.querySelector(".sign-container[signID='"+ this.selectedSigns[0] + "']");
        elem.dispatchEvent(new Event("contextmenu"));
      }
    },
    /**
     * observes changes in the ghost over canvas bool
     * @param bool the ghost over canvas boolean 
     */
    ghostOverCanvas (bool) {
      if (bool) { // ghost over canvas -> 
        // get the ghost position and add it
        let pos = this.getGhostScorePos(); 
        this.addSign(pos, false);
        this.canMoveGhost = true;
      } else if (this.ghostActive) { // ghost not over canvas but active -> remove the sign on the score
        this.removeSign(this.signs.length - 1);
        this.canMoveGhost = false;
      } else { // ghost not active -> can't move
        this.canMoveGhost = false;
      }
    },
    /**
     * watches the changes in the ghost on the score
     */
    ghostPos () {
      if (this.ghostOverCanvas && this.canMoveGhost) { // only if the ghost is active and over the canvas
        let pos = this.getGhostScorePos();
        pos.colRight = pos.col + 1;
        // change sign data of the ghost sign on the canvas
        this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.length - 1, data: pos});
      }
    }
  },
  mounted () {
    // add event listeners for the keydown and resize events
    window.addEventListener('keydown', this.keyEvent);
    window.addEventListener('resize', this.initInteractListeners);
    
    // create the local sign data
    this.makeLocalSignData();
    // initialize the interact event listeners
    this.initInteractListeners();

    // change the current library sign (needed to add it)
    this.$store.dispatch("changeCurSign", {signData: {isSelected: false, holding: false, baseType: "TurnSign", beatHeight: 2, signType: "counterClockwise", definition: false, resizable: true}});
    // add the sign
    setTimeout(() => {
      this.addSign({bar: 1, beat: 0,  col: 2, side: "right", }, false);
    }, 5);
    // delete the sign, add and remove bar
    // this is neccessary because interact listeners don't properly work without it (for some reason)
    setTimeout(() => {  
      this.removeSign(this.signs.length - 1);
      this.addBar(this.bars+1);
      this.removeBar(this.bars);
      this.makeLocalSignData();
      this.$store.dispatch("clearHistory");
    }, 8);
    
},
  unmounted () {
    //remove all interact listeners on unmount to avoid weird behavior
    interact(".sign-container.bound-inner").unset()
    interact(".room-direction").unset();
    interact(".path").unset();
    interact(".body-part").unset();
    interact(".normal").unset();
    interact(".bow").unset();
    interact(".sign-container").unset();
  },
  methods: {
    /**
     * the canvas scrolling event listener
     * @param event the scrolling event 
     */
    getScroll (event) {
      // no interact event going on -> reset the interact listeners (used to correct bounding boxes for interact)
      if (!this.interacting) {
        this.initInteractListeners();
      } else {
        // if there is an interact event going on (possible with mouse scoll) -> move currently interacting signs in the scroll direction 
        for (let index of this.interactingSigns) {
          this.localSignData[index].x = (this.localSignData[index].x + (this.canvasScroll.x - event.target.scrollLeft));
          this.localSignData[index].y = (this.localSignData[index].y - (this.canvasScroll.y - event.target.scrollTop));
        }
        //move the shadow element as well
        const shadowIndex = this.signs.length - 1;
        let shadowX = (this.localSignData[shadowIndex].x + (this.canvasScroll.x - event.target.scrollLeft));
        let shadowY = (this.localSignData[shadowIndex].y - (this.canvasScroll.y - event.target.scrollTop));

        this.localSignData[shadowIndex].x = shadowX;
        this.localSignData[shadowIndex].y = shadowY;
      }

      const offsetBox = this.$refs.container.getBoundingClientRect();
      if (this.canvasScroll.x != event.target.scrollLeft && this.columnHandlesActive) { // scrolling horizontally, column handles active -> move them
        // fix for when an introduction is highlighting the score -> it applies position: relative, which changes the handle position
        if (this.$refs.container.classList.contains("highlighted")) { 
          // change the grid handle position with the new scrolling position + the offset of the canvas from the top left
          this.placeGridHandles({type: "col", x: this.selectedColumnTranslate.x + (this.canvasScroll.x - event.target.scrollLeft) + offsetBox.x, y: this.selectedColumnTranslate.y - document.getElementById("canvasContainer").scrollTop - (this.barH / 2 - 15) + offsetBox.y});
        } else {
          // change the grid handle position with the new scrolling position
          this.placeGridHandles({type: "col", x: this.selectedColumnTranslate.x + (this.canvasScroll.x - event.target.scrollLeft), y: this.selectedColumnTranslate.y - document.getElementById("canvasContainer").scrollTop - (this.barH / 2 - 15)});
        }
      }
      
      if (this.canvasScroll.y != event.target.scrollTop && this.barHandlesActive) { // scrolling vertically, bar handles active -> move them 
        // fix for when an introduction is highlighting the score -> it applies position: relative, which changes the handle position
        if (this.$refs.container.classList.contains("highlighted")) {
          // change the grid handle position with the new scrolling position + the offset of the canvas from the top left
          this.placeGridHandles({type: "bar", x: this.selectedBarTranslate.x - (this.columnWidth - this.signWidth - 15) + offsetBox.x, y: this.selectedBarTranslate.y + (this.canvasScroll.y - event.target.scrollTop) + offsetBox.y});
        } else {
          // change the grid handle position with the new scrolling position
          this.placeGridHandles({type: "bar", x: this.selectedBarTranslate.x - (this.columnWidth - this.signWidth - 15), y: this.selectedBarTranslate.y + (this.canvasScroll.y - event.target.scrollTop)});
        }
      }
      // save new canvas scroll position
      this.canvasScroll = {x: event.target.scrollLeft, y: event.target.scrollTop};
    },



    /**
     * calculates the position of the placing sign ghost on the canvas
     * @returns the score position and dimensions of the new sign
     */
    getGhostScorePos () {
      // calculate the position of the ghost in relation to the canvas
      const canvasRect = this.$refs.canvas.getBoundingClientRect();
      let canvasPos = {x: this.ghostPos.x - canvasRect.x, y: this.ghostPos.y - canvasRect.y};

      // calculate the nearest snapping point from the ghost sign position
      let signX = Math.round(canvasPos.x / this.blocksizeX) * this.blocksizeX - this.columnWidth;
      if (signX < this.columnWidth) { // sign would snap the left-most column -> move it one to the right
        signX = this.columnWidth;
      } else if (signX > this.innerCanvasDim.x) { // sign would snap the right-most column -> move it one to the left
        signX = this.innerCanvasDim.x;
      }
      let signY = Math.round(canvasPos.y / this.blocksizeY) * this.blocksizeY - this.blocksizeY;
      if (signY < 0) { // if the sign would snap outside the score, move it down
        signY = 0;
      }
      // calculate the column, bar and beat from the data
      const totalCol = signX / this.columnWidth;
      let col = totalCol - this.columnsLeft - 1;
      let bar = this.bars - Math.floor(signY / this.barH);
      let beat = Math.round(this.beats - Math.round((signY - (this.bars-bar) * this.barH) / this.blocksizeY) - this.curLibrarySign.signData.beatHeight);

      // set the beat height and the bar
      let beatHeight = this.curLibrarySign.signData.beatHeight;
      let side = "left";
      
      if (this.curLibrarySign.signData.baseType == "BodyPartSign" || this.curLibrarySign.signData.baseType == "PropSign") {
        // snap body part sign and prop signs to the bottom
        bar = -1;
        beat = 0;
      } else if (this.checkStartingPos(signY, this.curLibrarySign.signData.beatHeight * this.blocksizeY) && this.curLibrarySign.signData.resizable) { // sign in starting position
        // set bar, beat and beatHeight accordingly
        bar = 0;
        beat = 0;
        if (this.curLibrarySign.signData.baseType != "RelationshipBow") { // dont verticall resize bows
          beatHeight = 2;
        }
      }
      // relationship bows need 2 columns -> snap one to the left if too far right
      if (this.curLibrarySign.signData.baseType == "RelationshipBow" && col >= this.columnsRight - 1) {  
        col = this.columnsRight - 2;
      }
      
      if (this.curLibrarySign.signData.baseType == "RoomDirectionSign") { // room directionsign signs -> move to left-most column
        col = -this.columnsLeft - 1;
      } else if (this.curLibrarySign.signData.baseType == "PathSign") { // path signs -> move to right-most column
        col = this.columnsRight;
      }
      // set side
      if (col >= 0) {
        side = "right";
      }
      return {col: col, bar: bar, beat: beat, beatHeight: beatHeight, side: side};
    },



    /**
     * creates the local sign data, which stores the svg position and dimensions of signs
     */
    makeLocalSignData() {
      this.localSignData = [];
      // iterate over all signs
      for (let elem of this.signs) {
        if (this.signs.indexOf(elem) == 0) { // first sign is a dummy sign for interact
          this.localSignData.push({height: 0, x: 0, y: 0, purpose: "dummy sign"})
        } else {
          let elemData = {canResize: true};
          
          // calculate height by the signs height in beats and the beat height in svg chords
          elemData.height = elem.beatHeight * this.blocksizeY;

          // calculate the x positon by the columnwidth * the column of the sign + the margin between the outer edges of the column 
          elemData.x = (this.columnsLeft + 1 + elem.col) * this.columnWidth + (this.columnWidth - this.signWidth) / 2;
          
          // calculate the y position
          if (elem.bar > 0) { // bar > 0 -> normal y calculation
            elemData.y = (this.bars - elem.bar) * this.barH + (this.beats - elem.beat) * this.blocksizeY - elemData.height;
          } else if (elem.bar == 0) { // sign in starting pos
            // can only resize relationship bows in starting position
            if (elem.baseType != "RelationshipBow") {
              elemData.canResize = false;
            }
            if (elem.resizable && elem.baseType != "RelationshipBow") { // sign resizable? (not relationship bow, they cant resize vertically)
              // move into starting position
              elemData.y = this.bars * this.barH + this.startBarOffset;
              if (elem.beatHeight != 2) { // not 2 beats high -> set as 2 beats high
                this.$store.dispatch("setInteracting", true);
                if ("isShadow" in elem && elem.isShadow) { // shadows are not saved to the xml score, as this would cause issues -> isshadow has to be set in vuex
                  this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.indexOf(elem), data: {beatHeight: 2, isShadow: true}});
                } else { // normal sign
                  this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.indexOf(elem), data: {beatHeight: 2}});
                } 
                this.$store.dispatch("setInteracting", false);
              }
            } else { // not vertically resizable -> set y as starting position + one beat
              elemData.y = this.bars * this.barH + this.startBarOffset + this.blocksizeY;
            }
          } else if (elem.bar == -1) { // bar == - 1 -> prop or body part
            // place below score and disable resizing
            elemData.y = this.bars * this.barH + 2 * this.blocksizeY + this.startBarOffset * 2;
            elemData.canResize = false;
          }

          if (elem.baseType == "RelationshipBow") { // relationship bows have a custom width
            // set width as the difference between left and right column
            elemData.width = (elem.colRight + 1 - elem.col) * this.columnWidth;
            // remove the horizontal offseet
            elemData.x = elemData.x - (this.columnWidth - this.signWidth) / 2;
          } else {
            elemData.width = this.signWidth;
          }

          this.localSignData.push(elemData)
        }
      }
    },



    /**
     * sets the position of the grid handles on the score
     * @param data the type (col/bar), x and y position
     */
    placeGridHandles(data) {
      // remove context menu if active
      this.$store.dispatch("changeContextMenu", false);
      const offset = this.$refs.container.getBoundingClientRect();
      if (data.type == "col") { // column handles
        // set handles active
        this.columnHandlesActive = true;
        // fix for when an introduction is highlighting the score -> it applies position: relative, which changes the handle position
        if (this.$refs.container.classList.contains("highlighted")) {
          // set the grid handle position with the specified position, the current screen scroll and the offset of the canvas from the top left
          this.selectedColumnTranslate = {x: data.x - offset.x, y: (data.y + document.getElementById("canvasContainer").scrollTop) + this.barH / 2 - 15 - offset.y};
        } else {
          // set the grid handle position with the specified position and the current screen scroll
          this.selectedColumnTranslate = {x: data.x, y: (data.y + document.getElementById("canvasContainer").scrollTop) + this.barH / 2 - 15};
        }
      } else { // bar handles
        // set handles active
        this.barHandlesActive = true;
        // fix for when an introduction is highlighting the score -> it applies position: relative, which changes the handle position
        if (this.$refs.container.classList.contains("highlighted")) {
          // set the grid handle position with the specified position, the current screen scroll and the offset of the canvas from the top left
          this.selectedBarTranslate = {x: data.x - offset.x + this.columnWidth - this.signWidth - 15, y: data.y - offset.y};
        } else {
          // set the grid handle position with the specified position and the current screen scroll
          this.selectedBarTranslate = {x: data.x + this.columnWidth - this.signWidth - 15, y: data.y};
        }
      }
    },
    /**
     * updates the selected column in the vuex state
     * @param data the new column
     */
    updateSelectedColumn (data) {
      this.$store.dispatch("setSelectedColumn", data);
    },
    /**
     * updates the selected bar in the vuex state
     * @param data the new bar
     */
    updateSelectedBar (data) {
      this.$store.dispatch("setSelectedBar", data);
    },
    /**
     * selects signs in the lasso box
     * @param data the lasso dimensions from the grid
     */
    lassoSelect (data) {
      // disable multiselect (important for touch)
      if (this.multiselectActive) {
        this.$store.dispatch("toggleMultiSelect");
      }
      // unselect all
      this.selectSign(-1);
      // for all signs, check collision with box
      for (let index = 1; index < this.localSignData.length; index++) {
        const elem = this.localSignData[index];
        let overlap = !(
          elem.y > data.y + data.h || 
          elem.y + elem.height < data.y ||
          elem.x > data.x + data.w ||
          elem.x + elem.width < data.x
        );
        // overlap -> select sign
        if (overlap) {
          this.selectSign(index, true);
        }
      }
    },



    /**
     * Method for adding a column in the vuex state
     * @param beforeIndex the index to insert the new column after
     */
    addColumn(beforeIndex) {
      // disable context menu
      this.$store.dispatch("changeContextMenu", false);
      this.contextSign = 0;
      // set the side
      let side = "right";
      if (beforeIndex < 0) {
        side = "left";
      }
      // update the selected column if neccessary
      if (side == "left" && beforeIndex > this.selectedColumn) {
        this.updateSelectedColumn(this.selectedColumn - 1);
      }
      if (side == "right" && beforeIndex <= this.selectedColumn) {
        this.updateSelectedColumn(this.selectedColumn + 1);
      }
      // check if signs need to be moved
      for (let elem of this.signs) {
        if (elem.col >= beforeIndex) { // column to the left of sign -> move sign on the svg
          this.localSignData[this.signs.indexOf(elem)].x = (this.localSignData[this.signs.indexOf(elem)].x + this.columnWidth);
          if (side == "right") { // side is right -> also increase the signs column 
            this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.indexOf(elem), data: {col: elem.col + 1}});
          }
        }else if (elem.col < beforeIndex) { // sign before index
          if (side == "left") { // side left -> decrease signs column further
            this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.indexOf(elem), data: {col: elem.col - 1}});
          }
        }
      }
      // add the column, save history
      this.$store.dispatch('addColumn',side);
      this.$store.dispatch("saveStateInHistory");
      // reset interact listeners
      setTimeout(function () {this.initInteractListeners()}.bind(this), 1);
    },
    /**
     * Method for removing a column on the chosen side in the vuex state
     * @param col the column to remove  
     */
    removeColumn(col) {
      // disable context menu
      this.$store.dispatch("changeContextMenu", false);
      this.contextSign = 0;
      // set side
      let side = "left";
      if (col >= 0) {
        side = "right";
      }
      // check if the column can be removed (each side has at least 2 columns)
      if ((side == "left" && this.columnsLeft == 2) || (side == "right" && this.columnsRight == 2)) {
        return false;
      }
      // update the selected column
      if (side == "left") {
        this.updateSelectedColumn(col + 1)
      } else {
        this.updateSelectedColumn(col - 1)
      }
      let remove = [];
      // check all signs if they are in the removed column
      for (let elem of this.signs) {
        if (elem.col == col || (elem.baseType == "RelationshipBow" && elem.col < col && elem.colRight >= col)) {
          remove.push(this.signs.indexOf(elem));
          // item gets deleted -> no need to check its side and position
          continue;
        }

        if (side == "left") {
          if (elem.col > col) { // left side and to the right of the deleted column -> move svg position to the left
            this.localSignData[this.signs.indexOf(elem)].x = (this.localSignData[this.signs.indexOf(elem)].x - this.columnWidth);
          } else if (elem.col < col) { // left side and to the left of the deleted column -> increase signs column 
            this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.indexOf(elem), data: {col: (elem.col + 1)}});
          }
        } else { // right side
          if (elem.col > col) { // larger column than the removed column -> decrease column and move svg position
            this.localSignData[this.signs.indexOf(elem)].x = (this.localSignData[this.signs.indexOf(elem)].x - this.columnWidth);
            this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.indexOf(elem), data: {col: (elem.col - 1)}});
          }
        }
      }
      // remove the signs in the column
      for (let last = remove.length - 1; last >= 0; last--) {
        this.$store.dispatch("editSigns", {type: "delete", index: remove[last]});
        this.localSignData.splice(remove[last], 1);
      }
      // remove the column, save history
      this.$store.dispatch('removeColumn',side);
      this.$store.dispatch("saveStateInHistory");
      //reset interact listeners
      setTimeout(function () {this.initInteractListeners()}.bind(this), 1);
    },

    /**
     * Method for adding a bar in the vuex state
     * @param beforeIndex the index to insert the new bar before
     */
    addBar(beforeIndex) {
      //disable context menu
      this.$store.dispatch("changeContextMenu", false);
      this.contextSign = 0;

      if (beforeIndex > this.selectedBar) { // new bar above the selected one -> move the selected bar translation down
        this.selectedBarTranslate.y = this.selectedBarTranslate.y + this.barH;
      } else { // new bar below -> selected bar + 1
        this.updateSelectedBar (this.selectedBar + 1)
      }
      // move signs
      for (let elem of this.signs) {
        if (elem.bar < beforeIndex) { // sign below bar -> move sign down one bar
          this.localSignData[this.signs.indexOf(elem)].y = this.localSignData[this.signs.indexOf(elem)].y + this.barH;
        } else if (elem.bar >= beforeIndex) { // elem in bar or above -> increase bar count
          this.$store.dispatch("editSigns", {type: "changeSignData", index: this.signs.indexOf(elem), data: {bar: (elem.bar + 1), beat: elem.beat}});
        }
      }
      // add bar and save history
      this.$store.dispatch('addBar');
      this.$store.dispatch("saveStateInHistory");
      //reset interact listeners
      setTimeout(function () {this.initInteractListeners()}.bind(this), 1);
    },
    /**
     * Method for removing a bar in the vuex state
     * @param bar the bar to remove
     */
    removeBar(bar) {
      //only delete existing bars and always leave at least one bar
      if (this.bars < bar || this.bars == 1) {
        return false;
      }
      // disable context menu
      this.$store.dispatch("changeContextMenu", false);
      this.contextSign = 0;
      let remove = [];
      
      if (bar == this.bars) { // highest bar -> select bar below
        this.updateSelectedBar (bar - 1);
      } else { // else select bar above 
        this.selectedBarTranslate.y = this.selectedBarTranslate.y - this.barH
      }
      for (let elem of this.signs) {
        const index = this.signs.indexOf(elem);
        if (index > 0) {
          if (elem.bar == bar) { // sign in bar -> remove
            remove.push(this.signs.indexOf(elem));
            // removing sign -> no need to check its position
            continue;
          } else if (elem.bar < bar) { // sign below bar
            // check height of sign vs bar height, used to check if a sign is getting moved out of the score
            const offset = Math.abs(this.barH - this.localSignData[index].y);
            
            if ((this.localSignData[index].y - this.barH) >= 0) { // sign still in score after moving it up -> move it up
              this.localSignData[index].y = this.localSignData[index].y - this.barH;
            } else if (elem.beatHeight > 1) { // sign not in score and sign height > 1 beat
              // move it down one bar but up by its offset
              this.localSignData[index].y = this.localSignData[index].y + offset - this.barH;
              // remove the offset from the height
              this.localSignData[index].height = this.localSignData[index].height - offset;
              // change its height in vuex
              this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {beatHeight: (this.localSignData[index].height / this.blocksizeY)}});
            }
          } else { // sign above bar
            // reduce bar by 1
            this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {bar: elem.bar -1, beat: elem.beat}});
          }
        }
      }
      // remove signs in bar
      for (let last = remove.length - 1; last >= 0; last--) {
        this.$store.dispatch("editSigns", {type: "delete", index: remove[last]});
        this.localSignData.splice(remove[last], 1);
      }
      // remove the bar and save history
      this.$store.dispatch('removeBar');
      this.$store.dispatch("saveStateInHistory");
      // reset interact listeners
      setTimeout(function () {this.initInteractListeners()}.bind(this), 1);
    },



    /**
     * Method for adding a sign to the score
     * @param obj contains the col, bar and beat, where the sign is supposed to be placed 
     * @param permanent whether or not the sign will be permanently placed.
     */
    addSign (obj, permanent = true) {
      let signData = {};
      // load library signs signdata from vuex
      for (const [key, value] of Object.entries(this.curLibrarySign.signData)) {
        signData[key] = value;
      } 
      // set the score position from the object
      signData.col = obj.col;
      signData.bar = obj.bar;
      signData.beat = obj.beat;
      if (!("beatHeight" in signData)) { // no beatheight specified by library sign -> calculate it
        signData.beatHeight = this.curLibrarySign.height / this.blocksizeY;
      }
      
      // set side
      if (signData.col < 0) {
        signData.side = "left";
      } else {
        signData.side = "right";
      }

      // set the right column for relationship bows
      if (this.curLibrarySign.signData.baseType == "RelationshipBow") {
        if ("colRight" in obj) {
          signData.colRight = obj.colRight;
        } else {
          signData.colRight = signData.col + 1;
        }
      }
      
      //if the sign is larger than one beat and supposed to be placed at the top-most beat -> make it smaller to fit
      if (signData.bar == this.bars && signData.beat == this.beats - 1 && signData.beatHeight > 1) {
        signData.beatHeight = 1;
      }
      // add the sign
      this.$store.dispatch("editSigns", {type: "add", data: signData});
      if (permanent) { // place permanently -> delete library sign, save history
        this.$store.dispatch('changeCurSign',false);
        this.$store.dispatch("saveStateInHistory");
      }
      // recalculate local sign data
      this.makeLocalSignData();
    },
    /**
     * Method for removing a sign from the score
     * @param id the id of the sign to remove
     */
    removeSign (id = -1) {
      // unselect signs and remove contex menu
      this.selectSign(-1);
      this.$store.dispatch("changeContextMenu", false);
      if (id > 0) { // can't delete first sign
        // delete sign and remove from local signdata 
        this.$store.dispatch("editSigns", {type: "delete", index: id});
        this.localSignData.splice(id, 1);
        this.contextSign = 0;
      }
    },



    /**
     * Method for calculating and saving the new beat and bar of an element after a vertical move
     * @param index the index of the sign
     * @param startY the y position before moving (svg chords)
     * @param startH the height of the element before moving (svg chords)
     * @param endY the y position after moving (svg chords)
     * @param endH the height of the element after moving (svg chords)
     */
    calcBeatMove(index, startY, startH, endY, endH) {
      // calculate the beats moved
      let beatsMoved = ((endY + endH) - (startY + startH)) / -this.blocksizeY;
      let elem = this.signs[index];
      if (beatsMoved != 0) { // a move has taken place
        let beatsOverall = elem.beat + beatsMoved; // get new beats
        if (beatsOverall >= 0) { // beats + move positive
          if (beatsMoved % 1 != 0) { // check for non-integer moves (bug below the starting position)
            beatsMoved = Math.floor(beatsMoved + 2);
            beatsOverall = elem.beat + beatsMoved;
          } 
          if (beatsOverall < this.beats) { // new beat still in same bar -> just adjust beat
            this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {bar: elem.bar, beat: beatsOverall}});
          } else { // beat in new bar above
            // calculate bars moved
            let barsMoved = (beatsOverall - beatsOverall % this.beats) / this.beats; 
            // move up the bars and the beats
            this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {bar: (elem.bar + barsMoved), beat: (beatsOverall % this.beats)}});
          }
        } else { // beats + move negative -> down at least one bar
          if (beatsMoved % 1 != 0) { // check for non-integer moves (bug below the starting position)
            beatsMoved = Math.floor(beatsMoved - 1);
            beatsOverall = elem.beat + beatsMoved;
          } 
          if (beatsOverall > -this.beats) { // smaller new position than -1 bar -> move down one bar and adjust beats
            this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {bar: (elem.bar - 1), beat: (beatsOverall + this.beats)}});
          } else { // moved down more than one bar
            // calculate new bar
            let barsMoved = (beatsOverall - ((beatsOverall % this.beats) + this.beats) % this.beats) / this.beats;
            // move down
            this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {bar: (elem.bar + barsMoved), beat: (((beatsOverall % this.beats) + this.beats) % this.beats)}});
          }
        }
      }
    },
    /**
     * Method for calculating and saving the new column of an element after a horizontal move
     * Used by relationship bows after resizing
     * @param index the index of the sign
     * @param startX the x position before moving (svg chords)
     * @param startW the width of the element before moving (svg chords)
     * @param endX the x position after moving (svg chords)
     * @param endW the width of the element after moving (svg chords)
     */
    calcColumnMove(index, startX, startW, endX, endW) {
      // calculate the move of the right side/column
      let movedRight = Math.round(((endX + endW) - (startX + startW)) / this.blocksizeX);
      // calculate the move of the left column
      let movedLeft = Math.round((endX - startX)/this.blocksizeX);
      // edit the left/right column of the bow
      const elem = this.signs[index];
      this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {col: (elem.col + movedLeft), colRight: (elem.colRight + movedRight)}});
    },

    /**
     * Method for updating the data of a sign in the signs object by a context menu
     * @param data the new sign data and the index of that sign in the signs object 
     */
    updateSignData(data) {
      // edit sign and save history
      this.$store.dispatch("editSigns", {type: "changeSignData", index: data.index, data: data.data});
      this.$store.dispatch("saveStateInHistory");
    },

    /**
     * Method for selecting a sign via the attribute in the signs object
     * @param id the index of the sign in the signs object 
     * @param selectMultiple (optional) used to select multiple signs at once (ctrl + click)
     */
    selectSign(id, selectMultiple = false) {
      // check if ctrl + click is active or the multi selection mode is on
      if (!(selectMultiple || this.multiselectActive)) { // no multi select -> clear selection
        this.$store.dispatch("clearSelectedSigns");
      }
      if (id > 0) { // id > - 1 -> select sign
        if (this.signs[id].isSelected == false) { // sign not selected -> select it
          this.$store.dispatch("addToSelectedSigns", id);
          // remove handles if active
          this.barHandlesActive = false;
          this.columnHandlesActive = false;
        } else { // sign already selected -> unselect
          this.$store.dispatch("removeFromSelectedSigns", id);
        }
      } else if (id == -1) { // id == - 1 -> unselect all signs
        this.$store.dispatch("clearSelectedSigns");
        this.contextSign = 0;
      } // disable context menu
      this.$store.dispatch("changeContextMenu", false);
    },

    /**
     * Method for placing an element on top of the canvas (placing it as the last element on the canvas svg)
     * @param index the index of the sign to be placed on top 
     */
    placeSignOnTop (index) {
      // select the sign container of the sign by its ID
      let elem = this.$refs.bounding.querySelector(".sign-container[signID='"+ index + "']");
      // re-append it -> placed on top
      this.$refs.bounding.appendChild(elem);
    },

    /**
     * Method for getting the bounding rect of a sign container
     * @param index the ID of the sign in the signs object
     * @returns the bounding rect
     */
    getSignRect(index) {
      let elem = this.$refs.bounding.querySelector(".sign-container[signID='"+ index + "']");
      let rect = elem.getBoundingClientRect();
      return rect;
    },

    /**
     * Event listener for the keydown event
     * @param event the keydown event 
     */
    keyEvent(event) {
      // key events are disabled while interacting or placing a sign
      if (this.interacting || this.ghostActive) {
        event.preventDefault();
        return;
      }
      

      //delete sign
      if (event.key == "Delete" && this.selectedSigns.length > 0) { // works with "delete" while a sign is selected
        // sort selected signs and delete in decreasing order
        const sortedSelected = this.selectedSigns.sort((function(a, b) {return a - b;}));
        for (let max = sortedSelected.length - 1; max >= 0; max--) {
            this.removeSign (sortedSelected[max]);
        }
        // save history
        this.$store.dispatch("saveStateInHistory");
        return;
      }
      //moving signs with arrow keys
      if (event.which >= 37 && event.which <= 40) {
        let move = this.getArrowKeyAction (event.which); // check which key has been pressed
        // used to track if saving the history is neccessary
        let movedSigns = false; 
        for (let index of this.selectedSigns) { // check all selected signs
          // get elem in signs
          let elem = this.signs[index];
          //if the key id is odd -> left / right arrow key, move the sign(s) to the next column
          if (event.which % 2 == 1) {
            if (elem.col + move.column  >= -this.columnsLeft && elem.col + move.column < this.columnsRight && elem.baseType != "RoomDirectionSign" && elem.baseType != "PathSign") { // only move horizontally if still in bounds and can be moved 
              if (elem.baseType == "RelationshipBow") { // relationship bow -> check right column still in bounds
                if (elem.colRight + move.column < this.columnsRight) {
                  // in bounds -> move sign and adjust svg position
                  this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {col: (elem.col + move.column), colRight: (elem.colRight + move.column)}});
                  this.localSignData[index].x = this.localSignData[index].x + move.column * this.columnWidth;
                  movedSigns = true;
                }
              } else { // not bow
                // in bounds -> move sign and adjust svg position
                this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {col: (elem.col + move.column)}});
                this.localSignData[index].x = this.localSignData[index].x + move.column * this.columnWidth;
                movedSigns = true;
              }
              // change element side if neccessary
              if (elem.col < 0) {
                this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {side: "left"}});
              } else {
                this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {side: "right"}});
              }
            }
          //if the key id is even -> up / down arrow key, move the sign(s) up or down one beat if possible 
          } else if (elem.baseType != "BodyPartSign" && elem.baseType != "PropSign") {
            // save starting position to calculate beat move later
            let startY = this.localSignData[index].y;
            let startH = this.localSignData[index].height;
            if (move.beat > 0) { // move upwards
              if (this.checkStartingPos(this.localSignData[index].y, this.localSignData[index].height)) { // element in starting pos
                //if start pos and moving up -> move svg pos to bar 1 beat 0
                this.localSignData[index].y = this.localSignData[index].y - this.blocksizeY * 2 - this.startBarOffset;
              } else if (this.localSignData[index].y - move.beat * this.blocksizeY >= 0) { // check if moving the sign one bar up is still in bounds
                // move up one beat in svg position
                this.localSignData[index].y = this.localSignData[index].y - this.blocksizeY;
              }
            } else { // move down 
              let newY = this.localSignData[index].y + this.blocksizeY;
              if (this.checkStartingPos(newY, this.localSignData[index].height) && newY + this.localSignData[index].height < this.innerCanvasDimFull.y) {// new y would be in starting position after move
                // set y in svg position to starting position
                this.localSignData[index].y = this.localSignData[index].y + this.localSignData[index].height + this.startBarOffset;
                if (elem.resizable && elem.baseType != "RelationshipBow") { // elem vertically resizable -> change its height to 2 beats
                  this.localSignData[index].height = (this.blocksizeY * 2);
                  this.$store.dispatch("editSigns", {type: "changeSignData", index: index, data: {beatHeight: (this.localSignData[index].height / this.blocksizeY)}});
                } else { // not vertically resizable -> move down one further beat
                  this.localSignData[index].y = this.localSignData[index].y + this.blocksizeY; 
                }
              } else if (!this.checkStartingPos(newY, this.localSignData[index].height)) { // new position not in starting position -> set new position
                this.localSignData[index].y = newY;
              }
            }
            if (startY != this.localSignData[index].y || startH != this.localSignData[index].height) { // vertical move happened -> calculate beat move and save history
              this.calcBeatMove(index, startY, startH, this.localSignData[index].y, this.localSignData[index].height);
              movedSigns = true;
            }
          }
        }
        // at least one move happened -> save history
        if (movedSigns) {
          this.$store.dispatch("saveStateInHistory");
        }
        return;
      }
      //select/unselect all
      if (event.key == "a" && (event.ctrlKey || event.metaKey )) { // checking ctrl or mac equivalent
        if (this.selectedSigns.length > 0) { // if signs selected -> unselect all
          this.selectSign(-1);
        } else { // no sign selected -> select all signs
          for (let index = 1; index < this.signs.length; index++) {
            this.selectSign(index, true)
          }
        }
        return;
      }
      //inverse selection
      if (event.key == "i" && (event.ctrlKey || event.metaKey )) { // checking ctrl or mac equivalent
        if (this.selectedSigns.length > 0) { // only works with at least one sign selected
          let unselected = [];
          for (let index = 1; index < this.signs.length; index++) { // get all signs
            unselected.push(index);
          }
          // sort signs
          const sortedSelected = this.selectedSigns.sort();
          // remove all currently selected signs from signs list
          for (let index = sortedSelected.length - 1; index >= 0; index--) {
            unselected.splice(sortedSelected[index] - 1, 1);
          }
          // unselect all
          this.selectSign(-1);
          // select all formerly unselected signs
          for (let index of unselected) {
            this.selectSign(index, true);
          }
        }
        return;
      }
    },

    /**
     * Method for checking which arrow key is pressed
     * @param keyNr the id of the keydown event  
     * @returns the beat/column move 
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
      // initializing the dragg event listeners
      this.initSignInteraction();
      // initializing the click listeners
      this.initSignClick();
    },
    /**
     * initializes the sign specific resize listeners
     * @param elem the html wrapper of the sign
     */
    initSignListeners (elem) {
      // adding contex menu listener
      elem.addEventListener("contextmenu", this.openContextMenu, false);
      //disabling touch events (breaks interact events)
      ["touchstart", "touchmove", "touchend"].forEach((et) => elem.addEventListener(et, this.ignoreTouch));
      // normal sign (resize top/bottom)
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
              min: { width: 0, height: this.blocksizeY + this.handleDiam * 2 }
            }),
            interact.modifiers.restrictEdges({
              outer: "parent",
            })
          ],

          inertia: false
        });
      } else { // relationship bow -> resize from left/right
        interact(".bow").resizable({
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
            interact.modifiers.restrictSize({
              min: { width: this.columnWidth * 2 + this.handleDiam * 2, height: this.blocksizeY}
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
     * @param event the context menu call event
     * @param additionalX the optional x offset
     * @param additionalY the optional y offset
     */
    openContextMenu (event, additionalX = 0, additionalY = 0) {
      // prevent default context menu
      event.preventDefault();
      // disable context menu if active
      this.$store.dispatch("changeContextMenu", false);
      this.contextSign = 0;
      // get the target id to access the sign
      let target = event.target;
      const targetID = parseInt(target.getAttribute("signID"));
      this.contextSign = targetID;
      // get the signs bounding rect
      let boundingRect = this.getSignRect(targetID);

      // place the sign on top in the rendering order
      this.placeSignOnTop(targetID);
      // set the x position
      this.contextPos.x = boundingRect.right + additionalX;
      if (this.contextPos.x + this.contextMenuWidth >= window.innerWidth) { // x out of bounds -> move context menu to the left of the sign
        this.contextPos.x = boundingRect.x + additionalX - this.contextMenuWidth - 5; 
      }
      // is selected -> resize handles change the bounding rect, adjust them
      if (this.signs[targetID].isSelected) {
        this.contextPos.y = boundingRect.top + additionalY;
      } else {
        this.contextPos.y = boundingRect.top;
      }
      // introduction is highlighted -> position needs to be fixed
      if (this.$refs.container.classList.contains("highlighted")) {
        this.contextPos.x = this.contextPos.x - this.$refs.container.getBoundingClientRect().left;
        this.contextPos.y = this.contextPos.y - this.$refs.container.getBoundingClientRect().top;
      }
      
      // select the sign
      this.selectSign(targetID);
      // open the context menu
      this.$store.dispatch("changeContextMenu", true);
      // adjust the y position if neccessary
      setTimeout(function () {this.moveContextIntoView()}.bind(this), 0);
    },
    /**
     * adjusts the context menu y position if it is outside the view
     */
    moveContextIntoView () {
      if (this.contextPos.y + document.getElementById("context-menu").offsetHeight + this.$refs.container.getBoundingClientRect().top >= window.innerHeight) { // context menu outside the window -> move it back in
        this.contextPos.y = this.contextPos.y - (this.contextPos.y + document.getElementById("context-menu").offsetHeight + this.$refs.container.getBoundingClientRect().top - window.innerHeight);
      }
    },

    /**
     * Inititalizes the dragging settings and event listeners
     */
    initSignInteraction () {
      // gets called often -> reset the interact listeners before
      interact(".sign-container.bound-inner").unset()
      interact(".room-direction").unset();
      interact(".path").unset();
      interact(".body-part").unset();
      // bound inner -> inner canvas as bounding box
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
      // room direction -> bound to left-most column
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
      // path -> bound to right-most column
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
      // body part -> bound below the score
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
     * Inititalizes the sign clicking event listener
     */
    initSignClick () {
      interact(".sign-container").on("tap", this.clickSign)
      .on("doubletap", this.doubleClickSign)
      .on('hold',
        function () {
          if (!this.duplicateSign) {
            this.$store.dispatch("toggleDuplicateSignActive");
          }
        }.bind(this)
      );
    },

    /**
     * The click event listener, fires a selection request to the score component
     * @param event the click event
     */
    clickSign (event) {
      if (event.button == 0) { // only on left click
        const targetID = parseInt(event.target.getAttribute("signID"));
        // place the sign on top and select it
        this.placeSignOnTop(targetID);
        this.selectSign(targetID, (event.ctrlKey || event.metaKey));
      }
    },

    /**
     * The double click event listener, opens the context menu of a sign
     * @param event the double click event
     */
    doubleClickSign (event) {
      this.openContextMenu(event);
    },


    /**
     * creates a uniform shadow element based on the generic sign component
     * @param elem the sign to attach the shadow to
     */
    makeShadow (elem) {
      let shadow = {};
      // copy sign data
      for (const [key, value] of Object.entries(elem)) {
        shadow[key] = value;
      }
      // set is shadow (important for vuex)
      shadow.isShadow = true;
      shadow.isSelected = false;
      shadow.baseType = "GenericSign";
      shadow.signType = "GenericSign";
      // add sign and calculate local sign data
      this.$store.dispatch("editSigns", {type: "add", data: shadow});
      this.makeLocalSignData();
    },

    /**
     * used when multiple signs are dragged/resized
     * @returns true when the box was created, false when there are no interacting signs
     */
    makeInteractBox() {
      if (this.interactingSigns.length <= 0) { // only with multiple signs
        return false;
      }
      // reset interact box dimensions and settings
      this.interactBox = {x: this.canvasDimensions.x, y: this.canvasDimensions.y, x2: 0, y2: 0};
      this.interactBoxHasPath = false;
      this.interactBoxHasRoomDir = false;
      this.interactOverflow = {x: 0, y: 0};
      // check the interacting signs to make the bounding box
      for (let index of this.interactingSigns) {
        // room direction signs and paths don't affect the x dimension
        if (this.signs[index].baseType == "RoomDirectionSign") {
          this.interactBoxHasRoomDir = true;
        } else if (this.signs[index].baseType == "PathSign") {
          this.interactBoxHasPath = true;
        }
        // check if the x dimension is smaller than the current box
        let elem = this.localSignData[index];
        if (elem.x <= this.interactBox.x) { // x smaller -> set new x
          this.interactBox.x = elem.x;
        }
        // check if the y dimension is smaller than the current box
        if (elem.y <= this.interactBox.y) { // y smaller -> set new y
          this.interactBox.y = elem.y
        }
        // check if the width is bigger than the current box
        if (elem.x + (elem.width || this.signWidth) >= this.interactBox.x2) { // width bigger -> set new width
          this.interactBox.x2 = elem.x + (elem.width || this.signWidth);
        }
        // check if the height is bigger than the current box
        if (elem.y + elem.height >= this.interactBox.y2) { // height bigger -> set new width
          this.interactBox.y2 = elem.y + elem.height;
        }
        // round values
        this.interactBox.x = Math.round(this.interactBox.x / this.blocksizeX) * this.blocksizeX;
        this.interactBox.x2 = Math.round(this.interactBox.x2 / this.blocksizeX) * this.blocksizeX;
      }
      return true;
    },

    /**
     * checks if a sign is in the starting position
     * @param y the svg y position of the sign
     * @param height the svg height of the sign
     * @returns true if the sign is in the starting pos, false if it is not
     */
    checkStartingPos(y, height) {
      if (y + height > (this.innerCanvasDimFull.y - this.blocksizeY - this.barH / this.beats * 2- this.startBarOffset)) {
        return true;
      } else {
        return false;
      }
    },

    /**
     * The resize start event listener, creats the shadow element for resizing
     * @param event the resize-start event
     */
    resizeStart (event) {
      let target = event.target;
      // check if a context menu is active so it can be rerendered after, disable it
      if (this.contextActive) {
        this.contextWasActive = true;
      }
      this.$store.dispatch("changeContextMenu", false);
      
      // make the shadow sign
      const targetID = target.getAttribute("signID");
      this.makeShadow(this.signs[targetID]);
      // only one sign selected
      if (this.selectedSigns.length <= 1) {
        this.interactingSigns.push(targetID);
        //get current element position
        let y = (this.localSignData[targetID].y || 0) + event.dy;
        // set starting values
        target.setAttribute("start-y", y);
        target.setAttribute("start-h", this.localSignData[targetID].height);

        //apply dragging styling
        target.classList.add("dragging");

        //move element to top of Render
        this.placeSignOnTop(targetID);
      } else { // multiselect
        let select = [];
        for (let index of this.selectedSigns) { // check selected signs
          if (this.signs[index].baseType == "RelationshipBow" || !this.localSignData[index].canResize || !this.signs[index].resizable) { // cant vertically unresizable signs
            select.push(index);
          } else { // save resizable signs
            this.interactingSigns.push(index);
          }
        }
        // remove unresizable signs from selection
        for (let index of select) {
          this.$store.dispatch("removeFromSelectedSigns", index);
        }
        if (this.interactingSigns.length > 1) { // still multiselect -> make interaction box and scale the shadow element to fir the box 
          this.makeInteractBox();
          this.multiInteract = true;
          this.localSignData[this.signs.length - 1].x = this.interactBox.x;
          this.localSignData[this.signs.length - 1].y = this.interactBox.y;
          this.localSignData[this.signs.length - 1].width = this.interactBox.x2 - this.interactBox.x;
          this.localSignData[this.signs.length - 1].height = this.interactBox.y2 - this.interactBox.y;
        }
        let signsLength = this.$refs.bounding.querySelectorAll(".sign-container").length;
        for (let index = 0; index < this.interactingSigns.length; index++) {
          // place interacting signs on top
          this.placeSignOnTop(this.interactingSigns[index]);
          // add dragging to all interacting signs class list
          let sign = this.$refs.bounding.querySelectorAll(".sign-container")[signsLength-1];
          sign.classList.add("dragging");
          // set starting values for all signs
          let y = (this.localSignData[parseInt(sign.getAttribute("signID"))].y || 0) + event.dy;
          sign.setAttribute("start-y", y);
          sign.setAttribute("start-h", this.localSignData[parseInt(sign.getAttribute("signID"))].height);
        }
      }
      // disable keyboard commands
      this.$store.dispatch("setInteracting", true);
    },

    /**
     * The resize move event listener, resizes the event target
     * @param event the resize-move event
     */
    resizeMove (event) {
      // get shadow
      const shadowID = this.signs.length - 1;
      if (this.multiInteract) { // multiple signs resizing
        //check y out of bounds
        for (let index of this.interactingSigns) { // only resize if all signs are still at least one beat high
          if (this.localSignData[index].height + event.deltaRect.height < this.blocksizeY) {
            return;
          }
        }
        if (this.interactBox.y + event.deltaRect.top < 0) { // check if resizing above the score
          // keep y at 0, further upwards dragging gets added to the overflow
          this.interactBox.y = 0;
          this.interactOverflow.y = this.interactOverflow.y + event.deltaRect.top;
          return;
        } else if (this.checkStartingPos(this.interactBox.y, this.interactBox.y2 - this.interactBox.y + (event.deltaRect.height + event.deltaRect.top))) { // resizing from the bottom -> check if new resize would be in the starting pos 
          // set overflow but keep position
          this.interactOverflow.y = this.interactOverflow.y - (event.deltaRect.height + event.deltaRect.top);
          return;
        } else if (this.interactOverflow.y < 0) {
          // else if currently in overflow -> decrease overflow
          this.interactOverflow.y = this.interactOverflow.y + Math.abs(event.deltaRect.top) + Math.abs(event.deltaRect.height);
          return;
        } else { // no overflow and in bounds
          if (event.deltaRect.top) { // move the interaction box up or increase its height
            this.interactBox.y = this.interactBox.y + event.deltaRect.top;
          } else {
            this.interactBox.y2 = this.interactBox.y2 + event.deltaRect.height;
          }
        }
        // calculate the snapping position of the box and apply it to the shadow element
        let actualY = Math.round(this.interactBox.y / this.blocksizeY) * this.blocksizeY;
        let newHeight = this.interactBox.y2 - this.interactBox.y;
        let actualH = Math.round(newHeight / this.blocksizeY) * this.blocksizeY;
        this.localSignData[shadowID].y = actualY;
        this.localSignData[shadowID].height = actualH;
        
        // resize all signs
        for (let index of this.interactingSigns) {
          this.localSignData[index].y = this.localSignData[index].y + event.deltaRect.top;
          this.localSignData[index].height = this.localSignData[index].height + event.deltaRect.height;
          let sign = this.$refs.bounding.querySelector(".sign-container[signID='" + index + "']");
          sign.setAttribute("data-y", this.localSignData[index].y + event.deltaRect.top);
        }
      } else { // single sign interaction
        let target = event.target;
        const targetID = target.getAttribute("signID");
        
        // apply the new resizing
        let targetElem = this.localSignData[targetID];
        let y = (parseFloat(target.getAttribute("data-y")) || 0);
        // keep the same position when resizing from the top
        y += event.deltaRect.top;
        
        // calculate the shadow element position and height
        let actualY = Math.round(y / this.blocksizeY) * this.blocksizeY;
        let newHeight = targetElem.height + y - actualY;
        let actualH = Math.round(newHeight / this.blocksizeY) * this.blocksizeY;

        // update the element height (-handleDiam for the resize handles)
        this.localSignData[targetID].height = (event.rect.height - this.handleDiam * 2);
        //check if the element was resized from the top
        if (event.deltaRect.top != 0) {
          //top handle -> adjust shadows y position to nearest grid position
          this.localSignData[shadowID].y = actualY;
        }
        //stop resizing at the starting line
        if (!this.checkStartingPos(actualY, actualH)) {
          this.localSignData[shadowID].height = actualH;
        }

        //set new y data
        target.setAttribute("data-y", y);
        
        //translate sign
        this.localSignData[targetID].y = this.localSignData[targetID].y + event.deltaRect.top;
      }
    },

    /**
     * The resize end listener, sets the actual height/position after a resize
     * @param event the resize-end event
     */
    resizeEnd (event) {
      let target = event.target;
      // remove the shadow
      const shadowID = this.signs.length - 1;
      this.removeSign(shadowID);
      // get the signs new position
      let y = parseFloat(target.getAttribute("data-y"));
      // calculate the snapping position
      let actualY = Math.round(y / this.blocksizeY) * this.blocksizeY;
      if (this.multiInteract) { // multi resize
        let signsLength = this.$refs.bounding.querySelectorAll(".sign-container").length;
        // remove the dragging class
        for (let index = 0; index < this.interactingSigns.length; index++) {
          this.$refs.bounding.querySelectorAll(".sign-container")[signsLength-1 - index].classList.remove("dragging");
        }
      } else { // one sign
        // remove dragging class and reenable context menu if it was active before 
        target.classList.remove("dragging");
      }
      // checks if a sign was changed (only saving history when an action was actually performed)
      let resizedASign = false;
      for (let targetID of this.interactingSigns) { // iterate through all signs
        // get the y of the sign
        target = this.$refs.bounding.querySelector(".sign-container[signID='" + targetID + "']");
        y = parseFloat(target.getAttribute("data-y"));
        if (this.checkStartingPos(y, this.localSignData[targetID].height)) { // if the sign somehow ended up in the starting position -> resize it back
          this.localSignData[targetID].height = this.bars * this.beats * this.blocksizeY - y;
        }
        // calculate the snapping y and height
        actualY = Math.round(y / this.blocksizeY) * this.blocksizeY;
        let actualH = Math.round(this.localSignData[targetID].height / this.blocksizeY) * this.blocksizeY;
        
        // set the new values in the signs html data
        target.setAttribute("data-y", actualY);
        // change the svg y and height parameters
        this.localSignData[targetID].y = actualY;
        this.localSignData[targetID].height = actualH;
        // change the height in the vuex state
        this.$store.dispatch("editSigns", {type: "changeSignData", index: parseFloat(targetID), data: {beatHeight: (this.localSignData[targetID].height / this.blocksizeY)}});
        
        if (actualY == 0 && this.localSignData[targetID].y != 0) { // sometimes interact causes weird interactions at the top -> make sure the y is correct
          this.localSignData[targetID].y = 0;
        }
        if (parseFloat(target.getAttribute("start-y")) != this.localSignData[targetID].y || parseFloat(target.getAttribute("start-h")) != this.localSignData[targetID].height) { // sign has been changed
          // calculate the new beat
          this.calcBeatMove (targetID, parseFloat(target.getAttribute("start-y")), parseFloat(target.getAttribute("start-h")), this.localSignData[targetID].y, this.localSignData[targetID].height);
          // sign has changed -> save history
          resizedASign = true;
        }
        // select the sign
        this.selectSign(targetID, true);
      }
      // no longer interacting
      this.$store.dispatch("setInteracting", false);
      this.multiInteract = false;
      this.interactingSigns = [];
      // if a sign was changed -> save history
      if (resizedASign) {
        this.$store.dispatch("saveStateInHistory");
      }
      if (this.contextWasActive) {
        this.openContextMenu(event, 0, screenY - this.handleDiam);
        this.contextWasActive = false;
      }
    },

    /**
     * The resize start event listener for the horizontal bow resizing, creats the shadow element for resizing
     * @param event the resize-start event
     */
    bowResizeStart (event) {
      let target = event.target;
      // save the context menu state and close it
      if (this.contextActive) {
        this.contextWasActive = true;
      }
      this.$store.dispatch("changeContextMenu", false);
      
      // create the shadow
      const targetID = target.getAttribute("signID");
      this.makeShadow(this.signs[targetID]);
      if (this.selectedSigns.length <= 1) { // one sign selected
        this.interactingSigns.push(targetID);
        // save current element position
        let x = (this.localSignData[targetID].x || 0) + event.dx;
        target.setAttribute("start-x", x);
        target.setAttribute("start-w", this.localSignData[targetID].width);

        // apply dragging styling to html element
        target.classList.add("dragging");
        this.localSignData[this.signs.length - 1].y = this.localSignData[targetID].y;
        // move element to top of Render
        this.placeSignOnTop(targetID);
      } else { // multiselect
        let select = [];
        for (let index of this.selectedSigns) { 
          if (this.signs[index].baseType != "RelationshipBow" || !this.localSignData[index].canResize) { // only select relationship bows
            select.push(index);
          } else {
            this.interactingSigns.push(index);
          }
        }
        for (let index of select) { // remove all other signs
          this.$store.dispatch("removeFromSelectedSigns", index);
        }

        // make the inteaction box
        this.makeInteractBox(); 
        if (this.interactingSigns.length > 1) { // still multiple signs left -> set change shadow shape
          this.multiInteract = true;
          this.localSignData[this.signs.length - 1].x = this.interactBox.x;
          this.localSignData[this.signs.length - 1].y = this.interactBox.y;
          this.localSignData[this.signs.length - 1].width = this.interactBox.x2 - this.interactBox.x;
          this.localSignData[this.signs.length - 1].height = this.interactBox.y2 - this.interactBox.y;
        }
        let signsLength = this.$refs.bounding.querySelectorAll(".sign-container").length;
        for (let index = 0; index < this.interactingSigns.length; index++) { // iterate through interacting signs
          // place sign on top
          this.placeSignOnTop(this.interactingSigns[index]);
          // add dragging class
          let sign = this.$refs.bounding.querySelectorAll(".sign-container")[signsLength-1];
          sign.classList.add("dragging");
          // save the starting position and width
          let x = (this.localSignData[parseInt(sign.getAttribute("signID"))].x || 0) + event.dx;
          sign.setAttribute("start-x", x);
          sign.setAttribute("start-w", this.localSignData[parseInt(sign.getAttribute("signID"))].width);
        }
      }
      // disable keyboard commands
      this.$store.dispatch("setInteracting", true);
    },

    /**
     * The bow resize move event listener, resizes the event target along the x axis
     * @param event the resize-move event
     */
    bowResizeMove (event) {
      let target = event.target;
      const targetID = target.getAttribute("signID");
      const shadowID = this.signs.length - 1;
      if (this.multiInteract) { // check multi interact settings
        //check if width is too small for all signs
        for (let index of this.interactingSigns) {
          if (this.localSignData[index].width + event.deltaRect.width < 2 * this.columnWidth) { // sign is made smaller than possible -> no change
            return;
          }
        }
        //check x and width out of bounds for the interaction box
        if (this.interactBox.x + event.deltaRect.left < this.columnWidth) { // check left bounds
          // set x to the second left column (first is reseverd for room directions)
          // add additional drag amount to overflow
          this.interactBox.x = this.columnWidth;
          this.interactOverflow.x = this.interactOverflow.x + event.deltaRect.left;
          return;
        } else if (this.interactBox.x2 + (event.deltaRect.width + event.deltaRect.left) > this.innerCanvasDimFull.x - this.columnWidth) { // check right bounds
          // overflow -> set x to the maximum position and add event drag to overflow
          this.interactOverflow.x = this.interactOverflow.x - (event.deltaRect.width + event.deltaRect.left);
          this.interactBox.x2 = this.innerCanvasDimFull.x - this.columnWidth;
          return;
        } else if (this.interactOverflow.x < 0) { // in bounds but still overflow -> decrease overflow
          this.interactOverflow.x = this.interactOverflow.x + Math.abs(event.deltaRect.left) + Math.abs(event.deltaRect.width);
          return;
        } else { // normal interaction
          if (event.deltaRect.left) { // if resizing from the left -> change the x position
            this.interactBox.x = this.interactBox.x + event.deltaRect.left;
          } else { // resizing from the right -> adjust width
            this.interactBox.x2 = this.interactBox.x2 + event.deltaRect.width;
          }
        }
        // calculate the shadow snapping 
        let actualX = Math.round(this.interactBox.x / this.blocksizeX) * this.blocksizeX;
        let newWidth = this.interactBox.x2 - this.interactBox.x;
        let actualW = Math.round(newWidth / this.blocksizeX) * this.blocksizeX;
        // set the new shadow dimensions
        this.localSignData[shadowID].x = actualX;
        this.localSignData[shadowID].width = actualW;
        
        for (let index of this.interactingSigns) { // for all signs -> update their dimensions
          this.localSignData[index].x = this.localSignData[index].x + event.deltaRect.left;
          this.localSignData[index].width = this.localSignData[index].width + event.deltaRect.width;
          let sign = this.$refs.bounding.querySelector(".sign-container[signID='" + index + "']");
          // save dimensions in html data
          sign.setAttribute("data-x", this.localSignData[index].x + event.deltaRect.left);
        }
      } else { // one sign
        let targetElem = this.localSignData[targetID];
        let x = (parseFloat(target.getAttribute("data-x")) || 0);

        // keep the same position when resizing from the left
        x += event.deltaRect.left;
        
        // calculate shadow position
        let actualX = Math.round(x / this.blocksizeX) * this.blocksizeX;
        let newWidth = targetElem.width + x - actualX;
        let actualW = Math.round(newWidth / this.blocksizeX) * this.blocksizeX;

        // update the element width (-handleDiam for the handles)
        this.localSignData[targetID].width = (event.rect.width - this.handleDiam * 2);

        //adjust shadow to neares grid pos
        this.localSignData[shadowID].x = actualX;
        this.localSignData[shadowID].width = actualW;

        //set new x data
        target.setAttribute("data-x", x);
        
        //translate sign
        this.localSignData[targetID].x = targetElem.x + event.deltaRect.left;
      }
    },

    /**
     * The bow resize end listener, sets the actual width/position after a resize
     * @param event the resize-end event
     */
    bowResizeEnd (event) {
      let target = event.target;
      // remove the shadow
      const shadowID = this.signs.length - 1;
      this.removeSign(shadowID);
      let x = parseFloat(target.getAttribute("data-x"));
      let actualX = Math.round(x / this.blocksizeX) * this.blocksizeX;
      if (this.multiInteract) { // multi interaction -> remove dragging css class 
        let signsLength = this.$refs.bounding.querySelectorAll(".sign-container").length;
        for (let index = 0; index < this.interactingSigns.length; index++) {
          this.$refs.bounding.querySelectorAll(".sign-container")[signsLength-1 - index].classList.remove("dragging");
        }
      } else { // one sign -> open context menu and remove dragging class
        target.classList.remove("dragging");
      }
      // checking variable for whether or not to save to the history (only saving when a sign has been moved) 
      let resizedASign = false;
      for (let targetID of this.interactingSigns) { // iterate over all signs
        // get the signs x and calculate the snapping value
        target = this.$refs.bounding.querySelector(".sign-container[signID='" + targetID + "']");
        x = parseFloat(target.getAttribute("data-x"));
        actualX = Math.round(x / this.blocksizeX) * this.blocksizeX;
        // calculate the snapped width
        let actualW = Math.round(this.localSignData[targetID].width / this.blocksizeX) * this.blocksizeX;

        // set the new x and width
        target.setAttribute("data-x", actualX);
        this.localSignData[targetID].x = actualX;
        this.localSignData[targetID].width = actualW;

        //when the sign is being dragged to the left side, sometimes the new x is not set correctly
        if (actualX == this.columnWidth && this.localSignData[targetID].x != this.columnWidth) {
          this.localSignData[targetID].x = this.columnWidth;
        }
        //if the sign was resized -> calculate a new beat move and save the history later
        if (parseFloat(target.getAttribute("start-x")) != this.localSignData[targetID].x || parseFloat(target.getAttribute("start-w")) != this.localSignData[targetID].width) {
          this.calcColumnMove(parseFloat(targetID), parseFloat(target.getAttribute("start-x")), parseFloat(target.getAttribute("start-w")), this.localSignData[targetID].x, this.localSignData[targetID].width);
          resizedASign = true;
        }
        // select the sign
        this.selectSign(targetID, true);
      }
      // reenable keyboard commands
      this.$store.dispatch("setInteracting", false);
      this.multiInteract = false;
      this.interactingSigns = [];
      
      // if a sign was resized -> save the state in the undo history
      if (resizedASign) {
        this.$store.dispatch("saveStateInHistory");
      }

      if (this.contextWasActive) {
        this.openContextMenu(event, screenX - this.handleDiam, screenY);
        this.contextWasActive = false;
      }
    },

    /**
     * The drag-start event listener, sets up the shadow element for the dragging and allows duplication
     * @param event the drag-start event
     */
    dragStart (event) {
      let target = event.target;
      let targetID = parseInt(target.getAttribute("signID"));
      // check for duplication
      if (event.shiftKey || this.duplicateSign) { // shift or duplication mode active
        if (this.selectedSigns.length == 0 || !this.selectedSigns.includes(parseInt(targetID))) {
          // signs can be dragged without selecting. In this case clear the selection and select the target sign instead
          this.$store.dispatch("clearSelectedSigns");
          this.selectSign(targetID);
        } 
        for (let index of this.selectedSigns) { // copy selected signs
          let elem = Object.assign({}, this.signs[index]);
          elem.isSelected = false;
          this.$store.dispatch("changeCurSign", {signData: elem});
          let signData = {bar: elem.bar, beat: elem.beat, col: elem.col, side: elem.side };
          if (elem.baseType == "RelationshipBow") {
            signData.colRight = elem.colRight;
          }
          this.addSign(signData);
        }
      } 
      // save the context menu state
      if (this.contextActive) {
        this.contextWasActive = true;
        this.$store.dispatch("changeContextMenu", false);
      }
      //check sign is not in selection or only one sign is selected -> single sign event
      if (this.selectedSigns.length <= 1 || !this.selectedSigns.includes(parseInt(targetID))) {
        this.interactingSigns.push(targetID);
        this.$store.dispatch("clearSelectedSigns");
        //save current element position and dimensions
        let  x = (this.localSignData[targetID].x || 0) + event.dx;
        let  y = (this.localSignData[targetID].y || 0) + event.dy;
        target.setAttribute("start-x", x);
        target.setAttribute("start-y", y);
        target.setAttribute("start-h", this.localSignData[targetID].height);
      } else { // sign in selection and more than one sign selected -> multiselect
        for (let index of this.selectedSigns) {
          this.interactingSigns.push(index);
        }
        this.$store.dispatch("clearSelectedSigns");
        this.makeInteractBox();
        this.multiInteract = true;
      }
      this.makeShadow(this.signs[targetID]);
      
      if (this.signs[targetID].baseType == "RelationshipBow") { // relationship bow -> change width of shadow to match
        this.localSignData[this.signs.length - 1].width = this.localSignData[targetID].width;
      }
      if (this.multiInteract) { // multi interaction -> change shadow to match bounding
        this.localSignData[this.signs.length - 1].x = this.interactBox.x;
        this.localSignData[this.signs.length - 1].y = this.interactBox.y;
        this.localSignData[this.signs.length - 1].width = this.interactBox.x2 - this.interactBox.x;
        this.localSignData[this.signs.length - 1].height = this.interactBox.y2 - this.interactBox.y;
        let signsLength = this.$refs.bounding.querySelectorAll(".sign-container").length;
        for (let index = 0; index < this.interactingSigns.length; index++) { // iterate through interacting signs
          // add sign on top
          this.placeSignOnTop(this.interactingSigns[index]);
          // add dragging class
          let sign = this.$refs.bounding.querySelectorAll(".sign-container")[signsLength-1];
          sign.classList.add("dragging");
          // save starting position and height
          let x = (this.localSignData[parseInt(sign.getAttribute("signID"))].x || 0) + event.dx;
          let y = (this.localSignData[parseInt(sign.getAttribute("signID"))].y || 0) + event.dy;
          sign.setAttribute("start-x", x);
          sign.setAttribute("start-y", y);
          sign.setAttribute("start-h", this.localSignData[parseInt(sign.getAttribute("signID"))].height);
        }
        
      } else { // single sign -> add dragging class
        target.classList.add("dragging");
        //move element to top of Render
        this.placeSignOnTop(targetID);
      }
      // disable keyboard commands
      this.$store.dispatch("setInteracting", true);
    },

    /**
     * The drag-move event listener, moves the sign and the shadow element
     * @param event the drag-move event
     */
    dragMove: function(event) {
      let target = event.target;
      // get the target
      const targetID = target.getAttribute("signID");
      const shadowID = this.signs.length - 1;
      let targetElem = this.localSignData[targetID];
      //column offset is the amount the signs are shifted from the border of a column
      const columnOffset = (this.columnWidth - this.signWidth) / 2;
      // checking variables if the position of the cursor is out of bounds currently -> don't move signs
      let multiStopX = false;
      let multiStopY = false;
      if (!this.multiInteract) { // no multiinteract -> reset shadow height (neccessary when dragging it in and out of the starting position)
        this.localSignData[shadowID].height = targetElem.height;
      } else { // multi interact
        let xOffset = this.columnWidth;
        let x2Offset = this.columnWidth;
        if (this.interactBoxHasRoomDir) { // if there is a room direction sign -> interact box can go to 0 instead of one column further
          xOffset = 0;
        }
        if (this.interactBoxHasPath) {// if there is a path sign -> interact box can go to the score border instead of one column less
          x2Offset = 0;
        }
        //check x out of bounds
        if (this.interactBox.x - xOffset + event.dx < 0) { // interaction box x out of bounds -> reset interaction box and add to overflow
          this.interactBox.x = xOffset;
          this.interactOverflow.x = this.interactOverflow.x + event.dx;
          multiStopX = true;
        } else if (this.interactBox.x2 + x2Offset + event.dx > this.innerCanvasDimFull.x) { // interaction box width out of bounds -> reset interaction box and add to overflow
          this.interactBox.x2 = this.innerCanvasDimFull.x - x2Offset;
          this.interactOverflow.x = this.interactOverflow.x - event.dx;
          multiStopX = true;
        } else if (this.interactOverflow.x < 0) {// existing overflow -> reduce overflow
          this.interactOverflow.x = this.interactOverflow.x + Math.abs(event.dx);
          multiStopX = true;
        } else { // x and width in bounds and no overflow -> move interaction box
          this.interactBox.x = this.interactBox.x + event.dx;
          this.interactBox.x2 = this.interactBox.x2 + event.dx;
        }
        //check y out of bounds
        if (this.interactBox.y + event.dy < 0) { // interaction box y out of bounds -> reset interaction box and add to overflow
          this.interactBox.y = 0;
          this.interactOverflow.y = this.interactOverflow.y + event.dy;
          multiStopY = true;
        } else if (this.interactBox.y2 + event.dy > this.innerCanvasDimFull.y) { // interaction box height out of bounds -> reset interaction box and add to overflow
          this.interactBox.y2 = this.innerCanvasDimFull.y;
          this.interactOverflow.y = this.interactOverflow.y - event.dy;
          multiStopY = true;
        } else if (this.interactOverflow.y < 0) { // existing overflow -> reduce overflow
          this.interactOverflow.y = this.interactOverflow.y + Math.abs(event.dy);
          multiStopY = true;
        } else { // y and height in bounds and no overflow -> move interaction box
          this.interactBox.y = this.interactBox.y + event.dy;
          this.interactBox.y2 = this.interactBox.y2 + event.dy;
        }
      }
      // check for special signs
      const isBow = (this.signs[targetID].baseType == "RelationshipBow");
      const isBodyPart = (this.signs[targetID].baseType == "BodyPartSign" || this.signs[targetID].baseType == "PropSign");
      const isPath = (this.signs[targetID].baseType == "PathSign");
      const isRoomSign = (this.signs[targetID].baseType == "RoomDirectionSign");
     
      //get the current position of the event target sign from the x and y chords
      let  x = (this.localSignData[targetID].x || 0) + event.dx;
      let  y = (this.localSignData[targetID].y || 0) + event.dy;

      // calculate the shadow position
      let actualX = Math.round(x / this.blocksizeX) * this.blocksizeX + columnOffset;
      let actualY = Math.round(y / this.blocksizeY) * this.blocksizeY;
      if (this.multiInteract) { // multi interact -> base the shadow position of of the interact box
        actualX = Math.round(((this.interactBox.x + columnOffset || 0) + event.dx) / this.blocksizeX) * this.blocksizeX;
        actualY = Math.round(((this.interactBox.y || 0) + event.dy) / this.blocksizeY) * this.blocksizeY;
      }
      
      if (isRoomSign && actualX >= this.$refs.boundingOuterLeft.getBBox().x + this.$refs.boundingOuterLeft.getBBox().width) { // room direction sign && shadow x out of bounds -> reduce it back to where it is supposed to be
        actualX = actualX - this.columnWidth;
      } else if (!isRoomSign && !isPath && actualX >= this.$refs.boundingOuterRight.getBBox().x) { // normal sign and shadow x out of bounds -> put it back one column
        actualX = actualX - this.columnWidth;
      } else if (isPath) { // path sign        
        if (actualX >= this.$refs.boundingOuterRight.getBBox().x + this.$refs.boundingOuterRight.getBBox().width) { // path sign and x out of bounds -> put back one column
          actualX = actualX - this.columnWidth;
        } else if (actualX < this.$refs.boundingOuterRight.getBBox().x) { // path sign and x somehow in inner score -> add one column
          actualX = actualX + this.columnWidth;
        }
      } else if (isBow) { // bow -> remove column offset, they begin at the border
        actualX = actualX - columnOffset;
      }
      if (this.multiInteract) { // multi interact -> check starting position of interaction box
        if (this.checkStartingPos(actualY, this.interactBox.y2 - this.interactBox.y)) {
          // if in starting pos -> increase height until score base line
          this.interactBox.y2 == this.innerCanvasDimFull.y - this.blocksizeY;
          this.localSignData[shadowID].height = this.innerCanvasDimFull.y - actualY - this.blocksizeY;
          if (this.localSignData[shadowID].height < 2 * this.blocksizeY) {
            this.localSignData[shadowID].height = 2 * this.blocksizeY;
          }
        } else { // not in starting pos -> change height back
          this.localSignData[shadowID].height = this.interactBox.y2 - this.interactBox.y;
          if (this.localSignData[shadowID].y + this.localSignData[shadowID].height > this.innerCanvasDimFull.y - this.blocksizeY) { // if shadow is halfway in starting position -> move it up one beat
            this.localSignData[shadowID].height = this.localSignData[shadowID].height - 50;
          }
        }
        //set new element position
        // checking variables to adjust the shadow box
        let allinStart = true;
        let noneInStart = true;
        for (let index of this.interactingSigns) {
          if (!multiStopX && !(this.signs[index].baseType == "PathSign" || this.signs[index].baseType == "RoomDirectionSign")) { // if the signs can be moved and the sign is not a special sign -> move it on the x axis
            this.localSignData[index].x = (this.localSignData[index].x || 0) + event.dx;
          }
          if (!multiStopY && !(this.signs[index].baseType == "BodyPartSign" || this.signs[index].baseType == "PropSign")) { // if the signs can be moved and the sign is not a special sign -> move it on the y axis
            this.localSignData[index].y = (this.localSignData[index].y || 0) + event.dy;
            let yCorrect = Math.round(((this.localSignData[index].y || 0) + event.dy) / this.blocksizeY) * this.blocksizeY; // check if the sign would be placed in the starting position right now
            if (allinStart && !this.checkStartingPos(yCorrect, this.localSignData[index].height)) { // not in starting position -> all in start = false
              allinStart = false;
            } else if (noneInStart && this.checkStartingPos(yCorrect, this.localSignData[index].height)) { // in starting position -> at least one sign is in the starting position
              noneInStart = false;
            }
          }
        }
        if (!multiStopY && allinStart) { // can move signs and all signs are in the starting position -> adjust shadow box height and position
          this.localSignData[shadowID].height = 2 * this.blocksizeY;
          actualY = this.innerCanvasDimFull.y - this.blocksizeY * 3;
        } 
        if (!multiStopY && noneInStart && this.checkStartingPos(this.localSignData[shadowID].y,this.localSignData[shadowID].height)) { // if no signs are in the starting position but the shadow box is -> change the shadow height
          this.localSignData[shadowID].height = this.localSignData[shadowID].height - 2 * this.blocksizeY;
          if (this.localSignData[shadowID].height >= this.startBarOffset) { // shadow height too small big -> ajust
            this.localSignData[shadowID].height = this.localSignData[shadowID].height - this.startBarOffset;
          }
        }
      } else { // only one sign interacting
        //check if the current position is above (below in actual browser) the starting line -> snap there
        if (this.checkStartingPos(actualY, this.localSignData[targetID].height)) {
          if (isBow) { // bow is placed at the bottom
            actualY = this.innerCanvasDimFull.y - this.barH / this.beats * 2;
          } else if (isBodyPart) { // body parts snap below the score
            actualY = this.innerCanvasDimFull.y - this.barH / this.beats * 2 + this.blocksizeY + this.startBarOffset;
          } else if (!this.signs[targetID].resizable) { // not resizable -> also snaps to the bottom
            actualY = this.innerCanvasDimFull.y - this.barH / this.beats * 2;
          } else { // normal signs -> adjust height and y position
            this.localSignData[shadowID].height = (this.barH / this.beats * 2);
            actualY = this.innerCanvasDimFull.y - this.blocksizeY - this.barH / this.beats * 2;
          }
        }
        //set new element position
        this.localSignData[targetID].x = x;
        this.localSignData[targetID].y = y;
      }

      //set new shadow element position if possible
      if (!multiStopX) {
        this.localSignData[shadowID].x = actualX;
      }
      if (!multiStopY) {
        this.localSignData[shadowID].y = actualY;
      }
    },
    
    /**
     * The drag-end event listener, places the sign at the proper position and removes the shadow
     * @param event the drag-move event
     */
    dragEnd (event) {
      let target = event.target;

      if (this.multiInteract) { // multi interact -> remove dragging class from all elements
        let signsLength = this.$refs.bounding.querySelectorAll(".sign-container").length;
        for (let index = 0; index < this.interactingSigns.length; index++) {
          this.$refs.bounding.querySelectorAll(".sign-container")[signsLength-1 - index].classList.remove("dragging");
        }
      } else { // else just remove dragging
        target.classList.remove("dragging");
      }
      // get offset for regular signs
      const columnOffset = (this.columnWidth - this.signWidth) / 2;
      // checker if an action was performed (only save in undo history if true)
      let actuallyMoved = false;
      for (let targetID of this.interactingSigns) { // iterate over all interacting signs
        // get sign type 
        target = this.$refs.bounding.querySelector(".sign-container[signID='" + targetID + "']");
        let isBow = (this.signs[targetID].baseType == "RelationshipBow");
        let isBodyPart = (this.signs[targetID].baseType == "BodyPartSign" || this.signs[targetID].baseType == "PropSign");
        let isPath = (this.signs[targetID].baseType == "PathSign");
        let isRoomSign = (this.signs[targetID].baseType == "RoomDirectionSign");
        let bodyPartBelowScore = false;
        // get the x and y chords
        let x = this.localSignData[targetID].x;
        let y = this.localSignData[targetID].y;
        // get the actual position
        let screenX = Math.round(x / this.blocksizeX) * this.blocksizeX + columnOffset;
        let screenY = Math.round(y /this.blocksizeY) * this.blocksizeY;


        if (isRoomSign && screenX >= this.$refs.boundingOuterLeft.getBBox().x + this.$refs.boundingOuterLeft.getBBox().width) { // room direction -> check if x pos is correct
          screenX = screenX - this.columnWidth;
        } else if (!isRoomSign && !isPath && screenX >= this.$refs.boundingOuterRight.getBBox().x) { // normal sign -> check if x in bounds
          screenX = screenX - this.columnWidth;
        } else if (isPath) { // path -> check if x in bounds
          if (screenX >= this.$refs.boundingOuterRight.getBBox().x + this.$refs.boundingOuterRight.getBBox().width) {
            screenX = screenX - this.columnWidth;
          } else if (screenX < this.$refs.boundingOuterRight.getBBox().x) {
            screenX = screenX + this.columnWidth;
          }
        } else if (isBow) { // bow -> remove column offset
          screenX = screenX - columnOffset;
        }
        
        
        //check if the current position is above (below in actual browser) the starting line -> snap there
        if (this.checkStartingPos(screenY, this.localSignData[targetID].height)) {
          if (isBodyPart) { // body part -> set actual y to below the score       
            screenY = this.innerCanvasDimFull.y - this.blocksizeY - this.barH / this.beats * 2 + this.blocksizeY * 2;
            bodyPartBelowScore = true;
          } else if (!this.signs[targetID].resizable || isBow) { // sign not resizable or bow -> snap at bottom of starting position
            screenY = this.innerCanvasDimFull.y - this.barH / this.beats * 2;
          } else { // normal sign -> resize to fit in starting position
            this.localSignData[targetID].height = (this.barH / this.beats * 2);
            this.$store.dispatch("editSigns", {type: "changeSignData", index: parseFloat(targetID), data: {beatHeight: (this.localSignData[targetID].height / this.blocksizeY)}});
            screenY = this.innerCanvasDimFull.y - this.barH / this.beats * 2 - this.blocksizeY;
            this.localSignData[targetID].canResize = false;
          }
        } else { // not in starting position -> sign can be resized
          this.localSignData[targetID].canResize = true;
        }

        // set the new position
        this.localSignData[targetID].x = screenX;
        this.localSignData[targetID].y = screenY;
        target.setAttribute("data-y", screenY);

        // check the columns moved
        let columnsMoved = (parseFloat(target.getAttribute("start-x")) - this.localSignData[targetID].x) / -this.blocksizeX;
        if (isBow) { // bow -> adjust the left and right column
          this.$store.dispatch("editSigns", {type: "changeSignData", index: parseFloat(targetID), data: {col: (this.signs[targetID].col + columnsMoved), colRight: (this.signs[targetID].colRight + columnsMoved)}});
        } else { // normal sign -> adjust the column
          this.$store.dispatch("editSigns", {type: "changeSignData", index: parseFloat(targetID), data: {col: (this.signs[targetID].col + columnsMoved)}});
        }
        if (columnsMoved != 0) { // if the sign was moved -> save state in undo history
          actuallyMoved = true;
        }
        
        // change the signs side
        if (this.signs[targetID].col >= 0 ) { 
          this.$store.dispatch("editSigns", {type: "changeSignData", index: parseFloat(targetID), data: {side: "right"}});
        } else {
          this.$store.dispatch("editSigns", {type: "changeSignData", index: parseFloat(targetID), data: {side: "left"}});
        }
        // y or height has been changed -> calculate the vertical move
        if (parseFloat(target.getAttribute("start-y")) != this.localSignData[targetID].y || parseFloat(target.getAttribute("start-h")) != this.localSignData[targetID].height) {
          this.calcBeatMove(targetID, parseFloat(target.getAttribute("start-y")), parseFloat(target.getAttribute("start-h")), this.localSignData[targetID].y, this.localSignData[targetID].height);
          // change -> save history
          actuallyMoved = true;
        }
        
        // bodpart -> make sure bar and beat is correct
        if (isBodyPart && bodyPartBelowScore) {
          this.$store.dispatch("editSigns", {type: "changeSignData", index: parseFloat(targetID), data: {bar: -1, beat: 0}});
        }
      }
      // remove shadow
      const shadowID = this.signs.length - 1;
      this.removeSign(shadowID);
      // reenable key commands
      this.$store.dispatch("setInteracting", false);
      this.multiInteract = false;
      // reselect signs
      for (let index of this.interactingSigns) {
        this.selectSign(index, true);
      }
      this.interactingSigns = [];
      // if the drag event was a duplication -> disable the duplication mode
      if (this.duplicateSign) {
        this.$store.dispatch("toggleDuplicateSignActive");
      }
      // save the position in the html data for the target sign
      let x = this.localSignData[target.getAttribute("signID")].x;
      let y = this.localSignData[target.getAttribute("signID")].y;
      // reopen the context menu if it was open before
      if (this.contextWasActive) {
        this.openContextMenu(event, screenX - x, screenY - y - this.handleDiam);
        this.contextWasActive = false;
      }
      // actual change -> save history
      if (actuallyMoved) {
        this.$store.dispatch("saveStateInHistory");
      }
    },



    /**
     * InteractJS workaround: touch events immediately end resize and drag events -> cancel them before that happens and implement scrolling elsewhere
     * @param event the drag-move event
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
  background-color: var(--bg-light);
  overflow: auto;
}

#canvas {
  margin: auto auto;
  display: block;
  box-sizing: border-box;
  border: 1px solid var(--bg-light-less-2);
  border-top: none;
}

svg text {
  user-select: none;
}

.column-handles {
  width: 108px;
  height: 30px;
  position: absolute;
  display: flex;
  align-items: center;
  transform: translateX(-20px);
  z-index: 1;
  pointer-events: none;
}

.bar-handles {
  width: 30px;
  height: var(--barHeight);
  position: absolute;
  z-index: 1;
  pointer-events: none;
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

  pointer-events: all;
}

.column-handles > .add-remove-container {
  margin: 10px 3px;
}

.bar-handles > .add-remove-container {
  margin: 0 0 calc(var(--barHeight) / 3 + var(--barHeight) / 6 - 30px) 0;
  --move: -15px;
}

.add-remove-container.red {
  --c2: var(--delete);
  --rotate: 45deg;
}

.add-remove-container.green {
  --c2:var(--add-darker);
}
.add-remove-container.invisible {
  opacity: 0.9;
  cursor: not-allowed;
  --c2: var(--bg-light-least);
}

.invis {
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
}

</style>
