<template>
  <div class="menu-option-container" @click="importScore()">
    <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
    <p>Dropbox</p>
  </div>
</template>

<script>
/**
 * The dropbox import button. Opens dropbox and imports the score after selection.
 * @emits uploadScore either emits the score as a xml doc or an error string
 * @displayName Dropbox Import 
 */
export default {
  name: 'DropboxImport',
  emits: ["uploadScore"],
  mounted () {
      //imports the dropbox api script and loads it into the html doc
      let dropBox = document.createElement("script");
      dropBox.setAttribute(
        "src",
        "https://www.dropbox.com/static/api/2/dropins.js"
      );
      dropBox.setAttribute("id", "dropboxjs");
      dropBox.setAttribute("data-app-key", "6w1sobho503o9jj");
      document.head.appendChild(dropBox);
    },
  methods: {
    /**
     * Opens the dropbox import window and forwards it to the upload method on sucess
     */
    importScore() {
      let options = {
        success: function (files) {
          let attachments = [];
          for (let i = 0; i < files.length; i++) {
            let attachment = {};
            attachment._id = files[i].id;
            attachment.title = files[i].name;
            attachment.size = files[i].bytes;
            attachment.iconURL = files[i].icon;
            attachment.link = files[i].link;
            attachment.extension = `. ${files[i].name.split(".")[1]}`;
            attachments.push(attachment);
          }
          this.tempAttachments = attachments;
          fetch(this.tempAttachments[0].link)
            .then(res => res.blob())
            .then(blob => {
              this.upload(blob);
          });
        }.bind(this),
        cancel: function () {
          // on cancel -> display import error
          this.$store.dispatch("setCloudAlert", "import-failure");
          setTimeout(function () {
            this.$store.dispatch("setCloudAlert", "");
          }.bind(this), 5000);
        }.bind(this),

        linkType: "direct",

        multiselect: false,

        extensions: [
        ".xml",
        ],

        folderselect: false,

        sizeLimit: 102400000
      };
      // disabling eslint temporarily because it identifies "Dropbox" as undefined, 
      // despite the fact that it is defined in the api script
      /* eslint-disable */
      Dropbox.choose(options);
      /* eslint-enable */
    },
    /**
     * Forwards the score to the import button container
     * @param score the raw score blob file
     */
    upload (score) {
      if (score.type.includes("xml")) {
        const reader = new FileReader();
        reader.onload = function () {
          const xmlRes = reader.result;
          const parser = new DOMParser();
          const docRes = parser.parseFromString(xmlRes, "text/xml");
          //currently there is no schema validation for the xml code since js does not easily support it, only basic checkinf for a score element
          if (docRes.documentElement.nodeName == "laban:score" && !docRes.getElementsByTagName('parsererror').length > 0) {
            this.$emit("uploadScore", xmlRes);
          } else {
            this.$emit("uploadScore", "error");
          }
        }.bind(this);
        reader.readAsText(score);
      }
    }
  }
}
</script>