<template>
  <div>
    <Header/>
    <SignLibrary/>
    <div id="interactionBox">
      <InteractionMenu/>
      <Score :signs="signs" @editSign="editSigns"/>
    </div>
  </div>
</template>

<script>

/**
 * The visual grid component
 * @displayName Grid
 */
export default {
  name: "Grid",
  inject: [],
  props: {
    
  },
  data() {
    return {
      //instead of here, save in vuex -> better accessebility for views
      signs: [
        {isSelected: false, height: 0, x: 0, y: 0, purpose: "dummy sign", signData: {baseType: "GenericSign", signType: "In place"}},
        {isSelected: false, canResize: true, height: 100, x: 100, y: 100, signData: {baseType: "DirectionSign", signType: "Backward direction", side: "left", col: -2, bar: 2, beat: 0, resizable: true}},
        {isSelected: false, canResize: true, height: 50, x: 20, y: 0, signData: {baseType: "DirectionSign", signType: "Left forward direction", side: "left", col: -3, bar: 2, beat: 3, resizable: true}},
        {isSelected: false, canResize: true, height: 100, x: 100, y: 0, signData: {baseType: "DirectionSign", signType: "Right direction", side: "left", col: -2, bar: 2, beat: 2, resizable: true}},
        {isSelected: false, canResize: true, height: 100, x: 180, y: 200, signData: {baseType: "TurnSign", signType: "Left turn", side: "left", col: -1, bar: 1, beat: 2, resizable: true}},
        {isSelected: false, canResize: true, height: 100, x: 260, y: 200, signData: {baseType: "VibrationSign", side: "left", col: 0, bar: 1, beat: 2, resizable: true}},
        {isSelected: false, canResize: false, height: 50, x: 180, y: 505, signData: {baseType: "SpaceMeasurementSign", signType: "Unfolding", degree: 1, side: "left", col: -1, bar: -1, beat: 0, resizable: true}},
      ],
      xmlScore: null,
    };
  },
  computed: {
    author () {
      return this.$store.state["author"];
    },
    title () {
      return this.$store.state["title"];
    },
    description () {
      return this.$store.state["description"];
    },
    bars () {
      return this.$store.state["bars"];
    },
    timeUnit () {
      return this.$store.state["timeUnit"];
    },
    beatDuration () {
      return this.$store.state["beatDuration"];
    },
    beats () {
      return this.$store.state["beatsPerBar"];
    }
  },
  mounted () {
    if (!this.getXMLCookie()) {
      //no saved score -> make a new one
      console.log("no saved score");
    }
    this.makeNewScore();
  },
  methods: {
    editSigns(obj) {
      if (obj.type == "add") {
        this.addSign(obj.data);
      } else if (obj.type == "move") {
        this.moveSign(obj.index, obj.data);
      } else if (obj.type == "resize") {
        this.resizeSign(obj.index, obj.data);
      } else if (obj.type == "changeSelection") {
        this.changeSelect(obj.index, obj.data);
      } else if (obj.type == "changeCanResize") {
        this.changeCanResize(obj.index, obj.data);
      } else if (obj.type == "changeSignData") {
        this.changeSignData(obj.index, obj.data);
      } else if (obj.type == "delete") {
        this.deleteSign(obj.index);
      }
      //send changes to command controller somehow
    },
    addSign (data) {
      this.signs.push(data);
      //add new sign to xml
      //distinguish between <collumn def> and <movement> (collumn def -> sign.bar: -1)
    },
    moveSign (index, data) {
      this.signs[index].x = data.x;
      this.signs[index].y = data.y;
      //no xml change, purely visual change
    },
    resizeSign (index, data) {
      this.signs[index].height = data.height;
      //change xml sign height (height/beatheight) 
    },
    changeSelect (index, data) {
      this.signs[index].isSelected = data.isSelected;
      //no xml change
    },
    changeCanResize (index, data) {
      this.signs[index].canResize = data.canResize;
      //no xml change
    },
    changeSignData (index, data) {
      for (const [key, value] of Object.entries(data)) {
        this.signs[index].signData[key] = value;
      }
      //update sign xml with new data
    },
    deleteSign (index) {
      this.signs.splice(index, 1);
      //delete sign from xml
    },
    getXMLCookie() {
      return false
    },
    setXMLCookie() {
      //sets the xml cookie based on the current xml
      //called on the update methods
    },
    makeNewScore(template = false) {
      //generate a new score if template = false
      //else if template is a string -> load from assets/templates
      console.log(template);
      if (!template) {
        //no template -> create empty score
        let xmlDoc = document.implementation.createDocument("", "", null);
          let scoreElem = xmlDoc.createElement("laban:score");
          scoreElem.setAttribute("xmlns:laban", "http://www.example.org/labanotation");
          scoreElem.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
          scoreElem.setAttribute("xsi:schemaLocation", "http://www.example.org/labanotation labanotation.xsd");

            let version = xmlDoc.createElement("laban:version");
            version.innerHTML = 0.5;
            scoreElem.appendChild(version);

            let author = xmlDoc.createElement("laban:author");
            author.innerHTML = this.author;
            scoreElem.appendChild(author);

            let title = xmlDoc.createElement("laban:title");
            title.innerHTML = this.title;
            scoreElem.appendChild(title);

            let description = xmlDoc.createElement("laban:description");
            description.innerHTML = this.title;
            scoreElem.appendChild(description);

            let staff = xmlDoc.createElement("laban:staff");

              let measures = xmlDoc.createElement("laban:measures");
              measures.innerHTML = this.bars;
              staff.appendChild(measures);

              let timing = xmlDoc.createElement("laban:timing");
                let timeUnit = xmlDoc.createElement("laban:timeUnit");
                timeUnit.innerHTML = this.timeUnit;
                timing.appendChild(timeUnit);

                let measure = xmlDoc.createElement("laban:measure");
                  let index = xmlDoc.createElement("laban:index");
                  index.innerHTML = 0;
                  measure.appendChild(index);

                  let beatDuration = xmlDoc.createElement("laban:beatDuration");
                  beatDuration.innerHTML = this.beatDuration;
                  measure.appendChild(beatDuration);

                  let beats = xmlDoc.createElement("laban:beats");
                  beats.innerHTML = this.beats;
                  measure.appendChild(beats);

                timing.appendChild(measure);

              staff.appendChild(timing);

              let columns = xmlDoc.createElement("laban:collumns");
              staff.appendChild(columns);
              let movements = xmlDoc.createElement("laban:movements");
              staff.appendChild(movements);

            scoreElem.appendChild(staff);

          xmlDoc.appendChild(scoreElem);
          this.xmlScore = xmlDoc;
          //console.log(this.xmlScore.getElementsByTagName("laban:measures")[0].innerHTML);
      }
    },
    loadXMLFromFile() {
      //distinguish between external upload and template string
      //external -> check with schema
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #interactionBox {
    width: 84%;
    float: right;
  }
</style>
