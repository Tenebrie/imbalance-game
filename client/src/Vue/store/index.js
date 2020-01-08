import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore } from 'direct-vuex';
Vue.use(Vuex);
const { store, rootActionContext, moduleActionContext } = createDirectStore({
    state: {
        isLoggedIn: false,
        player: null,
        selectedGameId: ''
    },
    mutations: {
        setPlayerData(state, { player }) {
            state.isLoggedIn = true;
            state.player = player;
        },
        resetPlayerData(state) {
            state.isLoggedIn = false;
            state.player = null;
        },
        setSelectedGameId(state, gameId) {
            state.selectedGameId = gameId;
        }
    },
    getters: {
        player: (state) => {
            if (!state.player) {
                throw new Error('Player is not available!');
            }
            return state.player;
        }
    }
});
// Export the direct-store instead of the classic Vuex store.
export default store;
// The following exports will be used to enable types in the
// implementation of actions.
export { rootActionContext, moduleActionContext };
//# sourceMappingURL=index.js.map