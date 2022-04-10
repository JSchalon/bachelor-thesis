<template>
    <div>
      <SignCategoryContainer :optionText="'Type'" :category="'space-measurement-signs'" :parentY="y" :active="true" @updateSignData="changeType"/>
      <SignCategoryContainer v-if="signData.signType == 'Unfolding' || signData.signType == 'NeitherOr'" :optionText="'Degree'" :category="'wide-signs'" :parentY="y" :active="false" @updateSignData="newSignData"/>
      <SignCategoryContainer v-if="signData.signType == 'Narrow'" :optionText="'Degree'" :category="'narrow-signs'" :parentY="y" :active="true" @updateSignData="newSignData"/>
      <SignCategoryContainer v-if="signData.signType == 'Wide'" :optionText="'Degree'" :category="'wide-signs'" :parentY="y" :active="true" @updateSignData="newSignData"/>
      <SignCategoryContainer v-if="signData.signType == 'Joining'" :optionText="'Degree'" :category="'joining-signs'" :parentY="y" :active="true" @updateSignData="newSignData"/>
      <SignCategoryContainer v-if="signData.signType == 'Spreading'" :optionText="'Degree'" :category="'spreading-signs'" :parentY="y" :active="true" @updateSignData="newSignData"/>
      <SignCategoryContainer v-if="signData.signType == 'Folding'" :optionText="'Degree'" :category="'folding-signs'" :parentY="y" :active="true" @updateSignData="newSignData"/>
      <OnOffOption :optionText="'Hold'" :initState="signData.holding" :active="true" @switchState="changeHolding"/>
      <DeleteOption @delete="emitDelete"/>
    </div>
</template>

<script>
/**
 * The context menu for the space measurement signs
 * @emits updateSignData updates the sign data given by the score
 * @emits delete deletes the sign
 * @displayName Space Measurement Sign Context
 */
export default {
  name: "SpaceMeasurementSignContext",
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
    };
  },
  computed: {
    
  },
  mounted () {
    
  },
  methods: {
    changeDegree (data) {
      if (this.isActive) {
        this.newSignData ({degree: (data.data + 1)});
      }
    },
    changeType (data) {
      if (data.signType != "Unfolding" && data.signType != "NeitherOr" ) {
        this.newSignData ({signType: data.signType});
      } else {
        this.newSignData ({signType: data.signType, degree: 1});
      }
    },
    changeHolding (data) {
      this.newSignData({holding: data})
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
