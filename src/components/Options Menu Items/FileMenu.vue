<template>
  <ul class="option-nested menu-option" tabIndex="0" role="button">
    <li class="option-dropdown-top">
      <p>File</p>
    </li>
    <div class="option-box">
      <li class="option-item" @click="requestNewScore()">
        <div class="menu-option-container">
          <img src="@/assets/images/common/blank-file.svg" class="option-img">
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
          <img src="@/assets/images/common/download-cloud.svg" class="option-img">
          <p>Import from Cloud</p>
          <img src="@/assets/images/interaction-menu/triangle-left.svg" class="option-img dropdown">
          <ul class="option-nested sub-menu" tabIndex="0" role="button">
            <div class="option-box sub-menu">
              <CloudImportButton :btn="'DropBoxImport'" @uploadScore="uploadScore"/>
            </div>
          </ul>
        </div>
      </li>
      <li class="option-item spacer"/>
      <li class="option-item">
        <div class="menu-option-container has-sub-menu">
          <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
          <p>Save XML</p>
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
              <CloudExportButton :btn="'DropboxXMLExport'"/>
            </div>
          </ul>
        </div>
      </li>
      <li class="option-item">
        <div class="menu-option-container has-sub-menu">
          <img src="@/assets/images/interaction-menu/blank.svg" class="option-img">
          <p>Save SVG</p>
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
              <CloudExportButton :btn="'DropboxSVGExport'"/>
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
 * @emits requestNewScore opens the score creation modal
 * @emits requestUpload sends an imported score to the view to load
 * @emits requestScoreDetails opens the score details to edit them
 * @displayName Options File Menu
 */
export default {
    name: 'FileMenu',
    emits: ["requestNewScore", "requestUpload", "requestScoreDetails"],
    props: {
      showShortCuts: Boolean
    },
    methods: {
      /**
       * requests the opening of the score creation modal
       */
      requestNewScore() {
        this.$emit("requestNewScore");
      },
      /**
       * opens the local file upload popup
       */
      openFileUpload () {
        document.getElementById("xml-file").click();
      },
      /**
       * loads a selected file from the file explorer
       * @param string the id of the file upload input
       */
      uploadScoreFromString (string) {
        const elem = document.getElementById(string);
        if ("files" in elem) {
          const score = elem.files[0];
          this.uploadScore (score);
        }
      },
      /**
       * requests the parent to load an imported score
       * @param score either the xml doc string or an error string
       */
      uploadScore (score) {
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
      /**
       * serializes the canvas to a string
       * @return the svg string
       */
      makeSVGFile () {
        const serializer = new XMLSerializer();
        const svg = serializer.serializeToString(document.getElementById("canvas"));
        return svg;
      },
      /**
       * export the svg canvas to local files
       */
      exportSVGLocal () {
        const svg = this.makeSVGFile();

        let filename = this.$store.state["title"];
        if (!filename.includes(".svg")) {
          filename = filename + ".svg";
        }
        //creates a file download link
        const pom = document.createElement('a');
        //creates a blob file to download
        const bb = new Blob([svg], {type: 'application/xml'});
        pom.setAttribute('href', window.URL.createObjectURL(bb));
        pom.setAttribute('download', filename);
        pom.dataset.downloadurl = ['application/xml', pom.download, pom.href].join(':');
        pom.draggable = true; 
        pom.classList.add('dragout');
        // add the download link to the dom and click it
        document.body.appendChild(pom);
        pom.click();
        // remove the link again
        document.body.removeChild(pom);
      },
      /**
       * serializes the xml doc to a string
       * @return the xml string
       */
      makeXMLFile () {
        const serializer = new XMLSerializer();
        const xml = serializer.serializeToString(this.$store.state["signsXML"]);
        return xml;
      },
      /**
       * export the xml score to local files
       */
      exportXMLLocal () {
        const xml = this.makeXMLFile();

        let filename = this.$store.state["title"];
        if (!filename.includes(".xml")) {
          filename = filename + ".xml";
        }

        //creates a download link
        const pom = document.createElement('a');
        // creates a blob file to download
        const bb = new Blob([xml], {type: 'application/xml'});
        pom.setAttribute('href', window.URL.createObjectURL(bb));
        pom.setAttribute('download', filename);
        pom.dataset.downloadurl = ['application/xml', pom.download, pom.href].join(':');
        pom.draggable = true; 
        pom.classList.add('dragout');
        //add the link, click it
        document.body.appendChild(pom);
        pom.click();
        //remove the link
        document.body.removeChild(pom);
      }, 
      /**
       * requests opening the score details to edit them
       */
      requestScoreDetails () {
        this.$emit("requestScoreDetails");
      },
    }
  }
</script>