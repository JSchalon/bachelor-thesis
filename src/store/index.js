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
    signs: [
      {isSelected: false, height: 0, x: 0, y: 0, purpose: "dummy sign", signData: {baseType: "GenericSign", signType: "In place"}},
      {canResize: true, height: 100, isSelected: false, signData: {bar: 0, baseType: "DirectionSign", beat: 0, col: -1, dimension: "Middle", holding: false, resizable: true, side: "left", signType: "In place"}, width: 40, x: 260, y: 405},
      {canResize: true, height: 100, isSelected: false, signData: {bar: 0, baseType: "DirectionSign", beat: 0, col: 0, dimension: "Middle", holding: false, resizable: true, side: "right", signType: "In place"}, width: 40, x: 340, y: 405},
      {canResize: true, height: 50, isSelected: false, signData: {bar: 1, baseType: "DirectionSign", beat: 3, col: 0, dimension: "Middle", holding: true, resizable: true, side: "right", signType: "Forward direction"}, width: 40, x: 340, y: 200},
      {canResize: true, height: 150, isSelected: false, signData: {bar: 0, baseType: "DirectionSign", beat: 0, col: -1, dimension: "Middle", holding: true, position: "Behind", resizable: true, side: "left", signType: "Right direction"}, width: 40, x: 260, y: 250},
      {canResize: true, height: 50, isSelected: false, signData: {bar: 0, baseType: "RoomDirectionSign", beat: 0, col: -4, degree: 0, resizable: false, side: "left", signType: "RoomDirectionSign"}, width: 40, x: 20, y: 455},
      {canResize: true, height: 50, isSelected: false, signData: {bar: 1, baseType: "RoomDirectionSign", beat: 3, col: -4, degree: 45, resizable: false, side: "left", signType: "RoomDirectionSign"}, width: 40, x: 20, y: 200},
      {canResize: true, height: 40, isSelected: false, signData: {bar: -1, baseType: "BodyPartSign", beat: 0, col: 2, digit: false, joint: false, limb: true, resizable: false, side: "right", signType: "Hand", surface: false}, width: 40, x: 500, y: 505},
      {canResize: true, height: 200, isSelected: false, signData: {bar: 1, baseType: "VibrationSign", beat: 0, col: 2, firstPin: {degree: 0, signType: "High"}, resizable: true, secondPin: {degree: 0, signType: "Low"}, side: "right", signType: "VibrationSign"}, width: 40, x: 500, y: 200},
      {canResize: true, height: 40, isSelected: false, signData: {bar: -1, baseType: "BodyPartSign", beat: 0, col: -2, digit: false, joint: false, limb: false, resizable: false, side: "left", signType: "Hip", surface: false}, width: 40, x: 180, y: 505},
      {canResize: true, height: 200, isSelected: false, signData: {bar: 2, baseType: "SpaceMeasurementSign", beat: 0, col: -2, degree: 2, holding: false, resizable: true, side: "left", signType: "Folding"}, width: 40, x: 180, y: 0},
    ],
    libraryActive: true,
    //editor settings
    seenIntro: false, 
    language: "eng", 
    showHelpLines: true,
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
    },
    setCurSign(state, data) {
      state["curSign"] = data;
    },
    removeCurSign (state) {
      state["curSign"] = false;
    },
    addSign(state, data) {
      state["signs"].push(data);
    },
    moveSign (state, obj) {
      const index = obj.index;
      const data = obj.data;
      state["signs"][index].x = data.x;
      state["signs"][index].y = data.y;
    },
    resizeSign (state, obj) {
      const index = obj.index;
      const data = obj.data;
      if (data.height && data.height >= 0 ) {
        state["signs"][index].height = data.height;
      } else if (data.width) {
        state["signs"][index].width = data.width;
      }
    },
    changeSelect (state, obj) {
      const index = obj.index;
      const data = obj.data;
      state["signs"][index].isSelected = data.isSelected;
    },
    changeCanResize (state, obj) {
      const index = obj.index;
      const data = obj.data;
      state["signs"][index].canResize = data.canResize;
    },
    changeSignData (state, obj) {
      const index = obj.index;
      const signData = obj.data;
      for (const [key, value] of Object.entries(signData)) {
        state["signs"][index].signData[key] = value;
      }
    },
    deleteSign(state, index) {
      state["signs"].splice(index, 1);
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
    editSign (context, obj) {
      if (obj.type == "add") {
        context.commit("addSign", obj.data);
        context.commit('removeCurSign');
      } else if (obj.type == "move") {
        context.commit("moveSign", {index: obj.index, data: obj.data});
      } else if (obj.type == "resize") {
        context.commit("resizeSign", {index: obj.index, data: obj.data});
      } else if (obj.type == "changeSelection") {
        context.commit("changeSelect", {index: obj.index, data: obj.data});
      } else if (obj.type == "changeCanResize") {
        context.commit("changeCanResize", {index: obj.index, data: obj.data});
      } else if (obj.type == "changeSignData") {
        context.commit("changeSignData", {index: obj.index, data: obj.data});
      } else if (obj.type == "delete") {
        context.commit("deleteSign", obj.index);
      }
    }
  },
  modules: {
  }
})