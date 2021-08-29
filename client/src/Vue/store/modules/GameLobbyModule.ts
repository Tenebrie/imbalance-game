import HiddenPlayerMessage from '@shared/models/network/player/HiddenPlayerMessage'
import PlayersInLobbyMessage from '@shared/models/network/PlayersInLobbyMessage'
import { defineModule } from 'direct-vuex'

import { moduleActionContext } from '../index'

const gameStateModule = defineModule({
	namespaced: true,
	state: {
		players: [] as HiddenPlayerMessage[],
		openPlayerSlots: 0 as number,
		totalPlayerSlots: 0 as number,
	},

	mutations: {
		setPlayers(state, players: HiddenPlayerMessage[]): void {
			state.players = players
		},

		setSlotsCount(state, values: { open: number; total: number }): void {
			state.openPlayerSlots = values.open
			state.totalPlayerSlots = values.total
		},
	},

	actions: {
		setData(context, payload: PlayersInLobbyMessage): void {
			const { commit } = moduleActionContext(context, gameStateModule)
			commit.setPlayers(payload.players)
			commit.setSlotsCount({
				open: payload.slotsOpen,
				total: payload.slotsTotal,
			})
		},
	},
})

export default gameStateModule
