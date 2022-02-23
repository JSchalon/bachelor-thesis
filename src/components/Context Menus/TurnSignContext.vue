<template>
    <div class="context-menu">
      <!--
        Todo: 
          - hodl
          - type (radio)
          - presign (body part) (on/off)
            - type -> category
            - limb (if applicable)
            - if limb: surface (radio)
          - presign (space measurement sign)
            - type (category)
            - if not unfoldnig/neitherOr ->  degree (slider, 0-5)
            - if space
              type (cat)
              degree (slider 0-5)
      -->
      <RadioOption 
        :options="types" 
        :initState="signData.signType"
        :optionText="'Type'"
        @switchState="changeType"
      />
      <RadioOption 
        :options="definitionTypes" 
        :initState="signData.definition ? signData.definition.baseType : signData.definition"
        :optionText="'Turn definition'"
        @switchState="changeDefinition"
      />
      <div v-if="signData.definition && signData.definition.baseType == 'Pin'">
        <RadioOption 
          :options="definitions" 
          :initState="signData.definition.signType"
          :optionText="'Pin Dimension'"
          @switchState="changeDefinitionPin"
        />
        <SliderOption :optionText="'Angle'" :initState="signData.definition.degree" :stops="8" @switchState="changeDefinitionPinAngle" :id="'direction-definition-slider-' + signIndex"/>
      </div>
      <div v-else-if="signData.definition && signData.definition.baseType == 'SpaceMeasurementSign'">
        <SignCategoryContainer :optionText="'Space Measurement Sign'" :category="'space-measurement-signs'" @updateSignData="changeDefinitionSpace"/>
        <SliderOption :optionText="'Angle'" :initState="signData.definition.degree" :stops="5" @switchState="changeDefinitionSpaceDegree" :id="'direction-definition-slider-' + signIndex"/>
      </div>
      <DeleteOption :mIndex="0" @delete="emitDelete"/>
    </div>
</template>

<script>
/**
 * The context menu for the turn signs
 * @emits updateSignData updates the sign data given by the score
 * @emits delete deletes the sign
 * @displayName Turn Sign Context
 */
export default {
  name: "TurnSignContext",
  inject: [],
  props: {
    signData: Object,
    isActive: Boolean,
    signIndex: [Number, String]
  },
  emits: ["updateSignData", "delete"],
  data() {
    return {
      types: [
        {text: 'Left turn', img: false},
        {text: 'Right turn', img: false},
        {text: 'Any turn', img: false},
      ],
      definitions: [
        {text: 'Low', img: false},
        {text: 'Middle', img:  false},
        {text: 'High', img:  false}
      ],
      definitionTypes: [
        {text: '---', img: false},
        {text: 'Pin', img:  false},
        {text: 'SpaceMeasurementSign', img:  false}
      ],
    };
  },
  computed: {
    
  },
  mounted () {
  },
  methods: {
    changeType(data) {
      this.newSignData ({signType: data.text});
    },
    changeDefinition (data) {
      if (data.text != "---") {
        if (data.text == "Pin") {
          this.newSignData({definition: {baseType: "Pin", signType: "Low", degree: 0, bgVisible: true}})
        } else {
          this.newSignData({definition: {baseType: "SpaceMeasurementSign", signType: "Narrow", degree: 1}})
        }
      } else {
        this.newSignData({definition: false});
      }
    },
    changeDefinitionPin (data) {
      let obj = JSON.parse(JSON.stringify(this.signData.definition)) || {baseType: "Pin", signType: "Low", degree: 0, bgVisible: true};
      obj.signType = data.text;
      this.newSignData ({definition: obj});
    },
    changeDefinitionPinAngle (data) {
      if (this.isActive) {
        let degree = data.data * 45;
        if (data.data > 7) {
          degree = -1;
        }
        let obj = JSON.parse(JSON.stringify(this.signData.definition)) || {baseType: "Pin", signType: "Low", degree: 0, bgVisible: true};
        obj.degree = degree;
        this.newSignData ({definition: obj});
      }
    },
    changeDefinitionSpace(data) {
      this.newSignData ({definition: data});
    },
    changeDefinitionSpaceDegree (data) {
      if (this.isActive) {
        let degree = data.data + 1;
        let obj = JSON.parse(JSON.stringify(this.signData.definition));
        obj.degree = degree;
        this.newSignData ({definition: obj});
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
