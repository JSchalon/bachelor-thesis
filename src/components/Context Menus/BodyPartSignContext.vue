<template>
    <div>
      <SignCategoryContainer :optionText="'Type'" :category="'body-part-signs'" :parentY="y" :active="true" @updateSignData="newSignData"/>
      <OnOffOption :optionText="'Limb'" :initState="signData.limb" :active="signData.canBeLimb" @switchState="changeLimb"/>
      <RadioOption :optionText="'Top Surface'" :options="surfaceInnerOuter" :initState="signData.surface" :active="signData.limb && signData.canBeLimb" @switchState="this.changeTopSurface"/>
      <RadioOption :optionText="'Side Surface'" :options="surfaceSides" :initState="signData.surface" :active="signData.limb && signData.canBeLimb" @switchState="this.changeSideSurface"/>
      <OnOffOption :optionText="'Finger/Toe Definition'" :initState="signData.digit && signData.digit >= 1" :active="signData.signType == 'Fingers' || signData.signType == 'Toes'" @switchState="changeJointDefined"/>
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
 * @emits delete deletes the sign
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
      jointDefined: false,
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
    changeJointDefined (data) {
      let joint = 5;
      if (data && !this.signData.digit && !this.signData.joint) {
        if (this.signData.signType == "Toes") {
          joint = 4;
        }
        this.newSignData ({digit: 1, joint: joint});
      } else if (!data) {
        this.newSignData ({digit: false, joint: false});
      }
      this.jointDefined = data;
    },
    changeJoint (data) {
      this.newSignData({joint: data.joint});
    },
    changeDigit (data) {
      this.newSignData({digit: data.digit});
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
