<template>
    <div class="context-menu-item" ref="container">
      <div class="center-vertically">
        <p class="context-item-text">{{optionText}}</p>
      </div>
      <div class="center-vertically context-item-interact-box">
          <img class="context-item-interact-img smaller" src="@/assets/images/context-images/triangle-left.svg" alt="triangle"/>
      </div>
      <div class="category" :class="{left: side == 'left'}" :style="'top: ' + -2 + 'px; left: ' + (contextMenuWidth) + 'px'">
        <LibraryItem :active="true" :category="category" :catIndex="0" :selected="selected" :offset="itemOffset"  @selectSign="selectSign"/>
      </div>
    </div>
    
</template>

<script>
/**
 * A container for a sign category for the context menu
 * @displayName SignCategoryContainer
 */
export default {
  name: "SignCategoryContainer",
  inject: ["contextItemHeight", "contextMenuWidth", "contextItemMargin"],
  props: {
    optionText: String,
    category: String
  },
  data() {
    return {
      side: "right",
      itemOffset: 0,
      selected: -1,
      top: 0,
    };
  },
  computed: {
  },
  mounted () {
    this.itemOffset = this.getWidth();
    this.top = this.getTop();
  },
  methods: {
    getWidth() {
      return this.$refs.container.offsetWidth / 6 - 20;
    },
    getTop() {
      return Math.round(this.$refs.container.getBoundingClientRect().y) - 2;
    },
    selectSign (data) {
      this.selected = data.index;
      let signData = JSON.parse(JSON.stringify(data.signData))
      this.$emit("updateSignData", signData)
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .context-menu-item:hover .category {
    display: block;
  }
  .category {
    position: absolute;
    display: none;
    border: 2px solid black;
    box-sizing: border-box;
    width: var(--contextMenuWidth);
    background: white;
  }

  
</style>