<template>
  <ul class="option-nested menu-option" tabIndex="0" role="button">
    <li class="option-dropdown-top">
      <p>File</p>
    </li>
    <div class="option-box">
      <li class="option-item" @click="requestNewScore()">
        <div class="menu-option-container">
          <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
          <p>New Score</p>
        </div>
      </li>
      <li class="option-item" @click="openFileUpload()">
        <div class="menu-option-container">
          <input id="xml-file" type="file" @change="uploadScoreFromString('xml-file')" class="input-hidden">
          <img src="@/assets/images/common/upload-local.svg" class="option-img">
          <p>Import from local Files</p>
        </div>
      </li>
      <li class="option-item">
        <div class="menu-option-container has-sub-menu">
          <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
          <p>Import from Cloud</p>
          <img src="@/assets/images/interaction-menu/triangle-left.svg" class="option-img dropdown">
          <ul class="option-nested sub-menu" tabIndex="0" role="button">
            <div class="option-box sub-menu">
              <li class="option-item" @click="dropboxImport()">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/upload-drive.svg" class="option-img">
                  <p>Dropbox</p>
                </div>
              </li>
            </div>
          </ul>
        </div>
      </li>
      <li class="option-item spacer"/>
      <li class="option-item">
        <div class="menu-option-container has-sub-menu">
          <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
          <p>Export SVG</p>
          <img src="@/assets/images/interaction-menu/triangle-left.svg" class="option-img dropdown">
          <ul class="option-nested sub-menu" tabIndex="0" role="button">
            <div class="option-box sub-menu">
              <li class="option-item" @click="exportSVGLocal()">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/download-local.svg" class="option-img">
                  <p>To local Files</p>
                  <p class="shortcut" v-if="showShortCuts">Ctrl+P</p>
                </div>
              </li>
              <li class="option-item" @click="exportSVGDropBox()">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/upload-drive.svg" class="option-img">
                  <p>To Dropbox</p>
                </div>
              </li>
            </div>
          </ul>
        </div>
      </li>
      <li class="option-item">
        <div class="menu-option-container has-sub-menu">
          <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
          <p>Export XML</p>
          <img src="@/assets/images/interaction-menu/triangle-left.svg" class="option-img dropdown">
          <ul class="option-nested sub-menu" tabIndex="0" role="button">
            <div class="option-box sub-menu">
              <li class="option-item" @click="exportXMLLocal()">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/download-local.svg" class="option-img">
                  <p>To local Files</p>
                  <p class="shortcut" v-if="showShortCuts">Ctrl+S</p>
                </div>
              </li>
              <li class="option-item" @click="exportXMLDropBox()">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/upload-drive.svg" class="option-img">
                  <p>To Dropbox</p>
                </div>
              </li>
            </div>
          </ul>
        </div>
      </li>
      <li class="option-item spacer"/>
      <li class="option-item" @click="requestScoreDetails()">
        <div class="menu-option-container">
          <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
          <p>Edit Score Parameters</p>
        </div>
      </li>
    </div>
  </ul>
</template>

<script>
/**
 * The standard File menu component
 * @displayName Options File Menu
 */
