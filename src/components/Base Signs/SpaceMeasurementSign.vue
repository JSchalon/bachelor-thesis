<template>
  <g>
    <rect class="no-save" fill="white" x="0" :y="height - signWidth" :width="signWidth" :height="signWidth - 1" :signID="id"/>
    <line stroke="black" stroke-width="2" :x1="signWidth / 2" :x2="signWidth / 2" y1="0" :y2="height - signWidth - 10" :signID="id"/>
    <path
      stroke="black" 
      :d="baseSigns[signData.degree-1].path"
      :class="{active: isSelected}" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"
    />
    <circle v-if="(signData.degree-1) % 3 > 0" :cx="signWidth / 2" :cy="height - signWidth" r="4" fill="black" :signID="id"/>
    <circle v-if="(signData.degree-1) % 3 > 1" :cx="signWidth / 2" :cy="(signData.signType == 'Joining' || signData.signType == 'Spreading') ? height - signWidth / 2 : height" r="4" fill="black" :signID="id"/>
    <!-- check baseSign and degree, draw path and/or circles-->
  </g>
</template>

<script>


/**
 * The general Direction Sign component
 * @displayName Direction Sign
 */
export default {
  name: 'DirectionSign',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth","borderWidth", "barHeight"],
  data() {
    return {
    };
  },
  computed: {
    baseSigns () {
      let type = this.signData.signType;
      if (type == "Narrow") {
        return this.narrowSigns;
      } else if (type == "Wide") {
        return this.wideSigns;
      } else if (type == "Folding") {
        return this.foldingSigns;
      } else if (type == "Joining") {
        return this.joiningSigns;
      } else if (type == "Spreading") {
        return this.spreadingSigns;
      } else if (type == "NeitherOr") {
        return this.neitherOrSign;
      } else {
        return this.unfoldingSign;
      }
    },
    beatHeight () {
      return this.barHeight / this.$store.state["beatsPerBar"];
    },
    corners () {
      return {
        tl: {x: 0, y: (this.height - this.signWidth)}, 
        tr: {x: this.signWidth, y: (this.height - this.signWidth)}, 
        bl: {x: 0, y: this.height}, 
        br: {x: this.signWidth, y: this.height},
      }
    },
    narrowSigns () {
      let corns = this.corners;
      let baseSigns = [
        {degree: 1, path: ""},
        {name: 2, path: ""},
        {name: 3, path: ""},
        {name: 4, path: ""},
        {name: 5, path: ""},
        {name: 6, path: ""},
      ];
      let path = "M " + corns.tl.x + "," + corns.tl.y + " L " + corns.br.x + "," + corns.br.y + " M " + corns.bl.x + "," + corns.bl.y + " L " + corns.tr.x + "," + corns.tr.y;
      baseSigns[0].path = path;
      baseSigns[1].path = path;
      baseSigns[2].path = path;
      //"M " + corns.bl.x + "," + corns.bl.y + " L " + corns.tr.x + "," + corns.tr.y
      path = 
        "M " + corns.tl.x + "," + (corns.tl.y + 5) + " L " + (corns.br.x - 5) + "," + corns.br.y + 
        "M " + (corns.tl.x + 5) + "," + corns.tl.y + " L " + corns.br.x + "," + (corns.br.y - 5) + 
        "M " + corns.bl.x + "," + (corns.bl.y - 5) + " L " + (corns.tr.x - 5) + "," + corns.tr.y +
        "M " + (corns.bl.x + 5) + "," + corns.bl.y + " L " + corns.tr.x + "," + (corns.tr.y + 5);
      baseSigns[3].path = path;
      baseSigns[4].path = path;
      baseSigns[5].path = path;

      return baseSigns;
    },
    wideSigns () {
      let corns = this.corners;
      let baseSigns = [
        {degree: 1, path: ""},
        {name: 2, path: ""},
        {name: 3, path: ""},
        {name: 4, path: ""},
        {name: 5, path: ""},
        {name: 6, path: ""},
      ];
      let path = "M " + corns.tl.x + "," + corns.tl.y + " L " + corns.bl.x + "," + corns.bl.y + " L " + corns.tr.x + "," + corns.tr.y + " L " + corns.br.x + "," + corns.br.y;
      baseSigns[0].path = path;
      baseSigns[1].path = path;
      baseSigns[2].path = path;
      path = 
        "M " + corns.tl.x + "," + corns.tl.y + " L " + corns.bl.x + "," + corns.bl.y + 
        " L " + corns.tr.x + "," + (corns.tr.y + 7) + 
        " M " + corns.br.x + "," + corns.br.y + " L " + corns.tr.x + "," + corns.tr.y +
        " L " + corns.bl.x + "," + (corns.bl.y - 7);
      baseSigns[3].path = path;
      baseSigns[4].path = path;
      baseSigns[5].path = path;

      return baseSigns;
    },
    foldingSigns () {
      let corns = this.corners;
      let baseSigns = [
        {degree: 1, path: ""},
        {name: 2, path: ""},
        {name: 3, path: ""},
        {name: 4, path: ""},
        {name: 5, path: ""},
        {name: 6, path: ""},
      ];
      let path = 
        "M " + corns.tl.x + "," + corns.tl.y + 
        " L " + ((corns.br.x - corns.bl.x) / 2) + "," + corns.bl.y + 
        " L " + corns.tr.x + "," + corns.tr.y + 
        " M " + corns.bl.x + "," + corns.bl.y + 
        " L " + corns.br.x + "," + corns.br.y;
      baseSigns[0].path = path;
      baseSigns[1].path = path;
      baseSigns[2].path = path;
      path = 
        path +
        " M " + (corns.tl.x) + "," + (corns.tl.y + 10) + 
        " L " + (((corns.br.x - corns.bl.x) / 2) - 5) + "," + corns.bl.y + 
        " M " + (corns.tr.x) + "," + (corns.tr.y + 10) + 
        " L " + (((corns.br.x - corns.bl.x) / 2) + 5) + "," + corns.bl.y; 
      baseSigns[3].path = path;
      baseSigns[4].path = path;
      baseSigns[5].path = path;

      return baseSigns;
    },
    joiningSigns () {
      let corns = this.corners;
      let baseSigns = [
        {degree: 1, path: ""},
        {name: 2, path: ""},
        {name: 3, path: ""},
        {name: 4, path: ""},
        {name: 5, path: ""},
        {name: 6, path: ""},
      ];
      let path = 
        "M " + (corns.tl.x + 10) + "," + corns.tl.y + 
        " L " + corns.bl.x + "," + (corns.bl.y - this.signWidth / 1.5) + 
        " L " + corns.br.x + "," + (corns.br.y - this.signWidth / 1.5) +
        " L " + (corns.tr.x - 10) + "," + corns.tr.y;
      baseSigns[0].path = path;
      baseSigns[1].path = path;
      baseSigns[2].path = path;
      path = 
        path + 
        " M " + (corns.bl.x + 3) + "," + (corns.bl.y - this.signWidth / 1.5 - 5) + 
        " L " + (corns.br.x - 3) + "," + (corns.br.y - this.signWidth / 1.5 - 5);
      baseSigns[3].path = path;
      baseSigns[4].path = path;
      baseSigns[5].path = path;

      return baseSigns;
    },
    spreadingSigns () {
      let corns = this.corners;
      let baseSigns = [
        {degree: 1, path: ""},
        {name: 2, path: ""},
        {name: 3, path: ""},
        {name: 4, path: ""},
        {name: 5, path: ""},
        {name: 6, path: ""},
      ];
      let path = 
        "M " + corns.tl.x + "," + corns.tl.y + 
        " L " + (corns.bl.x + 10) + "," + (corns.bl.y - this.signWidth / 1.5) + 
        " L " + (corns.br.x - 10) + "," + (corns.br.y - this.signWidth / 1.5) +
        " L " + corns.tr.x + "," + corns.tr.y;
      baseSigns[0].path = path;
      baseSigns[1].path = path;
      baseSigns[2].path = path;
      path = 
        path + 
        " M " + (corns.bl.x + 6) + "," + (corns.bl.y - this.signWidth / 1.5 - 5) + 
        " L " + (corns.br.x - 6) + "," + (corns.br.y - this.signWidth / 1.5 - 5);
      baseSigns[3].path = path;
      baseSigns[4].path = path;
      baseSigns[5].path = path;

      return baseSigns;
    },
    neitherOrSign () {
      let corns = this.corners;
      let baseSigns = [
        {degree: 1, path: ""},
      ]
      let path = 
        "M " + corns.tl.x + "," + corns.tl.y + 
        " L " + corns.bl.x + "," + corns.bl.y + 
        " L " + corns.tr.x + "," + corns.tr.y + 
        " L " + corns.br.x + "," + corns.br.y +
        " M " + (corns.tl.x + this.signWidth / 3) + "," + (corns.tl.y + this.signWidth / 3) +
        " L " + (corns.br.x - this.signWidth / 3) + "," + (corns.br.y - this.signWidth / 3);
      baseSigns[0].path = path;

      return baseSigns;
    },
    unfoldingSign () {
      let corns = this.corners;
      let baseSigns = [
        {degree: 1, path: ""},
      ]
      let path = 
        "M " + (corns.bl.x + 5) + "," + corns.bl.y + 
        " L " + ((corns.tr.x - corns.tl.x) / 2) + "," + corns.tl.y + 
        " L " + (corns.br.x - 5) + "," + corns.br.y + 
        " M " + corns.bl.x + "," + (corns.bl.y - 10) +
        " L " + corns.br.x + "," + (corns.br.y - 10);
      baseSigns[0].path = path;

      return baseSigns;
    },
  },
  mounted () {
    
  },
  methods: {
    
  },
}
</script>


<style scoped>

</style>