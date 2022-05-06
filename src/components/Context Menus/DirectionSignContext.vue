<template>
    <div>
      <SignCategoryContainer :optionText="'Type'" :category="'direction-signs'" :parentY="y" :active="true" @updateSignData="changeType"/>
      <OnOffOption :optionText="'Hold'" :initState="signData.holding" :active="true" @switchState="changeHolding"/>
      <RadioOption 
        :options="dimensions" 
        :initState="dimensions.findIndex(obj => obj.text == signData.dimension)"
        :optionText="'Vertical Level'"
        :active="true"
        @switchState="changeDimension"
      />
      <RadioOption 
        :options="positions" 
        :initState="positions.findIndex(obj => obj.text == signData.position)"
        :optionText="'Position'"
        :active="true"
        @switchState="changePosition"
      />
      <OnOffOption :optionText="'Angle definition'" :initState="definitionActive" :active="true" @switchState="changeDefinition"/>
      <RadioOption 
        :options="definitions" 
        :initState="signData.definition ? definitions.findIndex(obj => obj.text == signData.definition.signType) : 0"
        :optionText="'Angle level'"
        :active="signData.definition ? true : false"
        @switchState="changeDefinitionPin"
      />
      <SignCategoryContainer v-if="!signData.definition" :optionText="'Angle'" category="pins-low" :parentY="y" :active="signData.definition ? true : false" @updateSignData="changeType"/>
      <SignCategoryContainer v-if="signData.definition && signData.definition.signType == 'Low'" :optionText="'Angle'" category="pins-low" :parentY="y" :active="signData.definition ? true : false" @updateSignData="changeDefinitionAngle"/>
      <SignCategoryContainer v-else-if="signData.definition && signData.definition.signType == 'Middle'" :optionText="'Angle'" category="pins-middle" :parentY="y" :active="signData.definition ? true : false" @updateSignData="changeDefinitionAngle"/>
      <SignCategoryContainer v-else-if="signData.definition && signData.definition.signType == 'High'" :optionText="'Angle'" category="pins-high" :parentY="y" :active="signData.definition ? true : false" @updateSignData="changeDefinitionAngle"/>
      <DeleteOption @delete="emitDelete"/>
    </div>
</template>

<script>
/**
 * The context menu for the direction signs
 * @emits updateSignData updates the sign data given by the score
 * @emits delete deletes the sign
 * @displayName Direction Sign Context
 */
export default {
  name: "DirectionSignContext",
  inject: [],
  props: {
    signData: Object,
    isActive: Boolean,
    signIndex: [Number, String],
    y: Number,
  },
  emits: ["updateSignData", "delete"],
  data() {
    return {
      //data for the vertical dimension for the radio buttons
      dimensions: [
        {text: 'Low', img: '/direction-sign-radio/layer-down.svg'},
        {text: 'Middle', img: '/direction-sign-radio/layer-middle.svg'},
        {text: 'High', img: '/direction-sign-radio/layer-up.svg'}
      ],
      //data for the vertical pin dimension for the radio buttons
      definitions: [
        {text: 'Low', img: "/pin-low-forward.svg"},
        {text: 'Middle', img:  "/pin-middle.svg"},
        {text: 'High', img:  "/pin-high.svg"}
      ],
      //data for the relative position for the radio buttons
      positions: [
        {text: '---', img: false},
        {text: 'Infront', img: "/pin-low-forward.svg"},
        {text: 'Behind', img: "/pin-low-backward.svg"}
      ],
      definitionActive: false,
    };
  },
  computed: {
    
  },
  mounted () {
    //checks if the pin definition is active at load
    this.definitionActive = (typeof this.signData.definition == "object");
  },
  methods: {
    /**
     * changes the vertical level of the sign
     * @param index the index in the dimension array
     */
    changeDimension(index) {
      let newSignData = this.signData;
      newSignData.dimension = this.dimensions[index].text;

      this.newSignData (newSignData);
    },
    /**
     * changes the sign type
     * @param data the data from the sign category container  
     */
    changeType (data) {
      this.newSignData({signType: data.signType})
    },
    /**
     * changes the holding state
     * @param data the holding bool  
     */
    changeHolding (data) {
      this.newSignData({holding: data})
    },
    /**
     * changes the relative position
     * @param index the index of the position array  
     */
    changePosition (index) {
      if (this.positions[index].text != "---") {
        this.newSignData({position: this.positions[index].text})
      } else {
        this.newSignData({position: false})
      }
    },
    /**
     * switches the pin definition on or off
     * @param data the pin boolean  
     */
    changeDefinition (data) {
      this.definitionActive = data;
      if (data) {
        this.newSignData({definition: {signType: "Low", degree: 0, bgVisible: true}})
      } else {
        this.newSignData({definition: false});
      }
    },
    /**
     * changes the vertical level of the definition pin
     * @param index the index of the definition  
     */
    changeDefinitionPin (index) {
      let obj = JSON.parse(JSON.stringify(this.signData.definition)) || {signType: "Low", degree: 0, bgVisible: false};
      obj.signType = this.definitions[index].text;
      this.newSignData ({definition: obj});
    },
    /**
     * changes the agnle of the definition pin
     * @param data the sign category data
     */
    changeDefinitionAngle (data) {
      if (this.isActive) {
        let degree = data.degree;
        let obj = JSON.parse(JSON.stringify(this.signData.definition)) || {signType: "Low", degree: 0, bgVisible: false};
        obj.degree = degree;
        this.newSignData ({definition: obj});
      }
    },
    /**
     * The function that sends the updated sign data back to the score
     * @param data the updated sign data 
     */
    newSignData (data) {
      this.$emit("updateSignData", {index: parseInt(this.signIndex), data: data});
    },
    /**
     * emits a deletion request
     */
    emitDelete() {
      this.$emit("delete", parseInt(this.signIndex))
    }
  },
};
</script>

<style>
  .context-menu.inactive {
    display: none;
  }

  .context-menu.active {
    display: block;
  }

  .context-item-interact-img.active {
    border: 2px solid blue;
  }

  .context-menu {
    width: auto;
    position: absolute;
    border: 2px solid black;
    box-sizing: border-box;
  }

    .context-menu-item {
      width: var(--contextMenuWidth);
      background-color: white;
    }
    .context-item-text {
      margin: 0 var(--contextItemMargin);
    }

    .center-vertically {

      display: inline-flex;
      height: var(--contextItemHeight);
      align-items: center;
    }

    .context-item-interact-box {
      float: right;
      margin-right: var(--contextItemMargin);
    }

    .context-item-interact-img {
      width: var(--contextItemImageSize);
      height: var(--contextItemImageSize);
      transition: transform 0.3s ease;
    }

    .context-item-interact-img.smaller {
      width: calc(var(--contextItemImageSize) / 1.5);
      height: calc(var(--contextItemImageSize) / 1.5);
    }
</style>
