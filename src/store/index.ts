/* eslint-disable */
import { createStore } from "vuex";
import { GroupManagerConfig } from "@/assets/types"
import { WordleAnimator } from "@/assets/animator"
interface State {
  groups: Array<GroupManagerConfig>
}

export default createStore({
  state: {
    groups: [],
  },
  getters: {
    groups (state) {
      return state.groups
    }
  },
  mutations: {
    updateGroups(state: State, payload: {idx: number, group: GroupManagerConfig}) {
      state.groups[payload.idx] = payload.group
    }
  },
  actions: {
    // incrementCounter ({ commit, state }, increment) {
    //   commit('SET_COUNTER', state.counter + increment)
    // }
  },
  modules: {}
});
