<template>
    <div class="context-menu">
      <OnOffOption :optionText="'Pins'" :initState="displayPinOptions" @switchState="changePins"/>
      <div v-if="displayPinOptions">
        <RadioOption 
        :options="pinType" 
        :initState="signData.firstPin.signType"
        :optionText="'First Pin'"
        @switchState="this.changeFirstPin"
      />
      <SliderOption :optionText="'First Pin Angle'" :initState="signData.firstPin.degree" :stops="8" @switchState="changeFirstPinAngle" :id="'vibration-pin-slider-0-' + signIndex"/>
      <RadioOption 
        :options="pinType" 
        :initState="signData.secondPin.signType"
        :optionText="'Second Pin'"
        @switchState="this.changeSecondPin"
      />
      <SliderOption :optionText="'Second Pin Angle'" :initState="signData.secondPin.degree" :stops="8" @switchState="changeSecondPinAngle" :id="'vibration-pin-slider-1-' + signIndex"/>
      </div>
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
  inject: [],
  props: {
    signData: Object,
    isActive: Boolean,
    signIndex: [Number, String]
  },
  emits: ["updateSignData", "delete"],
  data() {
    return {
      pinType: [
        {text: 'Low', img: false},
        {text: 'Middle', img: false},
        {text: 'High', img: false}
      ],
      displayPinOptions: false
    };
  },
  computed: {
    
  },
  mounted () {
    this.displayPinOptions = (typeof this.signData.firstPin == "object" || typeof this.signData.secondPin == "object");
  },
  methods: {
    changePins (data) {
      this.displayPinOptions = data;
      if (!data) {
        this.newSignData ({firstPin: false, secondPin: false});
      } else {
        this.newSignData ({firstPin: {signType: "Low", degree: 0}, secondPin: {signType: "Low", degree: 0}});
      }
      
    },
    changeFirstPin (data) {
      let obj = JSON.parse(JSON.stringify(this.signData.firstPin)) || {signType: "Low", degree: 0};
      obj.signType = data.text;
      this.newSignData ({firstPin: obj});
    },
    changeFirstPinAngle (data) {
      if (this.isActive) {
        let degree = data.data * 45;
        if (data.data > 7) {
          degree = -1;
        }
        let obj = JSON.parse(JSON.stringify(this.signData.firstPin)) || {signType: "Low", degree: 0};
        obj.degree = degree;
        this.newSignData ({firstPin: obj});
      }
    },
    changeSecondPin (data) {
      let obj = JSON.parse(JSON.stringify(this.signData.secondPin)) || {signType: "Low", degree: 0};
      obj.signType = data.text;
      this.newSignData ({secondPin: obj});
    },
    changeSecondPinAngle (data) {
      if (this.isActive) {
        let degree = data.data * 45;
        if (data.data > 7) {
          degree = -1;
        }
        let obj = JSON.parse(JSON.stringify(this.signData.secondPin)) || {signType: "Low", degree: 0};
        obj.degree = degree;
        this.newSignData ({secondPin: obj});
      }
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
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
