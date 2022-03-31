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
          <input id="xml-file" type="file" @change="uploadScore('xml-file')" class="input-hidden">
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
              <li class="option-item" @click="importFromGDrive()">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/upload-drive.svg" class="option-img">
                  <p>Google Drive</p>
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
              <li class="option-item" @click="exportSVGGDrive()">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/upload-drive.svg" class="option-img">
                  <p>To Google Drive</p>
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
              <li class="option-item" @click="exportXMLLocal()">
                <div class="menu-option-container">
                  <img src="@/assets/images/common/upload-drive.svg" class="option-img">
                  <p>To Google Drive</p>
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
    methods: {
      requestNewScore() {
        this.$emit("requestNewScore");
      },
      openFileUpload () {
        document.getElementById("xml-file").click();
      },
      uploadScore (string) {
        const elem = document.getElementById(string);
        if ("files" in elem) {
          const score = elem.files[0];
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
            }.bind(this)
            reader.readAsText(score);
          }
        }
      },
      importFromGDrive () {
        //TODO
      },
      exportSVGLocal () {
        const serializer = new XMLSerializer();
        const svg = serializer.serializeToString(document.getElementById("canvas"));

        let filename = this.$store.state["title"];
        if (!filename.includes(".svg")) {
          filename = filename + ".svg";
        }
        //console.log(filename + ".xml");
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
      exportSVGGDrive () {
        //TODO
      },
      exportXMLLocal () {
        const serializer = new XMLSerializer();
        const xml = serializer.serializeToString(this.$store.state["signsXML"]);
       
        let filename = this.$store.state["title"];
        if (!filename.includes(".xml")) {
          filename = filename + ".xml";
        }
        //console.log(filename + ".xml");
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
      exportXMLGDrive () {
        //TODO
      },
      requestScoreDetails () {
        this.$emit("requestScoreDetails");
      }
    }
}
</script>


<style scoped>
</style>