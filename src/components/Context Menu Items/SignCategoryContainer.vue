<template>
    <div class="context-menu-item" ref="container">
      <div class="center-vertically">
        <p class="context-item-text">{{optionText}}</p>
      </div>
      <div class="center-vertically context-item-interact-box">
          <img class="context-item-interact-img smaller" src="@/assets/images/context-images/triangle-left.svg" alt="triangle" v-on:click="deletesign" />
      </div>
      <div class="category" :class="{left: side == 'left'}" :style="'top: ' + (mIndex * contextItemHeight) + 'px; left: ' + (contextMenuWidth) + 'px'">
      </div>
    </div>
    
</template>

<script>
//TODO: implements
/**
 * A container for a sign category for the context menu
 * @displayName SignCategoryContainer
 */
export default {
  name: "SignCategoryContainer",
  inject: ["contextItemHeight", "contextMenuWidth", "contextItemMargin"],
  props: {
    mIndex: Number,
    optionText: String,
  },
  data() {
    return {
      side: "right",
    };
  },
  computed: {
  },
  mounted () {
    
  },
  methods: {
   
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
    height: var(--contextMenuWidth);
    background: white;
  }

  
</style>