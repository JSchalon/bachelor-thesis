<template>
  <li class="option-item">
    <component :is="btn" @uploadScore="uploadScore"/>
  </li>
</template>

<script>
/**
 * The cloud import button container. Loads a given import button. when the subcompontent imports a score, this component loads it into vuex
 * @emits uploadScore when the loaded button imports a score
 * @displayName Cloud Import Button
 */
export default {
  name: 'CloudImportButton',
  emits: ["uploadScore"],
  props: {
    btn: String,
  },
  methods: {
    /**
     * Takes the score supplied by the loaded import button and forwards it.
     * @param data the data to forward
     */
    uploadScore (data) {
      this.$emit("uploadScore", data);
    }
  }
}
</script>