<template>
    <div>
      <RadioOption 
        :mIndex="0" 
        :options="[
          {color: 'black', img: '/direction-sign-radio/layer-down.svg'},
          {color: 'blue', img: '/direction-sign-radio/layer-middle.svg'},
          {color: 'red', img: '/direction-sign-radio/layer-up.svg'}
        ]" 
        :initState="0"
        :optionText="'Dimension'"
        @switchState="this.changeBorderColor"
      />
      <OnOffOption :mIndex="1" :initState="false" :optionText="'Color'" @switchState="this.changeColor"/>
      <SignCategoryContainer :mIndex="2" :optionText="'Direction'"/>
      <SliderOption :mIndex="3" :optionText="'Test'" :initState="0" :stops="2"/>
      <DeleteOption :mIndex="4" @delete="emitDelete"/>
    </div>
</template>

<script>

/**
 * The context menu for the generic sign
 * @emits updateSignData updates the sign data given by the score
 * @emits delete deletes the sign
 * @displayName GenericSignContext
 */
export default {
  name: "GenericSignContext",
  inject: [],
  props: {
    signData: Object,
    isActive: Boolean,
    signIndex: [Number, String]
  },
  emits: ["updateSignData", "delete"],
  data() {
    return {

    };
  },
  computed: {
    
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
