<template>
    <div class="context-menu-item" ref="container" @mouseenter="getTop()" @mouseleave="getTop()" :class="{unusable: !active}">
      <div class="hover-target">
        <div class="center-vertically">
          <p class="context-item-text">{{optionText}}</p>
        </div>
        <div class="center-vertically context-item-interact-box">
            <img class="context-item-interact-img smaller" src="@/assets/images/context-images/triangle-left.svg" alt="triangle"/>
        </div>
      </div>
      <div class="category" :class="{left: side == 'left'}" :style="'top: ' + top + 'px; left: ' + xOffset + 'px'">
        <LibraryItem :active="true" :category="category" :catIndex="0" :selected="selected" :offset="itemOffset"  @selectSign="selectSign"/>
      </div>
      <div v-if="!active" class="blocker" :style="'height: ' + itemHeight + 'px'"/>
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
    category: String,
    parentY: Number,
    active: Boolean,
  },
  data() {
    return {
      side: "right",
      itemOffset: 0,
      selected: -1,
      top: 0,
      xOffset: 0,
      itemHeight: 0,
    };
  },
  computed: {
  },
  mounted () {
    this.itemOffset = this.getWidth();
    this.getTop();
    this.xOffset = this.getXPos();
    this.itemHeight = this.$refs.container.getBoundingClientRect().height;
  },
  methods: {
    getWidth() {
      return this.$refs.container.offsetWidth / 6 - 20;
    },
    getTop() {
      
      let elem = this.$refs.container.querySelector(".category");
      this.top =  Math.round(this.$refs.container.getBoundingClientRect().y - this.parentY) - 4;
      let altTop = Math.round(elem.getBoundingClientRect().y + elem.getBoundingClientRect().height) - 4;
      if (altTop >= window.innerHeight) {
        this.top = this.top - (altTop - window.innerHeight);
      }
    },
    selectSign (data) {
      this.selected = data.index;
      let signData = JSON.parse(JSON.stringify(data.signData))
      this.$emit("updateSignData", signData)
    },
    getXPos() {
      if (this.$refs.container.getBoundingClientRect().right + this.contextMenuWidth >= window.innerWidth) {
        return -this.contextMenuWidth;
      } else {
        return this.contextMenuWidth;
      }
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .hover-target:hover + .category {
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

  .category:hover {
    display: block;
  }  
</style>