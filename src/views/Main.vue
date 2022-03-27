<template>
  <div ref="view">
    <Header/>
    <SignLibrary @selectSignDrag="selectSignDrag"/>
    <div id="interactionBox">
      <InteractionMenu/>
      <Score/>
    </div>
    <svg v-if="ghostActive" :width="ghostSignData.baseType == 'RelationshipBow' ? this.columnWidth * 2 : signWidth + 3" :height="ghostSignData.beatHeight * minHeight + 3" fill="white" class="ghost-svg" ref="ghost" :style="ghostTransform">
      <g transform="translate(1.5,1.5)">
        <component :is="ghostSignData.baseType" :isSelected="true" :height="ghostSignData.beatHeight * minHeight" :signData="ghostSignData" :class="ghostOverCanvas ? 'over-canvas' : ''"/>
      </g>
    </svg>
  </div>
</template>

<script>

/**
 * The main editor view
 * additional views can be added in the same folder, and need to be registered to the router
 * @displayName Main View
 */
export default {
  name: 'Main',
  inject: ["signWidth","barHeight", "outerCanvasMargin", "columnWidth"],
  data() {
    return {
      ghostSignData: {},
      signsLength: 0,
    };
  },
  computed: {
    libSign () {
      if ("signData" in this.$store.state["curSign"]) {
        return this.$store.state["curSign"].signData;
      } else {
        return false;
      }
    },
    ghostTransform() {
      return "transform: translate(" + this.ghostPos.x + "px," + this.ghostPos.y + "px);"; 
    },
    beats () {
      return this.$store.state["beatsPerBar"];
    },
    minHeight () {
      return this.barHeight / this.beats;
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
    signs () {
      return this.$store.state["signs"];
    }
  },
  mounted () {
    this.signsLength = this.signs.length;
  },
  methods: {
    selectSignDrag (data) {
      if (data.type == "start") {
        this.signsLength = this.signs.length;
        this.$store.dispatch("setGhostActive", true);
        this.ghostSignData = this.libSign;
        this.$store.dispatch("setGhostPos", {x: Math.round(data.pos.x), y: Math.round(data.pos.y)});
      } else if (data.type == "move") {
        this.$store.dispatch("setGhostPos", {x: this.ghostPos.x + data.delta.x, y: this.ghostPos.y + data.delta.y});
        if (this.$refs.ghost) {
          
          const rect = this.$refs.ghost.getBoundingClientRect();
          const canvasRect = document.getElementById("canvas").getBoundingClientRect();
          const xInCanvas = ((rect.x + rect.width >= canvasRect.x && rect.x <= canvasRect.x + canvasRect.width));
          const yInCanvas = (rect.y + rect.height >= canvasRect.y&& rect.y <= canvasRect.y + canvasRect.height);
          if (xInCanvas && yInCanvas && !this.ghostOverCanvas) {
            this.$store.dispatch("setGhostOverCanvas", true);
          } else if ((!xInCanvas || !yInCanvas) && this.ghostOverCanvas) {
            this.$store.dispatch("setGhostOverCanvas", false);
          }
          
        }
        //if x && y in canvas -> set libSignOverCanvas = true -> score handles interaction there 
        // if not x && y in canvas -> set libSignOverCanvas = false -> score handles interaction there
      } else {
        this.$store.dispatch("setGhostActive", false);
        this.$store.dispatch("setGhostOverCanvas", false);
        if (this.signsLength != this.signs.length) {
          this.$store.dispatch("saveStateInHistory");
        }
        // if libSignOverCanvas = true -> score keeps the sign
        // else the sign is already deleted
      }
    }
  }
}
</script>

<style>
  #interactionBox {
    width: calc(100% - 250px);
    float: right;
  }

  .ghost-svg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1001;
  }
  .over-canvas .draggable {
    stroke: #f1c232!important;
  }
</style>