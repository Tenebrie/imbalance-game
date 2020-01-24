import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore, createModule } from 'direct-vuex';
import Core from '@/Pixi/Core';
Vue.use(Vuex);
const gameStateModule = createModule({
    namespaced: true,
    state: {
        isGameStarted: false,
        isPlayersTurn: false
    },
    mutations: {
        setIsGameStarted(state, isGameStarted) {
            state.isGameStarted = isGameStarted;
        },
        setIsPlayersTurn(state, isPlayersTurn) {
            state.isPlayersTurn = isPlayersTurn;
        }
    },
    actions: {
        startGame(context) {
            console.log(context);
            const { commit } = moduleActionContext(context, gameStateModule);
            commit.setIsGameStarted(true);
        },
        reset(context) {
            const { commit } = moduleActionContext(context, gameStateModule);
            commit.setIsGameStarted(false);
            commit.setIsPlayersTurn(false);
        }
    }
});
const { store, rootActionContext, moduleActionContext } = createDirectStore({
    modules: {
        gameStateModule: gameStateModule
    },
    state: {
        player: null,
        isLoggedIn: false,
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
        },
        resetSelectedGameId(state) {
            state.selectedGameId = '';
        }
    },
    getters: {
        player: (state) => {
            if (!state.player) {
                throw new Error('Player is not available!');
            }
            return state.player;
        }
    },
    actions: {
        leaveGame() {
            Core.socket.close(1000, 'Player disconnect');
        },
        onSocketClosed() {
            store.commit.resetSelectedGameId();
            store.dispatch.gameStateModule.reset();
        }
    }
});
// Export the direct-store instead of the classic Vuex store.
export default store;
// The following exports will be used to enable types in the
// implementation of actions.
export { rootActionContext, moduleActionContext };
//# sourceMappingURL=index.js.map