<template>
    <div class="context-menu" id="context-menu" :style="'top: ' + y + 'px; left: ' + x + 'px'" :class="isActive ? 'active' : 'inactive'" >
      <component :is="signData.baseType + 'Context'" :signData="signData" :signIndex="signIndex" :isActive="isActive" :y="y" @updateSignData="updateSignData" @delete="emitDelete"/>
    </div>
</template>

<script>
/**
 * The context menu container. loads a sign specific context menu
 * @emits updateSignData updates the sign data given by the score
 * @emits delete deletes the sign
 * @displayName Context Menu
 */
export default {
  name: "ContextMenu",
  props: {
    signData: Object,
    isActive: Boolean,
    x: Number,
    y: Number,
    signIndex: [Number, String]
  },
  emits: ["updateSignData", "delete"],
  methods: {
    /**
     * requests updating the selected signs data
     * @param data the new data
     */
    updateSignData (data) {
      this.$emit("updateSignData", data);
    },
    /**
     * requests the deletion of the sign
     */
    emitDelete() {
      this.$emit("delete", parseInt(this.signIndex))
    }
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
    border: 2px solid var(--selected);
  }

  .context-menu {
    width: auto;
    position: absolute;
    border: none;
    border-radius: 10px;
    box-sizing: border-box;
    box-shadow: 0 0px 5px 2px rgb(0 0 0 / 15%);
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
    .center-vertically.small {
      height: auto;
      float: right;
    }

    .context-item-interact-box {
      float: right;
      margin-right: var(--contextItemMargin);
    }
    .context-item-interact-box.full {
      float:initial;
      display: flex;
      justify-content: right;
      margin-right: var(--contextItemMargin);
    }

    .context-item-interact-img {
      width: var(--contextItemImageSize);
      height: var(--contextItemImageSize);
      transition: transform 0.3s ease;
      cursor: pointer;
    }

    .context-item-interact-img.smaller {
      width: calc(var(--contextItemImageSize) / 1.65);
      height: calc(var(--contextItemImageSize) / 1.65);
    }

  .unusable {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .blocker {
    width: var(--contextMenuWidth);
    position: absolute;
    transform: translateY(-100%);
  }
</style>
