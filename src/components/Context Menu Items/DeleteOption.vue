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
 * A delete option for the context menus
 * @emits delete the deletion request, which the context menu forwards to the score to delete the sign
 * @displayName Delete Option
 */
export default {
  name: "DeleteOption",
  inject: ["contextItemHeight"],
  props: {
  },
  emits: ["delete"],
  methods: {
    /**
     * requests the deletion of the sign
     */
    deletesign() {
      this.$emit("delete");
    }
  },
  computed: {
    /**
     * calculates the height of the x icon
     * @returns the icon height
     */
    symbolHeight() {
      return this.contextItemHeight - (this.margin) * 2;
    },
    /**
     * calculates the width of the x icon
     * @returns the icon width
     */
    symbolWidth () {
      return this.contextItemHeight / 5;
    }
  }
};
</script>
