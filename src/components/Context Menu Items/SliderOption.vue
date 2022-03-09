<template>
    <div class="context-menu-item" ref="container" :class="{unusable: !active}">
      <div class="center-vertically">
        <p class="context-item-text">{{optionText}}</p>
      </div>
      <div class="context-item-interact-box full">
        <div class="center-vertically small">
          <div class="slider" :id="id" :style="'width: ' + sliderWidth + 'px;'"/>
        </div>
      </div>
      <div v-if="!active" class="blocker" :style="'height: ' + itemHeight + 'px'"/>
    </div>
</template>

<script>
import interact from "interactjs";

/**
 * A generic slider option for the context menus
 * @emits switchState the update when the slider is changed
 * @displayName Slider Option
 */
export default {
  name: "SliderOption",
  inject: ["contextItemHeight", "contextItemMargin", "contextMenuWidth"],
  props: {
    optionText: String,
    stops: Number,
    initState: [Number, Boolean],
    id: String,
    active: Boolean,
  },
  emits: ["switchState"],
  data() {
    return {
      sliderWidth: 0,
      itemHeight: 0,
    };
  },
  mounted () {
    this.sliderWidth = this.getSliderWidth();
    this.itemHeight = this.$refs.container.getBoundingClientRect().height;
    interact('#' + this.id).draggable({ 
      origin: 'self',
      inertia: false,
      modifiers: [
        interact.modifiers.snap({
          targets: [
            interact.snappers.grid({ x: (this.sliderWidth / this.stops), y:30})
          ],
        }),
      ],
      onmove: this.dragMove,
    })
    
    
  },
  methods: {
    getSliderWidth() {
      return this.contextMenuWidth - this.contextItemMargin * 2 - 16;
    },
    dragMove(event) {
      let value = event.pageX / this.sliderWidth;
      if (value > 1) {
        value = 1;
      }
      if (value < 0) {
        value = 0;
      }
      event.target.style.paddingLeft = (value * 100) + '%';
      event.target.setAttribute('x', value);
      this.$emit("switchState",{index: this.id, data: (Math.round(value * this.stops))});
    }
    
  },
  beforeUnmount () {
    interact('#' + this.id).unset()
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* the slider bar */
.slider {
  position: relative;
  height: 1em;
  margin-left: calc(var(--contextItemMargin) + 0.5em);
  margin-right: calc(var(--contextItemMargin) -1em);
  background-color: #29e;
  border-radius: 0.5em;
  box-sizing: border-box;

  font-size: 1em;

  -ms-touch-action: none;
     touch-action: none;
}

/* the slider handle */
.slider:before {
  content: "";
  display: block;
  position: relative;
  top: -0.5em;

  width: 2em;
  height: 2em;
  margin-left: -1em;
  border: solid 0.25em #fff;
  border-radius: 1em;
  background-color: inherit;

  box-sizing: border-box;
}
</style>
