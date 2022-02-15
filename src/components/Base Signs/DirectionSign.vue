<template>
  <g>
    <polygon 
      class="draggable actual-sign" 
      :class="{active: isSelected}" 
      :points="baseSigns[variation.base].points" 
      :transform="transform" stroke="black" 
      :stroke-width="isSelected ? borderWidth + 1: borderWidth"
      :signID="id"
    />
    <!-- add aditional stuff to display, like another sign or smth-->
  </g>
</template>

<script>


/**
 * The sign library component
 * @displayName Sign Library
 */
export default {
  name: 'SignLibrary',
  props: {
    isSelected: Boolean,
    id: Number,
    signData: Object,
    height: Number,
  },
  inject: ["signWidth","borderWidth", "barHeight"],
  data() {
    return {
      variations: [
        {name: "Left forward direction", base: 1, transform: []},
        {name: "Forward direction left", base: 0, transform: []},
        {name: "Forward direction right", base: 0, transform: ["mirror-y"]},
        {name: "Right forward direction", base: 1, transform: ["mirror-y"]},

        {name: "Left direction", base: 2, transform: []},
        {name: "In place", base: 3, transform: []},
        {name: "Right direction", base: 2, transform: ["mirror-y"]},

        {name: "Left backward direction", base: 1, transform: ["mirror-x"]},
        {name: "Backward direction left", base: 0, transform: ["mirror-x"]},
        {name: "Backward direction right", base: 0, transform: ["mirror-x", "mirror-y"]},
        {name: "Right backward direction", base: 1, transform: ["mirror-x", "mirror-y"]},
      ],
      //handle pattern on svg canvas level
      pattern: [
        {name: "low", svg: ``},
        {name: "middle", svg: ``},
        {name: "high", svg: ``},
      ],
    };
  },
  computed: {
    baseSigns () {
      let baseSigns = [
        {name: "straight", points: ""},
        {name: "diagonal", points: ""},
        {name: "sideways", points: ""},
        {name: "place", points: ""},
      ];
      let straigtPoints = "0,0 " + (this.signWidth / 2) + ",0 " + (this.signWidth / 2) + "," + (this.beatHeight / 2) + " " + this.signWidth + "," + (this.beatHeight / 2) + " " + this.signWidth + "," + this.height + " 0," + this.height;
      baseSigns[0].points = straigtPoints;
      let diagonalPoints = "0,0 " + this.signWidth + "," + (this.beatHeight / 2) + " " + this.signWidth + "," + this.height + " 0," + this.height;
      baseSigns[1].points = diagonalPoints;
      let sidewaysPoints = this.signWidth + ",0 0," + (this.height / 2) + " " + this.signWidth + "," + this.height;
      baseSigns[2].points = sidewaysPoints;
      let placePoints = "0,0 " + this.signWidth + ",0 " + this.signWidth + "," + this.height + " 0," + this.height;
      baseSigns[3].points = placePoints;

      return baseSigns;
    },
    beatHeight () {
      return this.barHeight / this.$store.state["beatsPerBar"];
    },
    transform() {
      let transformString = "";
      let scale = [1,1];
      let translate = [0,0];
      for (let i = 0; i < this.variation.transform.length; i++) {
        if (this.variation.transform[i] == "mirror-x") {
          scale[1] = -1;
          translate[1] = this.height;
        } else if (this.variation.transform[i] == "mirror-y") {
          scale[0] = -1;
          translate[0] = this.signWidth;
        }
        transformString = "translate(" + translate[0] + ", " +  translate[1] + ") " + "scale(" + scale[0] + ", "+ scale[1] +")";
      }
      
      return transformString;
    },
    variation () {
      return this.variations.find(o => o.name === this.signData.signType);
    }
  },
  mounted () {
    
  },
  methods: {
    
  },
}
</script>


<style scoped>

</style>