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
      {isSelected: false, canResize: true, height: 50, x: 100, y: 350, signData: {baseType: "SpaceMeasurementSign", signType: "Narrow", degree: 1, side: "left", col: -3, bar: 1, beat: 0, resizable: true, holding: true}},
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