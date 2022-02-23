<template>
    <div class="context-menu">
      <SignCategoryContainer :optionText="'Type'" :category="'body-part-signs'" @updateSignData="newSignData"/>
      <OnOffOption v-show="signData.canBeLimb" :optionText="'Limb'" :initState="signData.limb" @switchState="changeLimb"/>
      <RadioOption v-show="signData.limb && signData.canBeLimb" :optionText="'Top Surface'" :options="surfaceInnerOuter" :initState="signData.surface" @switchState="this.changeTopSurface"/>
      <RadioOption v-show="signData.limb && signData.canBeLimb" :optionText="'Side Surface'" :options="surfaceSides" :initState="signData.surface" @switchState="this.changeSideSurface"/>
      <div v-if="signData.signType == 'Fingers'">
        <SliderOption :optionText="'Digit'" :initState="signData.digit" :stops="5" @switchState="changeDigit" :id="'body-part-finger-slider-0'"/>
        <SliderOption :optionText="'Finger'" :initState="signData.finger" :stops="5" @switchState="changeFinger" :id="'body-part-finger-slider-1'"/>
      </div>
      <div v-if="signData.signType == 'Toes'">
        <SliderOption :optionText="'Digit'" :initState="signData.digit" :stops="4" @switchState="changeDigit" :id="'body-part-toe-slider-0'"/>
        <SliderOption :optionText="'Toe'" :initState="signData.toe" :stops="5" @switchState="changeToe" :id="'body-part-toe-slider-1'"/>
      </div>
      <DeleteOption @delete="emitDelete"/>
    </div>
</template>

<script>
/**
 * The context menu for the body part signs
 * @emits updateSignData updates the sign data given by the score
 * @emits delete deletes the sign
 * @displayName Body Part Sign Context
 */
export default {
  name: "BodyPartSignContext",
  inject: [],
  props: {
    signData: Object,
    isActive: Boolean,
    signIndex: [Number, String]
  },
  emits: ["updateSignData", "delete"],
  data() {
    return {
      surfaceInnerOuter: [
        {text: "---", img: false},
        {text: 'inner', img: false},
        {text: 'outer', img: false}
      ],
      surfaceSides: [
        {text: "---", img: false},
        {text: 'littleFinger', img: false},
        {text: 'thumb', img: false}
      ],
      surfaceTop: "",
      surfaceSide: "",
    };
  },
  computed: {
    
  },
  mounted () {
    
  },
  methods: {
    /**
     * An example function changing the color based of an on/Off Option, as an example for the actual on/off funcitionality
     * @arg data the boolean changing the limb 
     */
    changeLimb(data) {
      this.newSignData ({limb: data});
    },
    changeTopSurface(data) {
      this.surfaceTop = data.text;
      this.changeSurface();
    },
    changeSideSurface(data) {
      this.surfaceSide = data.text;
      this.changeSurface();
    },
    changeSurface() {
      this.newSignData ({surface: this.surfaceTop + " " + this.surfaceSide});
    },
    changeFinger (data) {
      if (this.isActive) {
        this.newSignData({finger: data.data});
      }
    },
    changeToe (data) {
      if (this.isActive) {
        this.newSignData({toe: data.data});
      }
    },
    changeDigit (data) {
      if (this.isActive) {
        this.newSignData({digit: data.data});
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
