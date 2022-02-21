<template>
    <div class="context-menu-item">
      <div class="center-vertically" id="slider-text">
        <p class="context-item-text">{{optionText}}</p>
      </div>
      <div class="center-vertically context-item-interact-box">
          <div class="slider" :style="'width: ' + sliderWidth + 'px;'"/>
      </div>
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
    mIndex: Number,
    optionText: String,
    initState: Number,
    stops: Number,
  },
  emits: ["delete"],
  data() {
    return {
      sliderWidth: 0,
    };
  },
  mounted () {
    this.sliderWidth = this.getSliderWidth();
    interact('.slider').draggable({ 
      origin: 'self',
      inertia: false,
      modifiers: [
        interact.modifiers.snap({
          targets: [
            interact.snappers.grid({ x: (this.sliderWidth / this.stops), y:30})
          ],
          range: this.sliderWidth,
          relativePoints: [ { x: 0, y: 0 } ]
        }),
      ],
      onmove: this.dragMove,
      onend: this.dragEnd,
    })
  },
  methods: {
    deletesign() {
      this.$emit("switchState", false);
    }, 
    getSliderWidth() {
      return this.contextMenuWidth - this.contextItemMargin * 2 - document.getElementById("slider-text").offsetWidth - 16;
    },
    dragMove(event) {
      const  x = (parseFloat(event.target.getAttribute("x")) || 0) + event.dx;
      let value = x / this.sliderWidth;
      if (value > 1) {
        value = 1;
      }
      event.target.style.paddingLeft = (value * 100) + '%';
      event.target.setAttribute('x', x);
    },
    dragEnd(event) {
      parseFloat(event.target.getAttribute("x"));
      //emit current position (0 to stopValue)
    },
    
  },
  computed: {
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* the slider bar */
.slider {
  position: relative;
  height: 1em;
  margin: 1.5em auto;
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
