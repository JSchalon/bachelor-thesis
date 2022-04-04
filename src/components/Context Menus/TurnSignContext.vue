<template>
    <div>
      <SignCategoryContainer :optionText="'Type'" :category="'turn-signs'" :parentY="y" :active="true" @updateSignData="newSignData"/>
      <OnOffOption :optionText="'Hold'" :initState="signData.holding" :active="true" @switchState="changeHolding"/>
      <RadioOption 
        :options="definitionTypes" 
        :initState="signData.definition ? signData.definition.baseType : signData.definition"
        :optionText="'Definition'"
        :active="true"
        @switchState="changeDefinition"
      />

        <RadioOption 
          :options="definitions" 
          :initState="signData.definition ? signData.definition.signType : false"
          :optionText="'Angle level'"
          :active="signData.definition && signData.definition.baseType == 'Pin'"
          @switchState="changeDefinitionPin"
        />
        <SignCategoryContainer v-if="!signData.definition || signData.definition.baseType == 'SpaceMeasurementSign'" :optionText="'Angle'" category="pins-low" :parentY="y" :active="signData.definition && signData.definition.baseType != 'SpaceMeasurementSign' ? true : false" @updateSignData="changeType"/>
        <SignCategoryContainer v-if="signData.definition && signData.definition.signType == 'Low'" :optionText="'Angle'" category="pins-low" :parentY="y" :active="signData.definition ? true : false" @updateSignData="changeDefinitionPinAngle"/>
        <SignCategoryContainer v-else-if="signData.definition && signData.definition.signType == 'Middle'" :optionText="'Angle'" category="pins-middle" :parentY="y" :active="signData.definition ? true : false" @updateSignData="changeDefinitionPinAngle"/>
        <SignCategoryContainer v-else-if="signData.definition && signData.definition.signType == 'High'" :optionText="'Angle'" category="pins-high" :parentY="y" :active="signData.definition ? true : false" @updateSignData="changeDefinitionPinAngle"/>

        <SignCategoryContainer :optionText="'Space Measurement Sign'" :category="'space-measurement-signs'" :parentY="y" :active="signData.definition && signData.definition.baseType == 'SpaceMeasurementSign'" @updateSignData="changeDefinitionSpace"/>
        <SignCategoryContainer v-if="!signData.definition || signData.definition.baseType == 'Pin' || signData.definition.signType == 'Unfolding' || signData.definition.signType == 'NeitherOr'" :optionText="'Degree'" :category="'wide-signs'" :parentY="y" :active="false" @updateSignData="changeDefinitionSpaceDegree"/>
        <SignCategoryContainer v-if="signData.definition && signData.definition.signType == 'Narrow'" :optionText="'Degree'" :category="'narrow-signs'" :parentY="y" :active="true" @updateSignData="changeDefinitionSpaceDegree"/>
        <SignCategoryContainer v-if="signData.definition && signData.definition.signType == 'Wide'" :optionText="'Degree'" :category="'wide-signs'" :parentY="y" :active="true" @updateSignData="changeDefinitionSpaceDegree"/>
        <SignCategoryContainer v-if="signData.definition && signData.definition.signType == 'Joining'" :optionText="'Degree'" :category="'joining-signs'" :parentY="y" :active="true" @updateSignData="changeDefinitionSpaceDegree"/>
        <SignCategoryContainer v-if="signData.definition && signData.definition.signType == 'Spreading'" :optionText="'Degree'" :category="'spreading-signs'" :parentY="y" :active="true" @updateSignData="changeDefinitionSpaceDegree"/>
        <SignCategoryContainer v-if="signData.definition && signData.definition.signType == 'Folding'" :optionText="'Degree'" :category="'folding-signs'" :parentY="y" :active="true" @updateSignData="changeDefinitionSpaceDegree"/>

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
    signIndex: [Number, String],
    y: Number
  },
  emits: ["updateSignData", "delete"],
  data() {
    return {
      definitions: [
        {text: 'Low', img: "/pin-low-forward.svg"},
        {text: 'Middle', img: "/pin-middle.svg"},
        {text: 'High', img: "/pin-high.svg"}
      ],
      definitionTypes: [
        {text: '---', img: false},
        {text: 'Pin', img: "/pin-low-forward.svg"},
        {text: 'Space Measurement', img: "/space-measurement-sign.svg"}
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
    changeHolding (data) {
      this.newSignData({holding: data})
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
      let obj = JSON.parse(JSON.stringify(this.signData.definition)) || {baseType: "Pin", signType: "Low", degree: 0, bgVisible: false};
      obj.signType = data.text;
      this.newSignData ({definition: obj});
    },
    changeDefinitionPinAngle (data) {
      if (this.isActive) {
        let degree = data.degree;
        let obj = JSON.parse(JSON.stringify(this.signData.definition)) || {baseType: "Pin", signType: "Low", degree: 0, bgVisible: false};
        obj.degree = degree;
        this.newSignData ({definition: obj});
      }
    },
    changeDefinitionSpace(data) {
      this.newSignData ({definition: data});
    },
    changeDefinitionSpaceDegree (data) {
      if (this.isActive) {
        let degree = data.degree;
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
