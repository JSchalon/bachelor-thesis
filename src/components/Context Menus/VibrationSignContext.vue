<template>
    <div>
      <RadioOption 
      :options="pinType" 
      :initState="pinType.findIndex(obj => obj.text == signData.upperPin.signType)"
      :optionText="'Upper Angle Level'"
      :active="displayPinOptions"
      @switchState="this.changeupperPin"
      />
      <SignCategoryContainer v-if="!signData.upperPin" :optionText="'Angle'" category="pins-low" :parentY="y" :active="signData.upperPin ? true : false" @updateSignData="changeupperPinAngle"/>
      <SignCategoryContainer v-if="signData.upperPin && signData.upperPin.signType == 'Low'" :optionText="'Angle'" category="pins-low" :parentY="y" :active="signData.upperPin ? true : false" @updateSignData="changeupperPinAngle"/>
      <SignCategoryContainer v-else-if="signData.upperPin && signData.upperPin.signType == 'Middle'" :optionText="'Angle'" category="pins-middle" :parentY="y" :active="signData.upperPin ? true : false" @updateSignData="changeupperPinAngle"/>
      <SignCategoryContainer v-else-if="signData.upperPin && signData.upperPin.signType == 'High'" :optionText="'Angle'" category="pins-high" :parentY="y" :active="signData.upperPin ? true : false" @updateSignData="changeupperPinAngle"/>
      <RadioOption 
        :options="pinType" 
        :initState="pinType.findIndex(obj => obj.text == signData.lowerPin.signType)"
        :optionText="'Lower Angle Level'"
        :active="displayPinOptions"
        @switchState="this.changelowerPin"
      />
      <SignCategoryContainer v-if="!signData.lowerPin" :optionText="'Angle'" category="pins-low" :parentY="y" :active="signData.lowerPin ? true : false" @updateSignData="changelowerPinAngle"/>
      <SignCategoryContainer v-if="signData.lowerPin && signData.lowerPin.signType == 'Low'" :optionText="'Angle'" category="pins-low" :parentY="y" :active="signData.lowerPin ? true : false" @updateSignData="changelowerPinAngle"/>
      <SignCategoryContainer v-else-if="signData.lowerPin && signData.lowerPin.signType == 'Middle'" :optionText="'Angle'" category="pins-middle" :parentY="y" :active="signData.lowerPin ? true : false" @updateSignData="changelowerPinAngle"/>
      <SignCategoryContainer v-else-if="signData.lowerPin && signData.lowerPin.signType == 'High'" :optionText="'Angle'" category="pins-high" :parentY="y" :active="signData.lowerPin ? true : false" @updateSignData="changelowerPinAngle"/>
      <DeleteOption :mIndex="1" @delete="emitDelete"/>
    </div>
</template>

<script>
/**
 * The context menu for the vibration sign
 * @emits updateSignData updates the sign data given by the score
 * @emits delete deletes the sign
 * @displayName Vibration Sign Context
 */
export default {
  name: "vibrationSignContext",
  props: {
    signData: Object,
    isActive: Boolean,
    signIndex: [Number, String],
    y: Number
  },
  emits: ["updateSignData", "delete"],
  data() {
    return {
      // the different pin types
      pinType: [
        {text: 'Low', img: "/pin-low-forward.svg"},
        {text: 'Middle', img: "/pin-middle.svg"},
        {text: 'High', img: "/pin-high.svg"}
      ],
      displayPinOptions: false
    };
  },
  mounted () {
    // only displays the pinoptions if both are on (deprecated)
    this.displayPinOptions = (typeof this.signData.upperPin == "object" || typeof this.signData.lowerPin == "object");
  },
  methods: {
    /**
     * switches the pins on or off
     * @param data the boolean
     */
    changePins (data) {
      this.displayPinOptions = data;
      if (!data) {
        this.newSignData ({upperPin: false, lowerPin: false});
      } else {
        this.newSignData ({upperPin: {signType: "Low", degree: 0}, lowerPin: {signType: "Low", degree: 0}});
      }
    },
    /**
     * changes the upper pin type
     * @param index the index in the pinType array
     */
    changeupperPin (index) {
      let obj = JSON.parse(JSON.stringify(this.signData.upperPin)) || {signType: "Low", degree: 0};
      obj.signType = this.pinType[index].text;
      this.newSignData ({upperPin: obj});
    },
    /**
     * changes the upper pin angle
     * @param data the data from the sign category container  
     */
    changeupperPinAngle (data) {
      if (this.isActive) {
        let degree = data.degree;
        let obj = JSON.parse(JSON.stringify(this.signData.upperPin)) || {signType: "Low", degree: 0};
        obj.degree = degree;
        this.newSignData ({upperPin: obj});
      }
    },
    /**
     * changes the lower pin type
     * @param index the index in the pinType array
     */
    changelowerPin (index) {
      let obj = JSON.parse(JSON.stringify(this.signData.lowerPin)) || {signType: "Low", degree: 0};
      obj.signType = this.pinType[index].text;
      this.newSignData ({lowerPin: obj});
    },
    /**
     * changes the lower pin angle
     * @param data the data from the sign category container  
     */
    changelowerPinAngle (data) {
      if (this.isActive) {
        let degree = data.degree;
        let obj = JSON.parse(JSON.stringify(this.signData.lowerPin)) || {signType: "Low", degree: 0};
        obj.degree = degree;
        this.newSignData ({lowerPin: obj});
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
