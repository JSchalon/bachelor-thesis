<template>
    <div >
      <SignCategoryContainer :optionText="'Type'" :category="'relationship-bows'" :parentY="y" :active="true" @updateSignData="changeType"/>
      <RadioOption 
        :options="addressingTypes" 
        :initState="getAddressInitState()"
        :optionText="'Definition'"
        :active="signData.signType == 'address'"
        @switchState="changeAdressing"
      />
      <OnOffOption :optionText="'Hold'" :initState="signData.holding" :active="true" @switchState="changeHolding"/>
      <OnOffOption :optionText="'Passing'" :initState="signData.passing" :active="true" @switchState="changePassing"/>
      <OnOffOption :optionText="'Grasping'" :initState="signData.grasping" :active="true" @switchState="changeGrasping"/>
      <DeleteOption :mIndex="1" @delete="emitDelete"/>
    </div>
</template>

<script>
/**
 * The context menu for the relationship bows 
 * @emits updateSignData updates the sign data given by the score
 * @emits delete deletes the sign
 * @displayName Relationship Bow Context
 */
export default {
  name: "RelationshipBowContext",
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
      addressingTypes: [
        {text: 'Right', img: false},
        {text: 'Left', img:  false},
        {text: 'Both', img:  false}
      ]
    };
  },
  computed: {
    
  },
  mounted () {
    
  },
  methods: {
    changeType (data) {
      this.newSignData({signType: data.signType})
    },
    changeAdressing (data) {
      if (data.text == "Right") {
        this.newSignData({addressing: "right"})
      } else if (data.text == "Left") {
        this.newSignData({addressing: "left"})
      } else {
        this.newSignData({addressing: "both"})
      }
    },
    changeHolding (data) {
      this.newSignData({holding: data})
    },
    changePassing(data) {
      this.newSignData ({passing: data});
    },
    changeGrasping(data) {
      this.newSignData ({grasping: data});
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
    },
    getAddressInitState () {
      if (this.signData.addressing == "right" || this.signData.addressing == undefined) {
        return "Right";
      } if (this.signData.addressing == "left") {
        return "Left";
      } else {
        return "Both";
      }
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
