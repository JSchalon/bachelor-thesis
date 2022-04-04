<template>
    <div class="context-menu-item" :class="{unusable: !active}" ref="container">
      <div class="center-vertically">
        <p class="context-item-text">{{optionText}}</p>
      </div>
      <div class="center-vertically context-item-interact-box">
        <div class="outer-on-off" :class="initState ? 'on' : 'off'" @click="changeState">
          <div class="inner-on-off" :class="initState ? 'on' : 'off'"/>
        </div>
      </div>
      <div v-if="!active" class="blocker" :style="'height: ' + itemHeight + 'px'"/>
    </div>
</template>

<script>
/**
 * The generic context menu on/off option
 * @emits switchState the new state of the option
 * @displayName OnOffOption
 */
export default {
  name: "OnOffOption",
  inject: ["contextItemHeight"],
  props: {
    optionText: String,
    initState: Boolean,
    active: Boolean,
  },
  emits: ["switchState"],
  data() {
    return {
      itemHeight: 0,
    };
  },
  computed: {
  },
  mounted () {
    
  },
  methods: {
    /**
     * Method for changing the state of the property
     */
    changeState() {
      this.$emit("switchState", !this.initState);
      this.itemHeight = this.$refs.container.getBoundingClientRect().height;
    }
  },
  
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .anim {
    transition: x 0.2s ease;
  }

  .inner-on-off {
    width: calc(var(--contextItemImageSize));
    height: calc(var(--contextItemImageSize));
    background: var(--bg-lightest);
    border-radius: 2000px;
    transition: transform 0.2s ease;
    transform: translate(-2px,-2px);
    box-sizing: border-box;
    border: 2px solid var(--text-options);
  }
  .outer-on-off {
    width: calc(var(--contextItemImageSize) * 2);
    height: var(--contextItemImageSize);
    border-radius: 2000px;
    background: var(--text-options);
    box-sizing: border-box;
    border: 2px solid var(--text-options);
    transition: background-color 0.2s ease;
  }

  .outer-on-off.on {
    background: var(--add);
  }

  .inner-on-off.on {
    transform: translate(calc(var(--contextItemImageSize) * 2 - (var(--contextItemImageSize) + 2px)), -2px);
  }
</style>