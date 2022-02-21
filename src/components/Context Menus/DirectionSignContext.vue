<template>
    <div class="context-menu">
      <RadioOption 
        :mIndex="0" 
        :options="dimensions" 
        :initState="getInitDimension()"
        :optionText="'Dimension'"
        @switchState="this.changeDimension"
      />
      <!--
        Todo: 
          - hodl (on/off)
          - direction (category)
          - presign (body part): active -> display presign options
          - - presign (body part) (on/off)
            - type -> category
            - limb (if applicable)
            - if limb: surface (radio)
          - presign (space measurement sign)
            - type (category)
            - if not unfoldnig/neitherOr ->  degree (slider, 0-5)
          - angle (on/off)
            - if angle: 
              type(radio) (maybe actually set type?)
              degree (slider 0-7)
          - outer position (on/off)
            type(radio) (maybe actually set type?)
            - degree(slider 0-7)
            
      -->
      <DeleteOption :mIndex="1" @delete="emitDelete"/>
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
    signIndex: [Number, String]
  },
  emits: ["updateSignData", "delete"],
  data() {
    return {
      dimensions: [
        {dimension: 'Low', img: '/direction-sign-radio/layer-down.svg'},
        {dimension: 'Middle', img: '/direction-sign-radio/layer-middle.svg'},
        {dimension: 'High', img: '/direction-sign-radio/layer-up.svg'}
      ],
    };
  },
  computed: {
    
  },
  mounted () {
    
  },
  methods: {
    getInitDimension () {
      return this.dimensions.findIndex(obj => obj.dimension == this.signData.dimension); 
    },
    /**
     * An example function changing the border color based of an radio Option, as an example for the actual radio funcitionality
     * @arg color the boolean changing the color 
     */
    changeDimension(data) {
      console.log(data)
      let newSignData = this.signData;
      newSignData.dimension = data.dimension;

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