export default {
    name: 'FileMenu',
    emits: ["requestNewScore", "requestUpload", "requestScoreDetails"],
    props: {
      showShortCuts: Boolean
    },
    computed: {
      
    },
    mounted () {
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
      requestNewScore() {
        this.$emit("requestNewScore");
      },
      openFileUpload () {
        document.getElementById("xml-file").click();
      },
      uploadScoreFromString (string) {
        const elem = document.getElementById(string);
        if ("files" in elem) {
          const score = elem.files[0];
          this.uploadScore (score);
        }
      },
      uploadScore (score) {
        console.log()
        if (score.type.includes("xml")) {
          const reader = new FileReader();
          reader.onload = function () {
            //currently there is no schema validation for the xml code since js does not easily support it
            const xmlRes = reader.result;
            const parser = new DOMParser();
            const docRes = parser.parseFromString(xmlRes, "text/xml")
            if (docRes.documentElement.nodeName == "laban:score" && !docRes.getElementsByTagName('parsererror').length > 0) {
              this.$emit("requestUpload", xmlRes);
            } else {
              this.$emit("requestUpload", "error");
            }
          }.bind(this);
          reader.readAsText(score);
        }
      },
      makeSVGFile () {
        const serializer = new XMLSerializer();
        const svg = serializer.serializeToString(document.getElementById("canvas"));
        return svg;
      },
      exportSVGLocal () {
        const svg = this.makeSVGFile();

        let filename = this.$store.state["title"];
        if (!filename.includes(".svg")) {
          filename = filename + ".svg";
        }
        const pom = document.createElement('a');
        const bb = new Blob([svg], {type: 'application/xml'});
        pom.setAttribute('href', window.URL.createObjectURL(bb));
        pom.setAttribute('download', filename);
        pom.dataset.downloadurl = ['application/xml', pom.download, pom.href].join(':');
        pom.draggable = true; 
        pom.classList.add('dragout');
        document.body.appendChild(pom);
        pom.click();
        document.body.removeChild(pom);
      },
      exportSVGDropBox () {
        const svg = this.makeSVGFile();
        const bb = new Blob([svg], {type: 'application/xml'});
        let filename = this.$store.state["title"];
        if (!filename.includes(".svg")) {
          filename = filename + ".svg";
        }
        let options = {
          files: [{url: "data:text/html,"+encodeURIComponent(bb), filename: filename}],
          success: function () {
              // Indicate to the user that the files have been saved.
          },
        }
        // disabling eslint temporarily because it identifies "Dropbox" as undefined, 
        // despite the fact that it is defined in the script defined in the mounted-hook
        /* eslint-disable */
        Dropbox.save(options);
        /* eslint-enable */
      },
      makeXMLFile () {
        const serializer = new XMLSerializer();
        const xml = serializer.serializeToString(this.$store.state["signsXML"]);
        return xml;
      },
      exportXMLLocal () {
        const xml = this.makeXMLFile()
       
        let filename = this.$store.state["title"];
        if (!filename.includes(".xml")) {
          filename = filename + ".xml";
        }
        const pom = document.createElement('a');
        const bb = new Blob([xml], {type: 'application/xml'});
        pom.setAttribute('href', window.URL.createObjectURL(bb));
        pom.setAttribute('download', filename);
        pom.dataset.downloadurl = ['application/xml', pom.download, pom.href].join(':');
        pom.draggable = true; 
        pom.classList.add('dragout');
        document.body.appendChild(pom);
        pom.click();
        document.body.removeChild(pom);
      }, 
      exportXMLDropBox () {
        const xml = this.makeXMLFile()
       
        let filename = this.$store.state["title"];
        if (!filename.includes(".xml")) {
          filename = filename + ".xml";
        }
        //const bb = new Blob([xml], {type: 'text/xml'});
        let options = {
          files: [{url: "data:text/html,"+encodeURIComponent(xml), filename: filename}],
          success: function () {
              // Indicate to the user that the files have been saved.
          },
        }
        // disabling eslint temporarily because it identifies "Dropbox" as undefined, 
        // despite the fact that it is defined in the script defined in the mounted-hook
        /* eslint-disable */
        Dropbox.save(options);
        /* eslint-enable */
      },
      requestScoreDetails () {
        this.$emit("requestScoreDetails");
      },
      dropboxImport() {
        let options = {
          success: async files => {
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
              this.uploadScore(blob);
          });
          },

          cancel: function() {},

          linkType: "direct",

          multiselect: false,

          extensions: [
          ".xml",
          ],

          folderselect: false,

          sizeLimit: 102400000
        };
        // disabling eslint temporarily because it identifies "Dropbox" as undefined, 
        // despite the fact that it is defined in the script defined in the mounted-hook
        /* eslint-disable */
        Dropbox.choose(options);
        /* eslint-enable */
      }
    }
  }
</script>


<style scoped>
</style>