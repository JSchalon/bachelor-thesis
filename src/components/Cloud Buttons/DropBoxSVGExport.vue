<template>
  <div class="menu-option-container" @click="exportSVG">
    <img src="@/assets/images/common/upload-cloud.svg" class="option-img">
    <p>To Dropbox</p>
  </div>
</template>

<script>
/**
 * The dropbox svg export button. Opens dropbox and allows saving the score.
 * @emits exportSuccess when the export was successfull
 * @emits exportFailure when the export has failed (either aborted or an error occured)
 * @displayName Dropbox SVG Export
 */
export default {
  name: 'DropboxSVGExport',
  emits: ["exportSuccess", "exportFailure"],
  props: {
    svg: String,
  },
  computed: {
    /**
     * loads the score svg
     * @returns the canvas element
     */
    score () {
      return document.getElementById("canvas");
    }
  },
  methods: {
    /**
     * takes the svg doc and truns it into a string
     * @returns the svg doc as a string
     */
    makeSVGFile () {
      const serializer = new XMLSerializer();
      const svg = serializer.serializeToString(this.score);
      return svg;
    },
    /**
     * opens and executes the dropbox export.
     */
    exportSVG () {
      const svg = this.makeSVGFile();
      let filename = this.$store.state["title"];
      if (!filename.includes(".svg")) {
        filename = filename + ".svg";
      }
      let options = {
        files: [{url: "data:text/html,"+encodeURIComponent(svg), filename: filename}],
        success: function () {
          this.$emit("exportSuccess");
        }.bind(this),
        cancel: function () {
          this.$emit("exportFailure");
        }.bind(this)
      }
      // disabling eslint temporarily because it identifies "Dropbox" as undefined, 
      // despite the fact that it is defined in the api script
      /* eslint-disable */
      Dropbox.save(options);
      /* eslint-enable */
    },
  }
}
</script>