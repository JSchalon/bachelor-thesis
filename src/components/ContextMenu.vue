<template>
    <div class="context-menu" id="context-menu" :style="'top: ' + y + 'px; left: ' + x + 'px'" :class="isActive ? 'active' : 'inactive'" >
      <component :is="signData.baseType + 'Context'" :signData="signData" :signIndex="signIndex" :isActive="isActive" :y="y" @updateSignData="updateSignData" @delete="emitDelete"/>
    </div>
</template>

<script>
/**
 * The context menu container
 * @emits updateSignData updates the sign data given by the score
 * @emits delete deletes the sign
 * @displayName Context Menu
 */
export default {
  name: "ContextMenu",
  inject: [],
  props: {
    signData: Object,
    isActive: Boolean,
    x: Number,
    y: Number,
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
    updateSignData (data) {
      this.$emit("updateSignData", data);
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
    .center-vertically.small {
      height: auto;
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
      width: calc(var(--contextItemImageSize) / 1.5);
      height: calc(var(--contextItemImageSize) / 1.5);
    }

  .unusable {
    opacity: 0.3;
  }

  .blocker {
    width: var(--contextMenuWidth);
    position: absolute;
    transform: translateY(-100%);
  }
</style>
