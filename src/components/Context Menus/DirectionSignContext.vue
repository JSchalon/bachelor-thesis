<template>
    <div class="context-menu">
      <SignCategoryContainer :optionText="'Type'" :category="'direction-signs'" @updateSignData="changeType"/>
      <OnOffOption :optionText="'Hold'" :initState="signData.holding" @switchState="changeHolding"/>
      <RadioOption 
        :options="dimensions" 
        :initState="signData.dimension"
        :optionText="'Dimension'"
        @switchState="this.changeDimension"
      />
      <RadioOption 
        :options="positions" 
        :initState="signData.position"
        :optionText="'Position'"
        @switchState="this.changePosition"
      />
      <OnOffOption :optionText="'Angle Definition'" :initState="definitionActive" @switchState="changeDefinition"/>
      <div v-if="definitionActive">
        <RadioOption 
          :options="definitions" 
          :initState="signData.definition.signType"
          :optionText="'Pin Dimension'"
          @switchState="changeDefinitionPin"
        />
        <SliderOption :optionText="'Angle'" :initState="signData.definition.degree" :stops="8" @switchState="changeDefinitionAngle" :id="'direction-definition-slider-' + signIndex"/>
      </div>
      <!--
        Todo: 
          - hodl (on/off)
          - presign (body part): active -> display presign options
          - - presign (body part) (on/off)
            - type -> category
            - limb (if applicable)
            - if limb: surface (radio)
          - presign (space measurement sign)
            - type (category)
            - if not unfoldnig/neitherOr ->  degree (slider, 0-5)
      -->
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
    signIndex: [Number, String]
  },
  emits: ["updateSignData", "delete"],
  data() {
    return {
      dimensions: [
        {text: 'Low', img: '/direction-sign-radio/layer-down.svg'},
        {text: 'Middle', img: '/direction-sign-radio/layer-middle.svg'},
        {text: 'High', img: '/direction-sign-radio/layer-up.svg'}
      ],
      definitions: [
        {text: 'Low', img: false},
        {text: 'Middle', img:  false},
        {text: 'High', img:  false}
      ],
      positions: [
        {text: '---', img: false},
        {text: 'Infront', img: false},
        {text: 'Behind', img: false}
      ],
      definitionActive: false,
    };
  },
  computed: {
    
  },
  mounted () {
    this.definitionActive = (typeof this.signData.definition == "object");
  },
  methods: {
    /**
     * An example function changing the border color based of an radio Option, as an example for the actual radio funcitionality
     * @arg color the boolean changing the color 
     */
    changeDimension(data) {
      let newSignData = this.signData;
      newSignData.dimension = data.text;

      this.newSignData (newSignData);
    },
    changeType (data) {
      this.newSignData({signType: data.signType})
    },
    changeHolding (data) {
      this.newSignData({holding: data})
    },
    changePosition (data) {
      this.newSignData({position: data.text})
    },
    changeDefinition (data) {
      this.definitionActive = data;
      if (data) {
        this.newSignData({definition: {signType: "Low", degree: 0, bgVisible: true}})
      } else {
        this.newSignData({definition: false});
      }
    },
    changeDefinitionPin (data) {
      let obj = JSON.parse(JSON.stringify(this.signData.definition)) || {signType: "Low", degree: 0, bgVisible: true};
      obj.signType = data.text;
      this.newSignData ({definition: obj});
    },
    changeDefinitionAngle (data) {
      if (this.isActive) {
        let degree = data.data * 45;
        if (data.data > 7) {
          degree = -1;
        }
        let obj = JSON.parse(JSON.stringify(this.signData.definition)) || {signType: "Low", degree: 0, bgVisible: true};
        obj.degree = degree;
        this.newSignData ({definition: obj});
      }
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
