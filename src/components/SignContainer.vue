<template>
    <g class="sign-container" 
      :class="[
        signData.baseType == 'RelationshipBow' ? 'bow' : 'normal', 
        signData.baseType == 'RoomDirectionSign' ? 'room-direction' : '',
        signData.baseType == 'PathSign' ? 'path' : '',
        signData.baseType == 'BodyPartSign' ? 'body-part' : '',
        signData.baseType != 'PathSign' && signData.baseType != 'RoomDirectionSign' && signData.baseType != 'BodyPartSign' ? 'bound-inner' : ''
      ]" 
      :x="x" :y="y" 
      :data-y="y"
      :data-x="x"
      :transform="'translate(' + x + ',' + y +')'" 
      ref="sign" 
      :signID="id"
    >
      <component :is="signData.baseType" :id="id" :isSelected="isSelected" :height="height" :width="width" :signData="signData"/>
      <ResizeHandle 
        :pos="signData.baseType == 'RelationshipBow' ? 'left' : 'top'" 
        :isActive="isSelected && canResize && signData.resizable" 
        :signHeight="height" 
        :width="signData.baseType == 'RelationshipBow' ? width : signWidth"
        :signID="id"/>
      <ResizeHandle 
        :pos="signData.baseType == 'RelationshipBow' ? 'right' : 'bottom'" 
        :isActive="isSelected && canResize && signData.resizable"
        :signHeight="height"
        :width="signData.baseType == 'RelationshipBow' ? width : signWidth"
        :signID="id"/>
    </g>
</template>

<script>

/**
 * The sign container component.
 * Holds a sign
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
  inject: ["borderWidth", "signWidth", "barHeight"],
  data() {
    return {
    };
  },
  mounted () {
    //give it a random number to differentiate between signs
    this.name= Math.round(Math.random() * 100);
    let sign = this.$refs.sign;
    //request event listeners on the outer group
    this.$emit("requestListeners", sign);
  },
  methods: {
    
  },
  computed: {
    beats () {
      return this.$store.state["beatsPerBar"];
    },
    isSelected () {
      let isSelected = false;
      if (this.localData != undefined) {
        isSelected = this.localData.isSelected;
      }
      return isSelected;
    },
    height () {
      let height = this.barHeight / this.beats;
      if (this.localData != undefined) {
        height = this.localData.height;
      }
      return height;
    },
    width () {
      let width = this.signWidth;
      if (this.localData != undefined) {
        width = this.localData.width;
      }
      return width;
    },
    x () {
      let x = 0;
      if (this.localData != undefined) {
        x = this.localData.x;
      }
      return x;
    },
    y () {
      let y = 0;
      if (this.localData != undefined) {
        y = this.localData.y;
      }
      return y;
    },
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
    opacity: 0.5;
    stroke:#5e9fc7;
    z-index: 100;
  }


.draggable {
  touch-action: none;
}

  .draggable.active {
    stroke:#5e9fc7;
  }
</style>
