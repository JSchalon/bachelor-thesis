import { createStore } from 'vuex'

export default createStore({
  state: {
    //score properties
    author: "",
    bars: 2,
    beatDuration: 1,
    beatsPerBar: 4,
    columnsLeft: 3,
    columnsRight: 3,
    description: "",
    timeUnit: "second",
    title: "",
    
    //library and sign placement data
    curSign: false,
    ghostOverCanvas: false,
    ghostPos: {x: 0, y: 0},
    ghostActive: false,
    libraryActive: true,

    //visual score and grid state
    contextActive: false,
    duplicateSignActive: false,
    gridSelected: [],
    interacting: false,
    multiselectActive: false, 
    selectedBar: false,
    selectedColumn: false,
    selectedSigns: [],
    signs: [
      //first sign is a dummy sign:
      //Else there are problems with context menus
      //A relationship bow is used, since the interact listener for their resize function does not work unless there is a bow on the score upon mount (not easily fixable, an interact.js bug)
      {baseType: "RelationshipBow", signType: "Address", isSelected: false, beatHeight: 0, width: 0, resizable: false, bar: 0, beat: 0, col: 0},
    ],
    signsXML: null,
    
    //editor data
    cloudAlert: "",

    isPhone: false,
    isTablet: false,
    
    language: "eng", 
    seenIntro: false, 
    showHelpLines: true,
    showScoreDescription: false,

    //converter helpers, used for converting body part signs between js-obj and xml
    limbNames: {Head: "neck", Shoulder: "arm", Elbow: "upper_arm", Wrist: "lower_arm", Hip: "leg", Knee: "thigh", Ankle: "lower_leg"},
    fingerNames: ["thumb","indexFinger","middleFinger","ringFinger","littleFinger"],
    toeNames: ["bigToe","longToe","middleToe","ringToe","littleToe"],
    xmlParts: ["Head", "Chest", "Waist", "Pelvis", "Torso"],

    //undo & redo history
    undoStack: [],
    redoStack: [],
  },
  // mutations are used to edit the vuex state
  mutations: {
    setColumns (state, data) {
      if (data.side == "left") {
        state["columnsLeft"] = state["columnsLeft"] + data.number;
      } 
      if (data.side == "right") {
        state["columnsRight"] = state["columnsRight"] + data.number;
      }
    },
    setBars (state, number) {
      state["bars"] = state["bars"] + number;
      state["signsXML"].getElementsByTagName("laban:measures")[0].innerHTML = state["bars"];
    },
    setSelectedBar (state, index) {
      state["selectedBar"] = index;
    },
    setSelectedColumn (state, index) {
      state["selectedColumn"] = index;
    },
    setCurSign(state, data) {
      state["curSign"] = data;
    },
    removeCurSign (state) {
      state["curSign"] = false;
    },
    setGhostOverCanvas (state, bool) {
      state["ghostOverCanvas"] = bool;
    },
    setGhostPos (state, obj) {
      state["ghostPos"] = obj;
    },
    setGhostActive (state, bool) {
      state["ghostActive"] = bool;
    },
    setInteracting (state, bool) {
      state["interacting"] = bool;
    },
    clearSelectedSigns (state) {
      state["selectedSigns"] = [];
      for (let elem of state["signs"]) {
        elem.isSelected = false;
      }
    },
    addToSelectedSigns (state, index) {
      state["selectedSigns"].push(index);
      state["signs"][index].isSelected = true;
    },
    removeFromSelectedSigns (state, index) {
      state["selectedSigns"].splice(state["selectedSigns"].indexOf(index),1);
      state["signs"][index].isSelected = false;
    },
    clearGridSelect (state) {
      state["gridSelected"] = [];
    },
    addToGridSelect (state, obj) {
      state["gridSelected"].push(obj);
    },
    setContextMenu (state, bool) {
      state["contextActive"] = bool;
    },
    toggleMultiSelect (state) {
      state["multiselectActive"] = !state["multiselectActive"];
    },
    toggleDuplicateSignActive (state) {
      state["duplicateSignActive"] = !state["duplicateSignActive"];
    },
    addSignToObj(state, data) {
      state["signs"].push(data);
    },
    /**
     * the method for adding signs to xml
     * @param {*} state the vuex state
     * @param {*} param1 the js object sign and the sign index
     */
    addSignToXML(state, {obj, index}) {
      let colIndex = 0;
      // check how many column definitions came before this index
      // for a column definition, this is the index in the xml columns
      // for movement signs, subtract this from the index-1 (zero-indexing) to get the index in the xml movements  
      for (let a = 1; a < index; a++) {
        if (state["signs"][a].bar == -1) {
          colIndex = colIndex + 1;
        }
      }
      let data = obj;
      if (!obj) {
        data = state["signs"][index];
      }
      //init element variables
      let signWrapper = null;
      let container = null;
      let innerContainer = null;
      let valueContainer = null;
      if (data.bar == -1) { // bar == -1 -> column definition
        //make wrapper for column definitions
        signWrapper = state["signsXML"].createElement("laban:columnDefinition");
        container = state["signsXML"].getElementsByTagName("laban:columns")[0];
        valueContainer = state["signsXML"].createElement("laban:index");
        valueContainer.innerHTML = data.col;
        signWrapper.appendChild(valueContainer);
        innerContainer = state["signsXML"].createElement("laban:preSign");
        let signContainer = null;
        // create a body part sign
        if (data.baseType == "BodyPartSign") {
          signContainer = state["signsXML"].createElement("laban:bodyPart");
          let partType = null;
          if (data.surface != false) { // is surface
            partType = state["signsXML"].createElement("laban:surface");
            let limb = state["signsXML"].createElement("laban:limb");
            let defa = state["signsXML"].createElement("laban:default");
            valueContainer = state["signsXML"].createElement("laban:limb");
            valueContainer.innerHTML = state["limbNames"][data.signType];
            defa.appendChild(valueContainer);
            limb.appendChild(defa);
            partType.appendChild(limb);
            valueContainer = state["signsXML"].createElement("laban:side");
            valueContainer.innerHTML = data.surface;
            partType.appendChild(valueContainer);
          } else if (data.limb && data.canBeLimb) { // is limb
            partType = state["signsXML"].createElement("laban:limb");
            let defa = state["signsXML"].createElement("laban:default");
            valueContainer = state["signsXML"].createElement("laban:limb");
            valueContainer.innerHTML = state["limbNames"][data.signType];
            defa.appendChild(valueContainer);
            partType.appendChild(defa);
          } else if ((data.digit !== false) && data.digit >= 0) { // is a digit (fingers, toes)
            partType = state["signsXML"].createElement("laban:digit");
            valueContainer = state["signsXML"].createElement("laban:digit");
            if (data.signType == "Fingers") {
              valueContainer.innerHTML = state["fingerNames"][data.digit - 1];
            } else {
              valueContainer.innerHTML = state["toeNames"][data.digit - 1];
            }
            partType.appendChild(valueContainer);
            valueContainer = state["signsXML"].createElement("laban:joint");
            valueContainer.innerHTML = data.joint;
            partType.appendChild(valueContainer);
          } else if (data.canBeLimb || !(data.signType in state["xmlParts"])) { // joints (not area signs)
            partType = state["signsXML"].createElement("laban:joint");
            valueContainer = state["signsXML"].createElement("laban:joint");
            valueContainer.innerHTML = data.signType.toLowerCase();
            partType.appendChild(valueContainer);
          } else { // area signs (i.e. torso, head)
            partType = state["signsXML"].createElement("laban:part");
            partType.innerHTML = data.signType.toLowerCase();
          }
          // append to column definitions
          signContainer.appendChild(partType);
          valueContainer = state["signsXML"].createElement("laban:side");
          if (partType.nodeName == "laban:part") {
            valueContainer.innerHTML = "none";
          } else {
            valueContainer.innerHTML = data.side;
          }
          signContainer.appendChild(valueContainer);
        } else { // not body part but column definition -> prop sign
          signContainer = state["signsXML"].createElement("laban:prop"); 
          valueContainer = state["signsXML"].createElement("laban:name");
          valueContainer.innerHTML = data.signType;
          signContainer.appendChild(valueContainer);
        }
        innerContainer.appendChild(signContainer);
        signWrapper.appendChild(innerContainer);
        if (index < 0 || colIndex >= container.children.length) {
          container.appendChild(signWrapper);
        } else {
          container.insertBefore(signWrapper, container.children[colIndex]);
          
        }
      } else { // bar > -1 -> normal sign
        container = state["signsXML"].getElementsByTagName("laban:movements")[0];
        if (data.baseType == "PathSign") { // type == path -> special wrapper
          signWrapper = state["signsXML"].createElement("laban:path");
          // path type
          valueContainer = state["signsXML"].createElement("laban:type");
          valueContainer.innerHTML = data.signType;
          signWrapper.appendChild(valueContainer);
          let bar = state["signsXML"].createElement("laban:measure");
          bar.innerHTML = data.bar;
          signWrapper.appendChild(bar);
          let beat = state["signsXML"].createElement("laban:beat");
          beat.innerHTML = data.beat + ".0";
          signWrapper.appendChild(beat);
          // path length
          valueContainer = state["signsXML"].createElement("laban:duration");
          valueContainer.innerHTML = data.beatHeight + ".0";
          signWrapper.appendChild(valueContainer);
        } else if (data.baseType == "RoomDirectionSign") { // type == room direction -> special wrapper
          signWrapper = state["signsXML"].createElement("laban:roomDirection");
          // direction -> vertical dimension and degree
          let bar = state["signsXML"].createElement("laban:measure");
          bar.innerHTML = data.bar;
          signWrapper.appendChild(bar);
          let beat = state["signsXML"].createElement("laban:beat");
          beat.innerHTML = data.beat + ".0";
          signWrapper.appendChild(beat);
          innerContainer = state["signsXML"].createElement("laban:direction");
          // vertical dimension
          valueContainer = state["signsXML"].createElement("laban:vertical");
          valueContainer.innerHTML = "middle";
          innerContainer.appendChild(valueContainer);
          // degree
          valueContainer = state["signsXML"].createElement("laban:horizontal");
          valueContainer.innerHTML = data.degree;
          innerContainer.appendChild(valueContainer);
          signWrapper.appendChild(innerContainer);
        } else if (data.baseType == "RelationshipBow") { // type == relationship bow -> special wrapper
          signWrapper = state["signsXML"].createElement("laban:relationship");
          // relationship type
          valueContainer = state["signsXML"].createElement("laban:type");
          valueContainer.innerHTML = data.signType;
          signWrapper.appendChild(valueContainer);
          // grasping?
          valueContainer = state["signsXML"].createElement("laban:grasping");
          valueContainer.innerHTML = data.grasping;
          signWrapper.appendChild(valueContainer);
          // passing?
          valueContainer = state["signsXML"].createElement("laban:passing");
          
          valueContainer.innerHTML = data.passing;
          signWrapper.appendChild(valueContainer);
          // holding?
          if ("holding" in data) {
            valueContainer = state["signsXML"].createElement("laban:hold");
            valueContainer.innerHTML = data.holding;
            signWrapper.appendChild(valueContainer);
          }
          let bar = state["signsXML"].createElement("laban:measure");
          bar.innerHTML = data.bar;
          signWrapper.appendChild(bar);
          let beat = state["signsXML"].createElement("laban:beat");
          beat.innerHTML = data.beat + ".0";
          signWrapper.appendChild(beat);
          // endpoints
          innerContainer = state["signsXML"].createElement("laban:endPoints");
          // left endpoint (column + active?)
          let endpoint = state["signsXML"].createElement("laban:left");
          valueContainer = state["signsXML"].createElement("laban:column");
          valueContainer.innerHTML = data.col;
          endpoint.appendChild(valueContainer);
          valueContainer = state["signsXML"].createElement("laban:active");
          if (data.signType == "address") {
            if (data.addressing == "right" || data.addressing == "both") {
              valueContainer.innerHTML = true;
            } else {
              valueContainer.innerHTML = false;
            }
          } else {
            valueContainer.innerHTML = false;
          }
          endpoint.appendChild(valueContainer);
          innerContainer.appendChild(endpoint);
          // right endpoint (column + active?)
          endpoint = state["signsXML"].createElement("laban:right");
          valueContainer = state["signsXML"].createElement("laban:column");
          valueContainer.innerHTML = data.colRight;
          endpoint.appendChild(valueContainer);
          valueContainer = state["signsXML"].createElement("laban:active");
          if (data.signType == "address") {
            if (data.addressing == "left" || data.addressing == "both") {
              valueContainer.innerHTML = true;
            } else {
              valueContainer.innerHTML = false;
            }
          } else {
            valueContainer.innerHTML = false;
          }
          endpoint.appendChild(valueContainer);
          innerContainer.appendChild(endpoint);
          signWrapper.appendChild(innerContainer);
        } else { // no special sign -> normal movement wrapper
          signWrapper = state["signsXML"].createElement("laban:movement");
         
          valueContainer = state["signsXML"].createElement("laban:column");
          valueContainer.innerHTML = data.col;
          signWrapper.appendChild(valueContainer);
          
          //get beat/bar
          let bar = state["signsXML"].createElement("laban:measure");
          bar.innerHTML = data.bar;
          signWrapper.appendChild(bar);
          let beat = state["signsXML"].createElement("laban:beat");
          beat.innerHTML = data.beat + ".0";
          signWrapper.appendChild(beat);
          
          // make container
          valueContainer = state["signsXML"].createElement("laban:duration");
          valueContainer.innerHTML = data.beatHeight + ".0";
          signWrapper.appendChild(valueContainer);
          valueContainer = state["signsXML"].createElement("laban:hold");
          if ("holding" in data) {
            valueContainer.innerHTML = data.holding;
          } else {
            valueContainer.innerHTML = false;
          }
          signWrapper.appendChild(valueContainer);
          
          if (data.baseType == "SpaceMeasurementSign") { // space measurement
            let space = state["signsXML"].createElement("laban:space");
            
            innerContainer = state["signsXML"].createElement("laban:spaceMeasurement");
            //type
            valueContainer = state["signsXML"].createElement("laban:type");
            if (data.signType == "NeitherOr") {
              valueContainer.innerHTML = "none";
            } else {
              valueContainer.innerHTML = data.signType.toLowerCase();
            }
            data.signType.toLowerCase();
            innerContainer.appendChild(valueContainer);
            // degree
            valueContainer = state["signsXML"].createElement("laban:degree");
            valueContainer.innerHTML = data.degree;
            innerContainer.appendChild(valueContainer);
            space.appendChild(innerContainer);
            signWrapper.appendChild(space);
          } else if (data.baseType == "TurnSign") { // turn
            let turn = state["signsXML"].createElement("laban:turn");
            //direction (any, clockwise, counter clockwise)
            valueContainer = state["signsXML"].createElement("laban:direction");
            valueContainer.innerHTML = data.signType;
            turn.appendChild(valueContainer);
            //degree (optional)
            if ("definition" in data && data.definition) {
              innerContainer = state["signsXML"].createElement("laban:degree");
              let degree = null;
              if (data.definition.baseType == "Pin") {
                degree = state["signsXML"].createElement("laban:quantitative");
                // vertical dimension
                valueContainer = state["signsXML"].createElement("laban:vertical");
                valueContainer.innerHTML = data.definition.signType.toLowerCase();
                degree.appendChild(valueContainer);
                // degree
                valueContainer = state["signsXML"].createElement("laban:horizontal");
                valueContainer.innerHTML = data.definition.degree;
                degree.appendChild(valueContainer);
              } else { //not a pin -> space measurement
                degree = state["signsXML"].createElement("laban:qualitative");
                // space measurement type
                valueContainer = state["signsXML"].createElement("laban:type");
                valueContainer.innerHTML = data.definition.signType.toLowerCase();
                degree.appendChild(valueContainer);
                // degree
                valueContainer = state["signsXML"].createElement("laban:degree");
                valueContainer.innerHTML = data.definition.degree;
                degree.appendChild(valueContainer);
              }
              innerContainer.appendChild(degree);
              turn.appendChild(innerContainer);
              
            }
            signWrapper.appendChild(turn);
          } else if (data.baseType == "VibrationSign") { // vibration
            let vibration = state["signsXML"].createElement("laban:vibration");
            //lower pin
            innerContainer = state["signsXML"].createElement("laban:displacement");
            // vertical dimension
            valueContainer = state["signsXML"].createElement("laban:vertical");
            valueContainer.innerHTML = data.lowerPin.signType.toLowerCase();
            innerContainer.appendChild(valueContainer);
            // degree
            valueContainer = state["signsXML"].createElement("laban:horizontal");
            valueContainer.innerHTML = data.lowerPin.degree;
            innerContainer.appendChild(valueContainer);
            vibration.appendChild(innerContainer);
            // upper pin
            innerContainer = state["signsXML"].createElement("laban:displacement");
            // vertical dimension
            valueContainer = state["signsXML"].createElement("laban:vertical");
            valueContainer.innerHTML = data.upperPin.signType.toLowerCase();
            innerContainer.appendChild(valueContainer);
            // degree
            valueContainer = state["signsXML"].createElement("laban:horizontal");
            valueContainer.innerHTML = data.upperPin.degree;
            innerContainer.appendChild(valueContainer);
            vibration.appendChild(innerContainer);

            signWrapper.appendChild(vibration);
          } else if (data.baseType == "DirectionSign") { // direction
            innerContainer = state["signsXML"].createElement("laban:direction");
            valueContainer = state["signsXML"].createElement("laban:vertical");
            valueContainer.innerHTML = data.dimension.toLowerCase();
            innerContainer.appendChild(valueContainer);
            valueContainer = state["signsXML"].createElement("laban:horizontal");
            valueContainer.innerHTML = data.signType;
            innerContainer.appendChild(valueContainer);
            
            if ("definition" in data && data.definition) {
              let modification = state["signsXML"].createElement("laban:modificationPin");
              valueContainer = state["signsXML"].createElement("laban:vertical");
              valueContainer.innerHTML = data.definition.signType.toLowerCase();
              modification.appendChild(valueContainer);
              valueContainer = state["signsXML"].createElement("laban:horizontal");
              valueContainer.innerHTML = data.definition.degree;
              modification.appendChild(valueContainer);
              innerContainer.appendChild(modification);
            }
            if ("position" in data && data.position && data.position != "---") {
              let position = state["signsXML"].createElement("laban:relationshipPin");
              valueContainer = state["signsXML"].createElement("laban:vertical");
              valueContainer.innerHTML = "low";
              position.appendChild(valueContainer);
              valueContainer = state["signsXML"].createElement("laban:horizontal");
              if (data.position == "Infront") {
                valueContainer.innerHTML = 0;
              } else {
                valueContainer.innerHTML = 180;
              }
              position.appendChild(valueContainer);
              innerContainer.appendChild(position);
            }
            if ("spaceMeasurement" in data && data.spaceMeasurement) {
              let space = state["signsXML"].createElement("laban:spaceMeasurement");
              valueContainer = state["signsXML"].createElement("laban:vertical");
              if (data.signType == "NeitherOr") {
                valueContainer.innerHTML = "none";
              } else {
                valueContainer.innerHTML = data.signType.toLowerCase();
              }
              space.appendChild(valueContainer);
              valueContainer = state["signsXML"].createElement("laban:horizontal");
              valueContainer.innerHTML = data.position.degree;
              space.appendChild(valueContainer);
              innerContainer.appendChild(space);
            }
            signWrapper.appendChild(innerContainer);
          } else if (data.baseType == "Cancel") { // cancel sign
            innerContainer = state["signsXML"].createElement("laban:cancellation");
            valueContainer = state["signsXML"].createElement("laban:cancel");
            valueContainer.innerHTML = data.signType;
            innerContainer.appendChild(valueContainer);
            signWrapper.appendChild(innerContainer);
          }
        }
        
        if (index < 0 || (index - 1 - colIndex) >= container.children.length) { //if no index is given, or the index is too large, place the sign at the end    
          container.appendChild(signWrapper);
        } else { // else place it at the index
          container.insertBefore(signWrapper, container.children[index - colIndex - 1]);
        }
      }
    },
    changeSignData (state, obj) {
      const index = obj.index;
      const signData = obj.data;
      for (const [key, value] of Object.entries(signData)) {
        state["signs"][index][key] = value;
      }
    },
    deleteSignFromObj(state, index) {
      state["signs"].splice(index, 1);
    },
    deleteSignFromXML(state, index) {
      //shadow elem does not get added to xml -> no need to delete
      if ("isShadow" in state["signs"][index] && state["signs"][index].isShadow) {
        return;
      }
     
      let container = null;
      let colIndex = 0;
      
      // check how many column definitions came before this index
      // for a column definition, this is the index in the xml columns
      // for movement signs, subtract this from the index-1 (zero-indexing) to get the index in the xml movements  
      for (let a = 1; a < index; a++) {
        if (state["signs"][a].bar == -1) {
          colIndex = colIndex + 1;
        }
      }
      if (state["signs"][index].bar == -1) { // bar == -1 -> column definition
        //check for how many column definitions came before
        container = state["signsXML"].getElementsByTagName("laban:columns")[0];
        container.removeChild(container.children[colIndex]);
      } else { // bar > -1 -> normal sign
        container = state["signsXML"].getElementsByTagName("laban:movements")[0];
        container.removeChild(container.children[(index - colIndex - 1)]);
      }
    },
    setSettings(state, data) {
      if ("language" in data) {
        state["language"] = data.language;
      }
      if ("showHelpLines" in data) {
        state["showHelpLines"] = data.showHelpLines;
      }
      if ("seenIntro" in data) {
        state["seenIntro"] = data.seenIntro;
      }
      if ("showScoreDescription" in data) {
        state["showScoreDescription"] = data.showScoreDescription;
      }
      let d = new Date();
      d.setTime(d.getTime() + 60 * 24 * 60 * 60 * 1000);
      let newCookie = {seenIntro: state["seenIntro"], language: state["language"], showHelpLines: state["showHelpLines"], showScoreDescription: state["showScoreDescription"]};
      document.cookie = "settings=" + JSON.stringify(newCookie) + "; expires=" + d.toUTCString() + "; path=/";
    },
    setIsPhone (state, bool) {
      state["isPhone"] = bool;
    },
    setIsTablet (state, bool) {
      state["isTablet"] = bool;
    },
    setCloudAlert (state, str) {
      state["cloudAlert"] = str;
    },
    editScoreParameters (state, data) {
      if ("author" in data) {
        state["author"] = data.author;
        state["signsXML"].getElementsByTagName("laban:author")[0].innerHTML = data.author;
      } if ("title" in data) {
        state["title"] = data.title;
        state["signsXML"].getElementsByTagName("laban:title")[0].innerHTML = data.title;
      } if ("description" in data) {
        state["description"] = data.description;
        state["signsXML"].getElementsByTagName("laban:description")[0].innerHTML = data.description;
      } if ("timeUnit" in data) {
        state["timeUnit"] = data.timeUnit;
        state["signsXML"].getElementsByTagName("laban:timeUnit")[0].innerHTML = data.timeUnit;
      } if ("beatDuration" in data) {
        state["beatDuration"] = data.beatDuration;
        state["signsXML"].getElementsByTagName("laban:beatDuration")[0].innerHTML = data.beatDuration;
      } if ("beatsPerBar" in data) {
        state["beatsPerBar"] = data.beatsPerBar;
        state["signsXML"].getElementsByTagName("laban:beats")[0].innerHTML = data.beatsPerBar;
      }
    },
    /**
     * Loads a template, either from a file or a template
     * @param {*} state the vuex state
     * @param {*} template the template string, or a file
     */
    loadScoreFromTemplate(state, template) {
      // load data
      let data = require("@/assets/score-templates/blank-score.xml")
      if (!template || ((template == "local-storage" && !localStorage.getItem("score")))) {
        data = require("@/assets/score-templates/blank-score.xml");
      } else if (template == "local-storage" && localStorage.getItem("score")) {
        data = {};
        data.default = localStorage.getItem("score");
      } else if (typeof template == "object" && "file" in template) {
        data = {};
        data.default = template.file;
      } else {
        data = require("@/assets/score-templates/" + template + ".xml")
      }
      const parser = new DOMParser();
      let xml = parser.parseFromString(data.default,"text/xml");
      //clear signs if there are any present before loading a new score
      while(state["signs"].length > 1) {
        state["signs"].pop();
      }
      // get score parameters
      state["signsXML"] = xml;
      state["author"] = xml.getElementsByTagName("laban:author")[0].innerHTML;
      state["title"] = xml.getElementsByTagName("laban:title")[0].innerHTML;
      state["description"] = xml.getElementsByTagName("laban:description")[0].innerHTML;
      state["timeUnit"] = xml.getElementsByTagName("laban:timeUnit")[0].innerHTML;
      state["beatDuration"] = parseInt(xml.getElementsByTagName("laban:beatDuration")[0].innerHTML);
      state["beatsPerBar"] = parseInt(xml.getElementsByTagName("laban:beats")[0].innerHTML);
      state["bars"] = 2;
      state["columnsLeft"] = 3;
      state["columnsRight"] = 3;
      // add signs from column definitions
      for (let elem of xml.getElementsByTagName("laban:columns")[0].children) {
        let sign = {baseType: "", signType: "", digit: false, joint: false, surface: false, limb: false, resizable: false, canBeLimb: false, isSelected: false};
        sign.col = parseInt(elem.getElementsByTagName("laban:index")[0].innerHTML);
        if (sign.col < -state["columnsLeft"]) {
          state["columnsLeft"] = Math.abs(sign.col);
        } else if (sign.col >= state["columnsRight"]) {
          state["columnsRight"] = sign.col + 1;
        }
        sign.bar = -1;
        sign.beat = 0;
        sign.beatHeight = 0.8;
        if (elem.getElementsByTagName("laban:preSign")[0].children[0].nodeName == "laban:bodyPart") { // body parts
          sign.baseType = "BodyPartSign";
          sign.side = elem.getElementsByTagName("laban:side")[0].innerHTML;
          if (sign.side == "none") {
            if (sign.col < 0) {
              sign.side = "left";
            } else {
              sign.side = "right";
            }
          }
          let elemWrapper = elem.getElementsByTagName("laban:bodyPart")[0].children[0];
          if (elemWrapper.nodeName == "laban:part") { // body part (like head, torso)
            if (elemWrapper.innerHTML == "head") {
              sign.canBeLimb = true;
            }
            sign.signType = elemWrapper.innerHTML.charAt(0).toUpperCase() + elemWrapper.innerHTML.slice(1);
          } else if (elemWrapper.nodeName == "laban:joint") { // joint (ankle, hip)
            sign.signType = elemWrapper.children[0].innerHTML.charAt(0).toUpperCase() + elemWrapper.children[0].innerHTML.slice(1);
            if (sign.signType in state["limbNames"]) {
              sign.canBeLimb = true;
            }
          } else if (elemWrapper.nodeName == "laban:digit") { // digits (fingers, toes)
            sign.digit = state["toeNames"].indexOf(elemWrapper.children[0].innerHTML);
            sign.signType = "Toes";
            if (sign.digit < 0) {
              sign.digit = state["fingerNames"].indexOf(elemWrapper.children[0].innerHTML);
              sign.signType = "Fingers";
            }
            sign.digit = sign.digit + 1;
            sign.joint = parseInt(elemWrapper.getElementsByTagName("laban:joint")[0].innerHTML);
          } else if (elemWrapper.nodeName == "laban:limb") { // limbs (upper arm,...)
            sign.canBeLimb = true;
            const limbName = elemWrapper.children[0].getElementsByTagName("laban:limb")[0].innerHTML;
            sign.limb = true;
            for (let [key, value] of Object.entries(state["limbNames"])) {
              if (value == limbName) {
                sign.signType = key;
              }
            }
          } else if (elemWrapper.nodeName == "laban:surface") { // surfaces
            sign.limb = true;
            sign.canBeLimb = true;
            sign.surface = elemWrapper.getElementsByTagName("laban:side")[0].innerHTML;
            const limbName = elemWrapper.children[0].getElementsByTagName("laban:limb")[0].innerHTML;
            for (let [key, value] of Object.entries(state["limbNames"])) {
              if (value == limbName) {
                sign.signType = key;
              }
            }
          }
        } else { // prop signs
          sign.baseType = "PropSign";
          sign.signType = elem.getElementsByTagName("laban:name")[0].innerHTML;
          if (sign.col < 0) {
            sign.side = "left";
          } else {
            sign.side = "right";
          }
        }
        state["signs"].push(sign);
      }
      for (let elem of xml.getElementsByTagName("laban:movements")[0].children) { // regular movements
        let sign = {isSelected: false};
        if (elem.nodeName == "laban:path") { // path signs
          sign.baseType = "PathSign";
          sign.signType = elem.getElementsByTagName("laban:type")[0].innerHTML;
          sign.col = state["columnsRight"];
          sign.side = "right";
          sign.bar = parseInt(elem.getElementsByTagName("laban:measure")[0].innerHTML);
          sign.beat = parseInt(elem.getElementsByTagName("laban:beat")[0].innerHTML);
          sign.beatHeight = parseInt(elem.getElementsByTagName("laban:duration")[0].innerHTML);
          sign.resizable = true;
        } else if (elem.nodeName == "laban:roomDirection") { // room directions
          sign.baseType = "RoomDirectionSign";
          sign.signType = "RoomDirectionSign";
          sign.side = "left";
          sign.bar = parseInt(elem.getElementsByTagName("laban:measure")[0].innerHTML);
          sign.beat = parseInt(elem.getElementsByTagName("laban:beat")[0].innerHTML);
          sign.beatHeight = 1;
          sign.degree = parseInt(elem.getElementsByTagName("laban:horizontal")[0].innerHTML);
          sign.col = -state["columnsLeft"] - 1;
          sign.resizable = false;
        } else if (elem.nodeName == "laban:relationship") { // relationship bows
          sign.baseType = "RelationshipBow";
          sign.signType = elem.getElementsByTagName("laban:type")[0].innerHTML;
          sign.col = parseInt(elem.getElementsByTagName("laban:column")[0].innerHTML);
          sign.colRight = parseInt(elem.getElementsByTagName("laban:column")[1].innerHTML);
          if (sign.col < 0) {
            sign.side = "left";
          } else {
            sign.side = "right";
          }
          sign.bar = parseInt(elem.getElementsByTagName("laban:measure")[0].innerHTML);
          sign.beat = parseInt(elem.getElementsByTagName("laban:beat")[0].innerHTML);
          sign.beatHeight = 1;
          sign.grasping = ("true" === elem.getElementsByTagName("laban:grasping")[0].innerHTML);
          sign.holding = ("true" === elem.getElementsByTagName("laban:hold")[0].innerHTML);
          sign.passing = ("true" === elem.getElementsByTagName("laban:passing")[0].innerHTML);
          sign.resizable = true;
          if (sign.signType == "address") {
            
            if (elem.getElementsByTagName("laban:active")[0].innerHTML === "true") {
              if (elem.getElementsByTagName("laban:active")[1].innerHTML === "true") {
                sign.addressing = "both";
              } else {
                
                sign.addressing = "right";
              }
            } else {
              sign.addressing = "left";
            }
          }
        } else { //normal movements
          sign.bar = parseInt(elem.getElementsByTagName("laban:measure")[0].innerHTML);
          sign.beat = parseInt(elem.getElementsByTagName("laban:beat")[0].innerHTML);
          sign.beatHeight = parseInt(elem.getElementsByTagName("laban:duration")[0].innerHTML);
          sign.col = parseInt(elem.getElementsByTagName("laban:column")[0].innerHTML);
          if (sign.col < 0) {
            sign.side = "left";
          } else {
            sign.side = "right";
          }
          sign.holding = ("true" === elem.getElementsByTagName("laban:hold")[0].innerHTML);
          if (elem.getElementsByTagName("laban:space").length > 0) { // space measurement signs
            sign.baseType = "SpaceMeasurementSign";
            let innerElem = elem.getElementsByTagName("laban:space")[0];
            let type = innerElem.getElementsByTagName("laban:type")[0].innerHTML;
            if (type == "none") {
              sign.signType = "NeitherOr";
            } else {
              sign.signType = type.charAt(0).toUpperCase() + type.slice(1);
            }
            sign.degree = parseInt(innerElem.getElementsByTagName("laban:degree")[0].innerHTML);
            sign.resizable = true;
          } else if (elem.getElementsByTagName("laban:turn").length > 0) { // turn signs
            sign.baseType = "TurnSign";
            sign.signType = elem.getElementsByTagName("laban:direction")[0].innerHTML;
            sign.definition = false;
            let definition = {};
            if (elem.getElementsByTagName("laban:quantitative").length > 0) {
              definition.baseType = "Pin";
              let type = elem.getElementsByTagName("laban:vertical")[0].innerHTML;
              definition.signType = type.charAt(0).toUpperCase() + type.slice(1);
              definition.degree = parseInt(elem.getElementsByTagName("laban:horizontal")[0].innerHTML);
              sign.definition = definition;
            } else if (elem.getElementsByTagName("laban:qualitative").length > 0) {
              definition.baseType = "SpaceMeasurementSign";
              let type = elem.getElementsByTagName("laban:type")[0].innerHTML;
              if (type == "none") {
                definition.signType = "NeitherOr";
              } else {
                definition.signType = type.charAt(0).toUpperCase() + type.slice(1);
              }
              definition.degree = parseInt(elem.getElementsByTagName("laban:degree")[1].innerHTML);
              sign.definition = definition;
            }
            sign.resizable = true;
          } else if (elem.getElementsByTagName("laban:vibration").length > 0) { // vibration signs
            sign.baseType = "VibrationSign";
            sign.signType = "VibrationSign";
            let lowerPinType = elem.getElementsByTagName("laban:vertical")[0].innerHTML;
            sign.lowerPin = {};
            sign.lowerPin.signType = lowerPinType.charAt(0).toUpperCase() + lowerPinType.slice(1);
            sign.lowerPin.degree = parseInt(elem.getElementsByTagName("laban:horizontal")[0].innerHTML);
            let upperPinType = elem.getElementsByTagName("laban:vertical")[1].innerHTML;
            sign.upperPin = {};
            sign.upperPin.signType = upperPinType.charAt(0).toUpperCase() + upperPinType.slice(1);
            sign.upperPin.degree = parseInt(elem.getElementsByTagName("laban:horizontal")[1].innerHTML);
            sign.resizable = true;
          } else if (elem.getElementsByTagName("laban:cancellation").length > 0) { // cancel signs
            sign.baseType = "Cancel";
            sign.signType = elem.getElementsByTagName("laban:cancel")[0].innerHTML;
            sign.resizable = false;
          } else if (elem.getElementsByTagName("laban:direction").length > 0) { // direction signs
            sign.baseType = "DirectionSign";
            sign.signType = elem.getElementsByTagName("laban:horizontal")[0].innerHTML;
            let dimension = elem.getElementsByTagName("laban:vertical")[0].innerHTML;
            sign.dimension = dimension.charAt(0).toUpperCase() + dimension.slice(1);
            if (elem.getElementsByTagName("laban:modificationPin").length > 0) {
              let mod = elem.getElementsByTagName("laban:modificationPin")[0];
              let vert = mod.getElementsByTagName("laban:vertical")[0].innerHTML;
              sign.definition = {};
              sign.definition.signType = vert.charAt(0).toUpperCase() + vert.slice(1);
              sign.definition.degree = parseInt(mod.getElementsByTagName("laban:horizontal")[0].innerHTML);
            } else {
              sign.definition = false;
            }
            if (elem.getElementsByTagName("laban:relationshipPin").length > 0) {
              let pos = elem.getElementsByTagName("laban:relationshipPin")[0];
              if (parseInt(pos.getElementsByTagName("laban:horizontal")[0].innerHTML) == 0) {
                sign.position = "Infront";
              } else {
                sign.position = "Behind";
              }
            } else {
              sign.position = false;
            }
            sign.resizable = true;
          }
        }
        // check if there are enough columns
        if (sign.col < -state["columnsLeft"] && sign.baseType != "RoomDirectionSign") {
          state["columnsLeft"] = Math.abs(sign.col);
        } else if (sign.col >= state["columnsRight"] - 1 && sign.baseType != "PathSign") {
          state["columnsRight"] = sign.col + 1;
        }
        // check if there are enough beats per bar
        if (sign.beat >= state["beatsPerBar"]) {
          state["beatsPerBar"] = sign.beat + 1;
        }
        // check if there are enough bars
        if (sign.bar > state["bars"]) {
          state["bars"] = sign.bar;
        } 
        // check if a sign is in an existing bar but going into a new one
        if (sign.bar + Math.floor((sign.beatHeight + sign.beat - 1) / state["beatsPerBar"]) > state["bars"]) {
          state["bars"] = sign.bar + Math.floor((sign.beatHeight + sign.beat - 1) / state["beatsPerBar"] );
        }
        state["signs"].push(sign);
      }

      //adjust xml score bars if the value is incorrect
      if (state["bars"] != parseInt(xml.getElementsByTagName("laban:measures")[0].innerHTML)) {
        state["signsXML"].getElementsByTagName("laban:measures")[0].innerHTML = state["bars"];
      }
      for (let elem of state["signs"]) {
        if (elem.baseType == "PathSign" && elem.col < state["columnsRight"]) {
          state["signs"][state["signs"].indexOf(elem)].col = state["columnsRight"];
        } else if (elem.baseType == "RoomDirectionSign" && elem.col >= state["columnsLeft"]) {
          elem.col == -state["columnsLeft"] - 1;
        }
      }
    },
    saveScoreToLocalStorage (state) {
      let xmlString = new XMLSerializer().serializeToString(state["signsXML"]);
      localStorage.setItem("score", xmlString);
    },
    addToStack (state) {
      //clear redo stack
      state["redoStack"] = [];
      const signsXMLString = new XMLSerializer().serializeToString(state["signsXML"]);
      const curState = JSON.stringify({
        author: state["author"], 
        bars: state["bars"], 
        beatDuration: state["beatDuration"], 
        beatsPerBar: state["beatsPerBar"], 
        columnsLeft: state["columnsLeft"], 
        columnsRight: state["columnsRight"],
        description: state["description"],
        signs: state["signs"],
        selectedSigns: [],
        contextActive: false,
        signsXML: signsXMLString,
        timeUnit: state["timeUnit"],
        title: state["title"]
      });
      state["undoStack"].push(curState);
      if (state["undoStack"].length > 50) {
        state["undoStack"].slice(1);
      }
    },
    clearStack (state) {
      state["redoStack"] = [];
      state["undoStack"] = [];
    },
    undo (state) {
      if (state["undoStack"].length > 1) {
        const curState = state["undoStack"].pop();
        const newState = state["undoStack"][state["undoStack"].length - 1];
        state["redoStack"].push(curState);
        for (const [key, value] of Object.entries(JSON.parse(newState))) {
          if (key != "signsXML") {
            state[key] = value;
          } else {
            const parser = new DOMParser();
            let xml = parser.parseFromString(value,"text/xml");
            state[key] = xml;
          }
        }
        //pop undostack, push to redostack
        //parse json from undostack and loop into state
      }
    },
    redo (state) {
      if (state["redoStack"].length > 0) {
        const curState = state["redoStack"].pop();
        state["undoStack"].push(curState);
        const newState = state["undoStack"][state["undoStack"].length - 1];
        for (const [key, value] of Object.entries(JSON.parse(newState))) {
          if (key != "signsXML") {
            state[key] = value;
          } else {
            const parser = new DOMParser();
            let xml = parser.parseFromString(value,"text/xml");
            state[key] = xml;
          }
        }
      }
    }
  },
  // vue actions call vue mutations
  actions: {
    addColumn (context, side) {
      let data = {side: side, number: 1};
      context.commit('setColumns', data);
    },
    removeColumn (context, side) {
      let data = {side: side, number: -1};
      context.commit('setColumns', data);
    },
    addBar (context) {
      let number = 1;
      context.commit('setBars', number);
    },
    removeBar (context) {
      let number = -1;
      context.commit('setBars', number);
    },
    setSelectedBar (context, index) {
      context.commit("setSelectedBar", index);
    },
    setGhostOverCanvas (context, bool) {
      context.commit("setGhostOverCanvas", bool);
    },
    setGhostPos (context, obj) {
      context.commit("setGhostPos", obj);
    },
    setGhostActive (context, bool) {
      context.commit("setGhostActive", bool);
    },
    setInteracting (context, bool) {
      context.commit("setInteracting", bool);
    },
    setSelectedColumn (context, index) {
      context.commit("setSelectedColumn", index);
    },
    changeCurSign (context, sign) {
      if (sign != false) {
        context.commit('setCurSign', sign);
      } else {
        context.commit('removeCurSign');
      }
    },
    editSigns (context, obj) {
      if (obj.type == "add") {
        context.commit("addSignToObj", obj.data);
        if (!("isShadow" in obj.data && obj.data.isShadow)) {
          context.commit("addSignToXML", {obj: obj.data, index: -1});
        }
      } else if (obj.type == "changeSignData") {
        context.commit("changeSignData", {index: obj.index, data: obj.data});
        context.commit("deleteSignFromXML", obj.index);
        if (!("isShadow" in obj.data && obj.data.isShadow)) {
          context.commit("addSignToXML", {obj: false, index: obj.index});
        }
      } else if (obj.type == "delete") {
        context.commit("deleteSignFromXML", obj.index);
        context.commit("deleteSignFromObj", obj.index);
        context.commit("clearSelectedSigns");
      }
      context.commit("saveScoreToLocalStorage");
    },
    editScoreParameters(context, data) {
      context.commit("editScoreParameters", data);
      context.commit("saveScoreToLocalStorage");
    },
    clearSelectedSigns (context) {
      context.commit("clearSelectedSigns");
    },
    addToSelectedSigns (context, index) {
      context.commit("addToSelectedSigns", index);
    },
    removeFromSelectedSigns (context, index) {
      context.commit("removeFromSelectedSigns", index);
    },
    clearGridSelect (context) {
      context.commit("clearGridSelect");
    },
    addToGridSelect (context, obj) {
      context.commit("addToGridSelect", obj);
    },
    changeContextMenu (context, bool) {
      context.commit("setContextMenu", bool);
    },
    toggleMultiSelect(context) {
      context.commit("toggleMultiSelect");
    },
    toggleDuplicateSignActive (context) {
      context.commit("toggleDuplicateSignActive");
    },
    newScore (context, template) {
      if (template) { 
        context.commit("loadScoreFromTemplate", template);
      } else {
        if (localStorage.getItem("score")) {
          context.commit("loadScoreFromTemplate", "local-storage");
        } else {
          context.commit("loadScoreFromTemplate", "blank-score");
        }
      }
      if (template != "intro-score") {
        context.commit("saveScoreToLocalStorage");
      }
    },
    openScore (context, xml) {
      context.commit("loadScoreFromTemplate", {file: xml});
      context.commit("clearGridSelect");
      context.commit("saveScoreToLocalStorage");
    },
    changeSettings(context, data) {
      context.commit("setSettings", data);
    },
    saveStateInHistory (context) {
      context.commit("addToStack");
    },
    clearHistory(context) {
      context.commit("clearStack");
    },
    undoChanges(context) {
      context.commit("undo");
      context.commit("clearSelectedSigns");
      context.commit("setSelectedBar", false);
      context.commit("setSelectedColumn", false);
      context.commit("clearGridSelect");
      context.commit("saveScoreToLocalStorage");
    },
    redoChanges(context) {
      context.commit("redo");
      context.commit("clearSelectedSigns");
      context.commit("setSelectedBar", false);
      context.commit("setSelectedColumn", false);
      context.commit("clearGridSelect");
      context.commit("saveScoreToLocalStorage");
    },
    setIsPhone (context, bool) {
      context.commit("setIsPhone", bool);
    },
    setIsTablet (context, bool) {
      context.commit("setIsTablet", bool);
    },
    setCloudAlert (context, str) {
      context.commit("setCloudAlert", str);
    }
  },
})