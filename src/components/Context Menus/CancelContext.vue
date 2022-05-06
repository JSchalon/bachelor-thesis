<template>
    <div >
      <RadioOption 
        :options="types" 
        :initState="types.findIndex(obj => obj.text == signData.signType)"
        :optionText="'Type'"
        :active="true"
        @switchState="this.changeType"
      />
      <DeleteOption @delete="emitDelete"/>
    </div>
</template>

<script>
/**
 * The context menu for the cancel signs
 * @emits updateSignData updates the sign data given by the score
 * @emits delete deletes the sign
 * @displayName Cancel Context
 */
export default {
  name: "CancelContext",
  inject: [],
  props: {
    signData: Object,
    isActive: Boolean,
    signIndex: [Number, String]
  },
  emits: ["updateSignData", "delete"],
  data() {
    return {
      //the cancel sign types
      types: [
        {text: 'back-normal', img: "/cancel/cancel-back.svg"},
        {text: 'release-contact', img: "/cancel/cancel-release.svg"},
      ],
    };
  },
  methods: {
    /**
     * changes the type
     * @param index the index in the types array
     */
    changeType(index) {
      if (index == 1) {
        this.newSignData ({signType: "release-contact"});
      } else {
        this.newSignData ({signType: "back-normal"});
      }
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
