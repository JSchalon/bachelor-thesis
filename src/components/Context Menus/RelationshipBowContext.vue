<template>
    <div >
      <SignCategoryContainer :optionText="'Type'" :category="'relationship-bows'" :parentY="y" :active="true" @updateSignData="changeType"/>
      <RadioOption 
        :options="addressingTypes" 
        :initState="getAddressInitState()"
        :optionText="'Addressing'"
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
      // the different possible addressing types
      addressingTypes: [
        {text: 'Right', img: "/bows/addressing-right.svg"},
        {text: 'Left', img:  "/bows/addressing-left.svg"},
        {text: 'Both', img:  "/bows/addressing-both.svg"}
      ]
    };
  },
  computed: {
    
  },
  mounted () {
    
  },
  methods: {
    /**
     * changes the bow type
     * @param data the data from the sign category container
     */
    changeType (data) {
      this.newSignData({signType: data.signType})
    },
    /**
     * changes the addressing type
     * @param index the index in the addressingTypes array
     */
    changeAdressing (index) {
      if (this.addressingTypes[index].text == "Right") {
        this.newSignData({addressing: "right"})
      } else if (this.addressingTypes[index].text == "Left") {
        this.newSignData({addressing: "left"})
      } else {
        this.newSignData({addressing: "both"})
      }
    },
    /**
     * gets the initial type of the addressing bow
     */
    getAddressInitState () {
      if (this.signData.addressing == "right" || this.signData.addressing == undefined) {
        return 0;
      } if (this.signData.addressing == "left") {
        return 1;
      } else {
        return 2;
      }
    },
    /**
     * changes the holding state
     * @param data the holding boolean
     */
    changeHolding (data) {
      this.newSignData({holding: data})
    },
    /**
     * changes the passing state
     * @param data the passing boolean
     */
    changePassing(data) {
      this.newSignData ({passing: data});
    },
    /**
     * changes the grasping state
     * @param data the grasping boolean
     */
    changeGrasping(data) {
      this.newSignData ({grasping: data});
    },
    /**
     * The function that sends the updated sign data back to the score
     * @param data the updated sign data 
     */
    newSignData (data) {
      this.$emit("updateSignData", {index: parseInt(this.signIndex), data: data});
    },
    /**
     * emits a deletion request
     */
    emitDelete() {
      this.$emit("delete", parseInt(this.signIndex))
    },
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
