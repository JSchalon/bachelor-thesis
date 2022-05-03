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
        <LibraryItem :active="true" :category="category" :catIndex="0" :selected="selected" :offset="itemOffset" :inLibrary="false" @selectSign="selectSign"/>
      </div>
      <div v-if="!active" class="blocker" :style="'height: ' + itemHeight + 'px'"/>
    </div>
    
</template>

<script>
/**
 * A container for a sign category for the context menu. When hovered, displays the signs.
 * @emits updateSignData when a new sign is selected
 * @displayName SignCategoryContainer
 */
export default {
  name: "SignCategoryContainer",
  inject: ["contextMenuWidth"],
  emits: ["updateSignData"],
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
  mounted () {
    //set the offset within the actual sign container based on the width
    this.itemOffset = this.getOffset();
    //calculate the y position of the actual sign container
    this.getTop();
    //calculate the x position of the sign container
    this.xOffset = this.getXPos();
    // get the item height for the blocker 
    this.itemHeight = this.$refs.container.getBoundingClientRect().height;
  },
  methods: {
    /**
     * calculates the offset within the sign container
     * @returns the offset
     */
    getOffset() {
      return this.$refs.container.offsetWidth / 6 - 20;
    },
    /**
     * calculates the y position of the sign container relative to the item. 
     */
    getTop() {
      let elem = this.$refs.container.querySelector(".category");
      this.top =  Math.round(this.$refs.container.getBoundingClientRect().y - this.parentY);
      let altTop = Math.round(elem.getBoundingClientRect().y + elem.getBoundingClientRect().height);
      if (altTop >= window.innerHeight) { // y + height out of bounds -> move it up
        this.top = this.top - (altTop - window.innerHeight);
      }
    },
    /**
     * selects a sign
     * @param data the data from the sign container
     */
    selectSign (data) {
      this.selected = data.index;
      let signData = JSON.parse(JSON.stringify(data.signData))
      this.$emit("updateSignData", signData)
    },
    /**
     * calculates the x position of the sign container
     * @returns the position
     */
    getXPos() {
      if (this.$refs.container.getBoundingClientRect().right + this.contextMenuWidth >= window.innerWidth) { // x + width out of bounds -> display it on the right instead
        return -this.contextMenuWidth;
      } else {
        return this.contextMenuWidth;
      }
    }
  },
};
</script>

<style scoped>
  .hover-target:hover + .category {
    display: block;
  }
  
  .category {
    position: absolute;
    display: none;
    border: none;
    box-shadow: 0 0px 5px 2px rgb(0 0 0 / 15%);
    box-sizing: border-box;
    width: var(--contextMenuWidth);
    background: white;
  }

  .category:hover {
    display: block;
  }  
</style>