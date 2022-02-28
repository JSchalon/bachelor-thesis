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
    signs: [{}],
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
    }
  },
  modules: {
  }
})