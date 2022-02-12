import { createStore } from 'vuex'

export default createStore({
  state: {
    //score properties
    collumnsLeft: 3,
    collumnsRight: 3,
    bars: 2,
    beatsPerBar: 4,
    //editor settings
    seenIntro: false, 
    language: "eng", 
    showHelpLines: true
  },
  mutations: {
    setCollumns (state, data) {
      if (data.side == "left") {
        state["collumnsLeft"] = state["collumnsLeft"] + data.number;
      } 
      if (data.side == "right") {
        state["collumnsRight"] = state["collumnsRight"] + data.number;
      }
    },
    setBars (state, number) {
      state["bars"] = state["bars"] + number;
    }
  },
  actions: {
    addCollumn (context, side) {
      let data = {side: side, number: 1};
      context.commit('setCollumns', data);
    },
    removeCollumn (context, side) {
      let data = {side: side, number: -1};
      context.commit('setCollumns', data);
    },
    addBar (context) {
      let number = 1;
      context.commit('setBars', number);
    },
    removeBar (context) {
      let number = -1;
      context.commit('setBars', number);
    },
  },
  modules: {
  }
})