<template>
    <g :class="isActive ? 'active' : 'inactive'" :transform="'translate(' + x + ',' + y +')'">
      <rect x="0" y="0" height="400" :width="contextMenuWidth" fill="white" stroke="black"/>
      <RadioOption :mIndex="0" :options="['black','blue','red']" :initState="0" :optionText="'Border Color'" @switchState="this.changeBorderColor"/>
      <OnOffOption :mIndex="1" :initState="false" :optionText="'Color'" @switchState="this.changeColor"/>
      <SignCategoryContainer :mIndex="2" :optionText="'Direction'"/>
      <DeleteOption :mIndex="3" @delete="emitDelete"/>
    </g>
</template>

<script>
import DeleteOption from "../Context Menu Items/DeleteOption.vue"
import OnOffOption from "../Context Menu Items/OnOffOption.vue"
import RadioOption from "../Context Menu Items/RadioOption.vue"
import SignCategoryContainer from "../Context Menu Items/SignCategoryContainer.vue"

//TODO: fully implement options -> requires sign library and signs
//TODO: load initState from signData

/**
 * The context menu for the generic sign
 * @emits updateSignData updates the sign data given by the score
 * @emits delete deletes the sign
 * @displayName GenericSignContext
 */
export default {
  name: "GenericSignContext",
  components: {
    DeleteOption,
    OnOffOption,
    RadioOption,
    SignCategoryContainer,
  },
  inject: ["contextMenuWidth"],
  props: {
    signData: Object,
    isActive: Boolean,
    x: Number,
    y: Number,
    signIndex: [Number, String]
  },
  emits: ["updateSignData", "delete"],
  data() {
    return {

    };
  },
  mounted () {
  },
  methods: {
    /**
     * An example function changing the border color based of an radio Option, as an example for the actual radio funcitionality
     * @arg color the boolean changing the color 
     */
    changeBorderColor(color) {
      let newSignData = this.signData;
      newSignData.borderColor = color;

      this.newSignData (newSignData);
    },
    /**
     * An example function changing the color based of an on/Off Option, as an example for the actual on/off funcitionality
     * @arg color the boolean changing the color 
     */
    changeColor(colorState) {
      let newSignData = this.signData;
      if (colorState) {
        newSignData.color = "red";
      } else {
        newSignData.color = "white";
      }
      this.newSignData (newSignData);
    },
    /**
     * The function that sends the updated sign data back to the score
     * @arg data the updated sign data 
     */
    newSignData (data) {
      this.$emit("updateSignData", {index: parseInt(this.signIndex), data: data});
    },
    emitDelete() {
      this.$emit("delete", parseInt(this.signIndex))
    }
  },
  computed: {
    
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  g.inactive {
    display: none;
  }

  g.active {
    display: block;
  }

  
</style>
