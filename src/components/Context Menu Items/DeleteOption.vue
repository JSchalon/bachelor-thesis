<template>
    <div class="context-menu-item">
      <div class="center-vertically">
        <p class="context-item-text">Delete</p>
      </div>
      <div class="center-vertically context-item-interact-box">
          <img class="context-item-interact-img" src="@/assets/images/context-images/x.svg" alt="delete" v-on:click="deletesign" />
      </div>
    </div>
</template>

<script>
/**
 * A generic delete option for the context menus
 * @emits delete the deletion request, which the context menu forwards to the score to delete the sign
 * @displayName Delete Option
 */
export default {
  name: "DeleteOption",
  inject: ["contextItemHeight", "contextItemMargin"],
  props: {
    mIndex: Number,
  },
  emits: ["delete"],
  data() {
    return {

    };
  },
  mounted () {

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
