import { createStore } from 'vuex'

export default createStore({
  state: {
    collumnsLeft: 3,
    collumnsRight: 3,
    bars: 2,
    beatsPerBar: 4,
  },
  mutations: {
    setCurVillager(state, data) {
      
      let newCurVillager;
      newCurVillager = {
        vName: data.name["name-EUde"],
        personality: data.personality,
        gender: data.gender,
        birthday: data.birthday,
        image_uri: data.image_uri,
        catchPhrase: data["catch-phrase"],
      };
      state["curVillager"] = newCurVillager;
    }
  },
  actions: {
    getCurrentVillagerFromAPI (context, id) {
      fetch(`http://acnhapi.com/v1/villagers/${id}`)
      .then(response=>response.json())
      .then(data=>{
        context.commit('setCurVillager', data);
      })
    },

  },
  modules: {
  }
})
