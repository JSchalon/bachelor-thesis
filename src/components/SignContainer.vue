<template>
    <g class="sign-container" 
      :class="[
        signData.baseType == 'RelationshipBow' ? 'bow' : 'normal', 
        signData.baseType == 'RoomDirectionSign' ? 'room-direction' : '',
        signData.baseType == 'PathSign' ? 'path' : '',
        signData.baseType == 'BodyPartSign' ? 'body-part' : '',
        signData.baseType == 'PropSign' ? 'body-part' : '',
        signData.baseType != 'PathSign' && signData.baseType != 'RoomDirectionSign' && !(signData.baseType == 'BodyPartSign' || signData.baseType == 'PropSign') ? 'bound-inner' : ''
      ]" 
      :x="x" :y="y" 
      :data-y="y"
      :data-x="x"
      :transform="'translate(' + x + ',' + y +')'" 
      ref="sign" 
      :signID="id"
    >
      <component :is="signData.baseType" :id="id" :isSelected="signData.isSelected" :height="height" :width="width" :signData="signData"/>
      <ResizeHandle 
        :pos="signData.baseType == 'RelationshipBow' ? 'left' : 'top'" 
        :isActive="signData.isSelected && canResize && signData.resizable" 
        :signHeight="height" 
        :width="signData.baseType == 'RelationshipBow' ? width : signWidth"
        :signID="id"/>
      <ResizeHandle 
        :pos="signData.baseType == 'RelationshipBow' ? 'right' : 'bottom'" 
        :isActive="signData.isSelected && canResize && signData.resizable"
        :signHeight="height"
        :width="signData.baseType == 'RelationshipBow' ? width : signWidth"
        :signID="id"/>
    </g>
</template>

<script>

/**
 * The sign container component. Loads a sign based on its signdata
 * @emits requestListeners at mount, so that the score can implement dragging, resizing, clicking and double clicking
 * @displayName Sign Container
 */
export default {
  name: "SignContainer",
  emits: ["requestListeners"],
  props: {
    id: Number,
    signData: Object,
    localData: Object,
  },
  inject: ["signWidth", "barHeight"],
  mounted () {
    //give it a random number to differentiate between signs
    let sign = this.$refs.sign;
    //request event listeners on the outer group
    this.$emit("requestListeners", sign);
  },
  computed: {
    /**
     * @returns the beats per bar
     */
    beats () {
      return this.$store.state["beatsPerBar"];
    },
    /**
     * @returns the height of the sign in svg coords
     */
    height () {
      let height = this.barHeight() / this.beats;
      if (this.localData != undefined) {
        height = this.localData.height;
      }
      return height;
    },
    /**
     * @returns the width of the sign in svg coords
     */
    width () {
      let width = this.signWidth;
      if (this.localData != undefined) {
        width = this.localData.width;
      }
      return width;
    },
    /**
     * @returns the x position of the sign in svg coords
     */
    x () {
      let x = 0;
      if (this.localData != undefined) {
        x = this.localData.x;
      }
      return x;
    },
    /**
     * @returns the y position of the sign in svg coords
     */
    y () {
      let y = 0;
      if (this.localData != undefined) {
        y = this.localData.y;
      }
      return y;
    },
    /**
     * @returns whether or not the sign can be resized
     */
    canResize () {
      let canResize = false;
      if (this.localData != undefined) {
        canResize = this.localData.canResize;
      }
      return canResize;
    },
  },
};
</script>

<style>
.dragging {
  touch-action: none;
  overscroll-behavior: none;
  user-select: none;

}

  .dragging .draggable {
    stroke:var(--selected);
    z-index: 100;
  }


.draggable {
  touch-action: none;
}

  .draggable.active {
    stroke: var(--selected);
  }
</style>
