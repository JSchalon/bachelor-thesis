import { createStore } from 'vuex'

export default createStore({
  state: {
    //score properties
    columnsLeft: 3,
    columnsRight: 3,
    bars: 2,
    beatsPerBar: 4,
    author: "Jebb",
    title: "Jebb",
    description: "Jebb",
    timeUnit: "second",
    beatDuration: 1,
    //sign data
    curSign: false,
    selectedSigns: [],
    contextActive: false,
    multiselectActive: false, 
    signs: [
      {baseType: "GenericSign", signType: "In place", isSelected: false},
    ],
    signsXML: null,
    libraryActive: true,
    //editor settings
    seenIntro: false, 
    language: "eng", 
    showHelpLines: true,
    //converters, used for converting body part signs between js-obj and xml
    limbNames: {Head: "neck", Shoulder: "arm", Elbow: "upper_arm", Wrist: "lower_arm", Hip: "leg", Knee: "thigh", Ankle: "lower_leg"},
    fingerNames: ["thumb","indexFinger","middleFinger","ringFinger","littleFinger"],
    toeNames: ["bigToe","longToe","middleToe","ringToe","littleToe"],
    xmlParts: ["Head", "Chest", "Waist", "Pelvis", "Torso"],
    undoStack: [],
    redoStack: [],
  },
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
    setCurSign(state, data) {
      state["curSign"] = data;
    },
    removeCurSign (state) {
      state["curSign"] = false;
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
      state["selectedSigns"].splice(state["selectedSigns"].indexOf(index));
      state["signs"][index].isSelected = false;
    },
    changeContextMenu (state, bool) {
      state["contextActive"] = bool;
    },
    toggleMultiSelect (state) {
      state["multiselectActive"] = !state["multiselectActive"];
    },
    addSignToObj(state, data) {
      state["signs"].push(data);
    },
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
      let signWrapper = null;
      let container = null;
      let innerContainer = null;
      let valueContainer = null;
      if (data.bar == -1) { // bar == -1 -> column definition
        signWrapper = state["signsXML"].createElement("laban:columnDefinition");
        container = state["signsXML"].getElementsByTagName("laban:columns")[0];
        valueContainer = state["signsXML"].createElement("laban:index");
        valueContainer.innerHTML = data.col;
        signWrapper.appendChild(valueContainer);
        innerContainer = state["signsXML"].createElement("laban:preSign");
        let signContainer = null;
        if (data.baseType == "BodyPartSign") {
          signContainer = state["signsXML"].createElement("laban:bodyPart");
          let partType = null;
          if (data.surface != false) {
            //surface -> limb (limb type), surface: string: inner, outer, ...
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
          } else if (data.limb && data.canBeLimb) {
            partType = state["signsXML"].createElement("laban:limb");
            let defa = state["signsXML"].createElement("laban:default");
            valueContainer = state["signsXML"].createElement("laban:limb");
            valueContainer.innerHTML = state["limbNames"][data.signType];
            defa.appendChild(valueContainer);
            partType.appendChild(defa);
          } else if ((data.digit !== false) && data.digit >= 0) {
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
          } else if (data.canBeLimb || !(data.signType in state["xmlParts"])) {
            partType = state["signsXML"].createElement("laban:joint");
            valueContainer = state["signsXML"].createElement("laban:joint");
            valueContainer.innerHTML = data.signType.toLowerCase();
            partType.appendChild(valueContainer);
          } else {
            partType = state["signsXML"].createElement("laban:part");
            partType.innerHTML = data.signType.toLowerCase();
          }
          signContainer.appendChild(partType);
          valueContainer = state["signsXML"].createElement("laban:side");
          if (partType.nodeName == "laban:part") {
            valueContainer.innerHTML = "none";
          } else {
            valueContainer.innerHTML = data.side;
          }
          signContainer.appendChild(valueContainer);
        } else {
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

          let bar = state["signsXML"].createElement("laban:measure");
          bar.innerHTML = data.bar;
          signWrapper.appendChild(bar);
          let beat = state["signsXML"].createElement("laban:beat");
          beat.innerHTML = data.beat + ".0";
          signWrapper.appendChild(beat);
          
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
          
          if (data.baseType == "SpaceMeasurementSign") {
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
          } else if (data.baseType == "TurnSign") {
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
          } else if (data.baseType == "VibrationSign") {
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
          } else if (data.baseType == "DirectionSign") {
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
          } else if (data.baseType == "Cancel") {
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
      state["language"] = data.language;
      state["showHelpLines"] = data.showHelpLines;
      state["seenIntro"] = data.seenIntro;
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
    loadScoreFromTemplate(state, template) {
      let data = require("@/assets/score-templates/blank-score.xml")
      if (!template || ((template == "local-storage" && !localStorage.getItem("score")))) {
        data = require("@/assets/score-templates/blank-score.xml")
      } else if (template == "local-storage" && localStorage.getItem("score")) {
        data = {};
        data.default = localStorage.getItem("score");
      } else {
        data = require("@/assets/score-templates/" + template + ".xml")
      }
      const parser = new DOMParser();
      let xml = parser.parseFromString(data.default,"text/xml");
      state["signsXML"] = xml;
      state["author"] = xml.getElementsByTagName("laban:author")[0].innerHTML;
      state["title"] = xml.getElementsByTagName("laban:title")[0].innerHTML;
      state["description"] = xml.getElementsByTagName("laban:description")[0].innerHTML;
      state["timeUnit"] = xml.getElementsByTagName("laban:timeUnit")[0].innerHTML;
      state["bars"] = parseInt(xml.getElementsByTagName("laban:measures")[0].innerHTML);
      state["beatDuration"] = parseInt(xml.getElementsByTagName("laban:beatDuration")[0].innerHTML);
      state["beatsPerBar"] = parseInt(xml.getElementsByTagName("laban:beats")[0].innerHTML);
      for (let elem of xml.getElementsByTagName("laban:columns")[0].children) {
        let sign = {baseType: "", signType: "", digit: false, joint: false, surface: false, limb: false, resizable: false, canBeLimb: false, isSelected: false};
        sign.col = parseInt(elem.getElementsByTagName("laban:index")[0].innerHTML);
        if (sign.col < -state["columnsLeft"]) {
          state["columnsLeft"] = Math.abs(sign.col);
        } else if (sign.col > state["columnsRight"]) {
          state["columnsRight"] = sign.col;
        }
        sign.bar = -1;
        sign.beat = 0;
        sign.beatHeight = 0.8;
        if (elem.getElementsByTagName("laban:preSign")[0].children[0].nodeName == "laban:bodyPart") {
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
          if (elemWrapper.nodeName == "laban:part") {
            if (elemWrapper.innerHTML == "head") {
              sign.canBeLimb = true;
            }
            sign.signType = elemWrapper.innerHTML.charAt(0).toUpperCase() + elemWrapper.innerHTML.slice(1);
          } else if (elemWrapper.nodeName == "laban:joint") {
            sign.signType = elemWrapper.children[0].innerHTML.charAt(0).toUpperCase() + elemWrapper.children[0].innerHTML.slice(1);
            if (sign.signType in state["limbNames"]) {
              sign.canBeLimb = true;
            }
          } else if (elemWrapper.nodeName == "laban:digit") {
            sign.digit = state["toeNames"].indexOf(elemWrapper.children[0].innerHTML);
            sign.signType = "Toes";
            if (sign.digit < 0) {
              sign.digit = state["fingerNames"].indexOf(elemWrapper.children[0].innerHTML);
              sign.signType = "Fingers";
            }
            sign.digit = sign.digit + 1;
            sign.joint = parseInt(elemWrapper.getElementsByTagName("laban:joint")[0].innerHTML);
          } else if (elemWrapper.nodeName == "laban:limb") {
            const limbName = elemWrapper.children[0].getElementsByTagName("laban:limb")[0].innerHTML;
            sign.limb = true;
            for (let [key, value] of Object.entries(state["limbNames"])) {
              if (value == limbName) {
                sign.signType = key;
              }
            }
          } else if (elemWrapper.nodeName == "laban:surface") {
            sign.limb = true;
            sign.surface = elemWrapper.getElementsByTagName("laban:side").innerHTML;
            const limbName = elemWrapper.children[0].getElementsByTagName("laban:limb")[0].innerHTML;
            for (let [key, value] of Object.entries(state["limbNames"])) {
              if (value == limbName) {
                sign.signType = key;
              }
            }
          }
        } else {
          sign.baseType = "PropSign";
          sign.signType = elem.getElementsByTagName("laban:name")[0].innerHTML;
        }
        state["signs"].push(sign);
      }
      for (let elem of xml.getElementsByTagName("laban:movements")[0].children) {
        let sign = {isSelected: false};
        if (elem.nodeName == "laban:path") {
          sign.baseType = "PathSign";
          sign.signType = elem.getElementsByTagName("laban:type")[0].innerHTML;
          sign.col = state["columnsRight"];
          sign.side = "right";
          sign.bar = parseInt(elem.getElementsByTagName("laban:measure")[0].innerHTML);
          sign.beat = parseInt(elem.getElementsByTagName("laban:beat")[0].innerHTML);
          sign.beatHeight = parseInt(elem.getElementsByTagName("laban:duration")[0].innerHTML);
          sign.resizable = true;
        } else if (elem.nodeName == "laban:roomDirection") {
          sign.baseType = "RoomDirectionSign";
          sign.signType = "RoomDirectionSign";
          sign.side = "left";
          sign.bar = parseInt(elem.getElementsByTagName("laban:measure")[0].innerHTML);
          sign.beat = parseInt(elem.getElementsByTagName("laban:beat")[0].innerHTML);
          sign.beatHeight = 1;
          sign.degree = parseInt(elem.getElementsByTagName("laban:horizontal")[0].innerHTML);
          sign.col = -state["columnsLeft"] - 1;
          sign.resizable = false;
        } else if (elem.nodeName == "laban:relationship") {
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
          if (elem.getElementsByTagName("laban:space").length > 0) {
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
          } else if (elem.getElementsByTagName("laban:turn").length > 0) {
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
          } else if (elem.getElementsByTagName("laban:vibration").length > 0) {
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
          } else if (elem.getElementsByTagName("laban:cancellation").length > 0) {
            sign.baseType = "Cancel";
            sign.signType = elem.getElementsByTagName("laban:cancel")[0].innerHTML;
            sign.resizable = false;
          } else if (elem.getElementsByTagName("laban:direction").length > 0) {
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
        if (sign.col < -state["columnsLeft"] && sign.baseType != "RoomDirectionSign") {
          state["columnsLeft"] = Math.abs(sign.col);
        } else if (sign.col > state["columnsRight"] - 1 && sign.baseType != "PathSign") {
          state["columnsRight"] = sign.col + 1;
        }
        if (sign.beat >= state["beatsPerBar"]) {
          state["beatsPerBar"] = sign.beat + 1;
        }
        if (sign.bar > state["bars"]) {
          state["bars"] = sign.bar;
        }
        state["signs"].push(sign);
      }
      console.log()
      for (let elem of state["signs"]) {
        if (elem.baseType == "PathSign" && elem.col < state["columnsRight"]) {
          elem.col == state["columnsRight"];
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
          context.commit('removeCurSign');
          context.commit("clearSelectedSigns");
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
    changeContextMenu (context, bool) {
      context.commit("changeContextMenu", bool);
    },
    toggleMultiSelect(context) {
      context.commit("toggleMultiSelect");
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
      context.commit("addToStack");
    },
    changeSettings(context, data) {
      context.commit("setSettings", data);
    },
    saveStateInHistory (context) {
      context.commit("addToStack");
    },
    undoChanges(context) {
      context.commit("undo");
      context.commit("clearSelectedSigns");
      context.commit("saveScoreToLocalStorage");
    },
    redoChanges(context) {
      context.commit("redo");
      context.commit("clearSelectedSigns");
      context.commit("saveScoreToLocalStorage");
    },
  },
  modules: {
  }
})