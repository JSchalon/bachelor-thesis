<template>
    <g x="0" y="0" :transform="'translate(0, ' + contextItemHeight * mIndex +')'">
      <text
        :x="margin" 
        :y="contextItemHeight / 2 - textHeight / 2" 
        ref="optionText"
        fill="black"
        dominant-baseline="text-before-edge"
      >
        Delete
      </text>
      <g :transform="'translate(' + (contextMenuWidth - contextItemHeight + margin) + ', ' + margin +')'" v-on:click="deletesign">
        <g :transform="'rotate(45,' + symbolHeight / 2 + ',' + symbolHeight / 2 + ')'">
          <rect x="0" y="0" :width="symbolHeight" :height="symbolHeight" fill="white"/>
          <rect :x="symbolHeight / 2 - symbolWidth / 2" y="0" :width="symbolWidth" :height="symbolHeight" fill="black"/>
          <rect x="0" :y="symbolHeight / 2 - symbolWidth / 2" :width="symbolHeight" :height="symbolWidth" fill="black"/>
        </g>
      </g>
    </g>
</template>

<script>
/**
 * A generic delete option for the context menus
 * @emits delete the deletion request, which the context menu forwards to the score to delete the sign
 * @displayName Delete Option
 */
export default {
  name: "DeleteOption",
  inject: ["contextMenuWidth", "contextItemHeight"],
  props: {
    mIndex: Number,
  },
  emits: ["delete"],
  data() {
    return {
      margin: 8,
      textHeight: 0,
    };
  },
  mounted () {
     this.textHeight = this.$refs.optionText.getBBox().height;
  },
  methods: {
    deletesign() {
      this.$emit("delete");
    }
  },
  computed: {
    symbolHeight() {
      return this.contextItemHeight - (this.margin) * 2;
    },
    symbolWidth () {
      return this.contextItemHeight / 5;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
