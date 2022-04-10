<template>
    <div class="context-menu-item" ref="container" :class="{unusable: !active}">
      <div class="center-vertically">
        <p class="context-item-text">{{optionText}}</p>
      </div>
      <div class="context-item-interact-box center-vertically">
        <div class="center-vertically small" :key="index" v-for="(each, index) of options" v-on:click="changeSelect(index)">
          <img v-if="each.img" class="context-item-interact-img radio-option" :class="{active : index == selectedID}" :src="require(`@/assets/images/context-images` + each.img)" :alt="each.color"/>
          <div v-else class="context-item-interact-img radio-option flex" :class="{active : index == selectedID}">
          </div>
        </div>
      </div>
      <div v-if="!active" class="blocker" :style="'height: ' + itemHeight + 'px'"/>
    </div>
</template>

<script>
/**
 * A custom context menu radio option for the direction signs
 * @emits switchState changes the current selected option
 * @displayName RadioOption
 */
export default {
  name: "RadioOption",
  inject: ["contextItemHeight"],
  props: {
    options: Array,
    optionText: String,
    initState: Number,
    active: Boolean,
  },
  emits: ["switchState"],
  data() {
    return {
      selectedID: 1,
      itemHeight: 0,
    };
  },
  mounted () {
    this.itemHeight = this.$refs.container.getBoundingClientRect().height;
    this.$nextTick(() => {
      this.selectedID = this.initState;
      if (this.selectedID == -1) {
        this.selectedID = 0;
      }
    });
    
  },
  methods: {
    /**
     * Method for changing the selected option of the property
     */
    changeSelect(index) {
      this.selectedID = index;
      this.$emit("switchState", index);
    },
  },
  computed: {
    /**
     * calculates the text of the current selected option
     */
    selectedText() {
      return this.options[this.selectedID];
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  text{
    color: var(--bg-dark);
    margin-right: 10px;
  }
  .radio-option {
    border: 2px solid var(--bg-dark);
    background-color: white;
    border-radius: 2000px;
    margin-left: var(--contextItemMargin);
  }

  .radio-option.active {
    border-radius: 2000px;
  }
  
</style>