<template>
    <div>
      <SignCategoryContainer :optionText="'Type'" :category="'body-part-signs'" :parentY="y" :active="true" @updateSignData="newSignData"/>
      <OnOffOption :optionText="'Limb'" :initState="signData.limb" :active="signData.canBeLimb" @switchState="changeLimb"/>
      <RadioOption :optionText="'Vertical Surface'" :options="surfaceInnerOuter" :initState="surfaceInnerOuter.findIndex(obj => obj.text == surfaceTop)" :active="signData.limb && signData.canBeLimb" @switchState="this.changeTopSurface"/>
      <RadioOption :optionText="'Horizontal Surface'" :options="surfaceSides" :initState="surfaceSides.findIndex(obj => obj.text == surfaceSide)" :active="signData.limb && signData.canBeLimb" @switchState="this.changeSideSurface"/>
      <OnOffOption :optionText="'Digit definition'" :initState="'digit' in signData && signData.digit >= 0 && signData.digit !== false" :active="signData.signType == 'Fingers' || signData.signType == 'Toes'" @switchState="changeJointDefined"/>
      <SignCategoryContainer v-if="signData.signType != 'Toes'" :optionText="'Digit'" :category="'finger-digits'" :parentY="y" :active="(signData.signType == 'Fingers' || signData.signType == 'Toes') && jointDefined" @updateSignData="changeDigit"/>
      <SignCategoryContainer v-else :optionText="'Digit'" :category="'toe-digits'" :parentY="y" :active="(signData.signType == 'Fingers' || signData.signType == 'Toes') && jointDefined" @updateSignData="changeDigit"/>
      <SignCategoryContainer v-if="signData.signType != 'Toes'" :optionText="'Joint'" :category="'finger-joints'" :parentY="y" :active="(signData.signType == 'Fingers' || signData.signType == 'Toes') && jointDefined" @updateSignData="changeJoint"/>
      <SignCategoryContainer v-else :optionText="'Joint'" :category="'toe-joints'" :parentY="y" :active="(signData.signType == 'Fingers' || signData.signType == 'Toes') && jointDefined" @updateSignData="changeJoint"/>
      <DeleteOption @delete="emitDelete"/>
    </div>
</template>

<script>
/**
 * The context menu for the body part signs
 * @emits updateSignData updates the sign data given by the score
 * @emits delete request sign deletion
 * @displayName Body Part Sign Context
 */
export default {
  name: "BodyPartSignContext",
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
      //data for the outer surface radio buttons
      surfaceInnerOuter: [
        {text: "---", img: false},
        {text: 'inner', img: "/body-parts/vertical-surface-inner.svg"},
        {text: 'outer', img: "/body-parts/vertical-surface-outer.svg"}
      ],
      //data for the side surface radio buttons
      surfaceSides: [
        {text: "---", img: false},
        {text: 'littleFinger', img: "/body-parts/horizontal-surface-little.svg"},
        {text: 'thumb', img: "/body-parts/horizontal-surface-thumb.svg"}
      ],
      surfaceTop: "",
      surfaceSide: "",
      jointDefined: false,
    };
  },
  mounted () {
    // set joint if true
    if (this.signData.joint !== false) {
      this.changeJointDefined(true);
    }

    // set surface if true
    if (this.signData.surface !== false) {
      if (this.signData.surface.includes("inner")) {
        this.surfaceTop = "inner";
      } else if (this.signData.surface.includes("outer")) {
        this.surfaceTop = "outer";
      }
      if (this.signData.surface.includes("littleFinger")) {
        this.surfaceSide = "littleFinger";
      } else if (this.signData.surface.includes("thumb")) {
        this.surfaceSide = "thumb";
      }
      this.changeSurface();
    }
  },
  methods: {
    /**
     * changes the limb
     * @param data the boolean changing the limb 
     */
    changeLimb(data) {
      if (!data) {
        this.newSignData ({limb: data, surface: false});
      } else {
        this.newSignData ({limb: data});
      }
    },
    /**
     * changes the outer surface
     * @param index the index in the surfaceInnerOuter array 
     */
    changeTopSurface(index) {
      this.surfaceTop = this.surfaceInnerOuter[index].text;
      this.changeSurface();
    },
    /**
     * changes the side surface
     * @param index the index in the surfaceSides array 
     */
    changeSideSurface(index) {
      this.surfaceSide = this.surfaceSides[index].text;
      this.changeSurface();
    },
    /**
     * changes the surface string
     */
    changeSurface() {
      if ((this.surfaceTop != "" && this.surfaceTop != "---") && (this.surfaceSide != "" && this.surfaceSide != "---")) {
        this.newSignData ({surface: this.surfaceTop + "-" + this.surfaceSide});
      } else if (this.surfaceTop != "" && this.surfaceTop != "---") {
        this.newSignData ({surface: this.surfaceTop});
      } else if (this.surfaceSide != "" && this.surfaceSide != "---") {
        this.newSignData ({surface: this.surfaceSide});
      } else {
        this.newSignData ({surface: false});
      }
    },
    /**
     * changes wheter or not a specific joint is defined (fingers, toes)
     */
    changeJointDefined (data) {
      let joint = 0;
      if (data && !this.signData.digit && !this.signData.joint) {
        this.newSignData ({digit: 1, joint: joint});
      } else if (!data) {
        this.newSignData ({digit: false, joint: false});
      }
      this.jointDefined = data;
    },
    /**
     * change the active joint (fingers, toes)
     */
    changeJoint (data) {
      this.newSignData({joint: data.joint});
    },
    /**
     * changes the active digit (fingers, toes)
     */
    changeDigit (data) {
      this.newSignData({digit: data.digit});
    },
    /**
     * The function that sends the updated sign data back to the score
     * @param data the updated sign data 
     */
    newSignData (data) {
      this.$emit("updateSignData", {index: parseInt(this.signIndex), data: data});
    },
    /**
     * Emits the deletion request for the sign
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
    background-color: white;
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
