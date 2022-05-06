<template>
  <div class="menu-option-container" @click="exportXML()">
    <img src="@/assets/images/common/upload-cloud.svg" class="option-img">
    <p>To Dropbox</p>
  </div>
</template>

<script>
/**
 * The dropbox xml export button. Opens dropbox and allows saving the score.
 * @emits exportSuccess when the export was successfull
 * @emits exportFailure when the export has failed (either aborted or an error occured)
 * @displayName Dropbox XML Export
 */
export default {
  name: 'DropboxXMLExport',
  emits: ["exportSuccess", "exportFailure"],
  props: {
    btn: String,
  },
  computed: {
    /**
     * gets the xml doc
     * @returns the xml doc
     */
    xmlDoc () {
      return this.$store.state["signsXML"];
    },
  },
  methods: {
    /**
     * serializes the xml doc
     * @returns the xml doc as a string
     */
    makeXMLFile () {
      const serializer = new XMLSerializer();
      const xml = serializer.serializeToString(this.xmlDoc);
      return xml;
    },
    /**
     * Handles the exporting of the xml doc to dropbox
     */
    exportXML () {
      const xml = this.makeXMLFile();
      
      let filename = this.$store.state["title"];
      if (!filename.includes(".xml")) {
        filename = filename + ".xml";
      }
      //const bb = new Blob([xml], {type: 'text/xml'});
      let options = {
        files: [{url: "data:text/html,"+encodeURIComponent(xml), filename: filename}],
        success: function () {
          this.$emit("exportSuccess");
        }.bind(this),
        cancel: function () {
          this.$emit("exportFailure");
        }.bind(this)
      }
      // disabling eslint temporarily because it identifies "Dropbox" as undefined, 
      // despite the fact that it is defined in the script defined in the mounted-hook
      /* eslint-disable */
      Dropbox.save(options);
      /* eslint-enable */
    },
  }
}
</script>