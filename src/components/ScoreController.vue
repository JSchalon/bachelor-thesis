<template>
  <div>
    <Header/>
    <SignLibrary/>
    <div id="interactionBox">
      <InteractionMenu/>
      <Score :signs="signs" @editSign="editSigns"/>
    </div>
  </div>
</template>

<script>
import InteractionMenu from "./InteractionMenu.vue";
import SignLibrary from "./SignLibrary.vue";
import Score from "./Score.vue";
import Header from "./Header.vue";

/**
 * The visual grid component
 * @displayName Grid
 */
export default {
  name: "Grid",
  components: {
    Header,
    InteractionMenu,
    SignLibrary,
    Score
  },
  inject: [],
  props: {
    
  },
  data() {
    return {
      signs: [
        {isSelected: false, purpose: "dummy sign", signData: {borderColor: "black", color: "white"}},
        {isSelected: false, height: 100, x: 95, y: 100, signData: {signType: "GenericSign", borderColor: "black", color: "white", side: "left", col: -2, bar: 2, beat: 0, canResize: true, }},
        {isSelected: false, height: 50, x: 15, y: 0, signData: {signType: "GenericSign", borderColor: "black", color: "white", side: "left", col: -3, bar: 2, beat: 3, canResize: true, }},
        {isSelected: false, height: 100, x: 95, y: 0, signData: {signType: "GenericSign", borderColor: "black", color: "white", side: "left", col: -2, bar: 2, beat: 2, canResize: true, }},
      ],
      xmlScore: "",
    };
  },
  computed: {
    
  },
  mounted () {
    
  },
  methods: {
    editSigns(obj) {
      if (obj.type == "add") {
        this.addSign(obj.data);
      } else if (obj.type == "move") {
        this.moveSign(obj.index, obj.data);
      } else if (obj.type == "resize") {
        this.resizeSign(obj.index, obj.data);
      } else if (obj.type == "changeSelection") {
        this.changeSelect(obj.index, obj.data);
      } else if (obj.type == "changeSignData") {
        this.changeSignData(obj.index, obj.data);
      } else if (obj.type == "delete") {
        this.deleteSign(obj.index);
      }
    },
    addSign (data) {
      this.signs.push(data);
      
    },
    moveSign (index, data) {
      this.signs[index].x = data.x;
      this.signs[index].y = data.y;
    },
    resizeSign (index, data) {
      this.signs[index].height = data.height;
    },
    changeSelect (index, data) {
      this.signs[index].isSelected = data.isSelected;
    },
    changeSignData (index, data) {
      for (const [key, value] of Object.entries(data)) {
        this.signs[index][key] = value;
      }
    },
    deleteSign (index) {
      this.signs.splice(index, 1);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #interactionBox {
    width: 84%;
    float: right;
  }
</style>
