<template>
  <div class="library-category-container">
    <div class="library-category-name" @click="expand">
      <div class="center-vertically">
        <p class="context-item-text">{{category}}</p>
      </div>
      <div class="center-vertically context-item-interact-box">
          <img class="context-item-interact-img smaller" :class="{turned: active}" src="@/assets/images/sign-categories/triangle-right.svg" alt="triangle" v-on:click="deletesign" />
      </div>
    </div>
    <div v-show="active" class="library-item-container">
      <div class="library-item">

      </div>
      <div class="library-item">

      </div>
      <div class="library-item">

      </div>
      <div class="library-item">

      </div>
      <div class="library-item">

      </div>
    </div>
  </div>
</template>

<script>
/**
 * The LibraryItem component
 * @displayName Library Item
 */
export default {
  name: 'LibraryItem',
  inject: [],
  emits: ["expand"],
  props: {
    active: Boolean,
    category: String,
    index: Number,
  },
  data() {
    return {
      signs: [

      ],
    };
  },
  computed: {
    
  },
  mounted () {
    //load signs and add click functionality
  },
  methods: {
    loadSignImg(name) {
      console.log(name);
    },
    expand () {
      this.$emit("expand", this.index);
    }
  },
}
</script>


<style scoped>
  .turned {
    transform: rotate(90deg);
  }
</style>
