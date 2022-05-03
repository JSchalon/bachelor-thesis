<template>
  <li class="option-item">
    <component :is="btn" @exportFailure="exportFail" @exportSuccess="exportSuccess" />
  </li>              
</template>

<script>
/**
 * The cloud export button container. loads a given export button.
 * @displayName Cloud Export Button
 */
export default {
  name: 'CloudExportButton',
  props: {
    btn: String,
  },
  methods: {
    /**
     * sends an export failure alert to vuex to be displayed 
     */
    exportFail () {
      this.$store.dispatch("setCloudAlert", "export-failure");
      setTimeout(function () {
        this.$store.dispatch("setCloudAlert", "");
      }.bind(this), 5000);
    },
    /**
     * sends an export failure alert to vuex to be displayed 
     */
    exportSuccess () {
      this.$store.dispatch("setCloudAlert", "export-success");
      setTimeout(function () {
        this.$store.dispatch("setCloudAlert", "");
      }.bind(this), 5000);
    }
  }
}
</script>