import { v4 as uuidv4 } from 'uuid'
import {createModule} from 'direct-vuex'
import {moduleActionContext} from '@/Vue/store'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'

interface EventLogEntryGroup {
	id: string,
	entries: EventLogEntryMessage[]
}

const GameLogModule = createModule({
	namespaced: true,
	state: {
		entryGroups: [] as EventLogEntryGroup[]
	},

	mutations: {
		addEntryGroup(state, entries: EventLogEntryMessage[]): void {
			state.entryGroups.push({
				id: uuidv4(),
				entries: entries
			})
		},

		clearLog(state): void {
			state.entryGroups = []
		}
	},

	actions: {
		addEntryGroup(context, payload: { entries: EventLogEntryMessage[] }): void {
			const { commit } = moduleActionContext(context, GameLogModule)
			commit.addEntryGroup(payload.entries)
		},

		clearLog(context): void {
			const { commit } = moduleActionContext(context, GameLogModule)
			commit.clearLog()
		}
	}
})

export default GameLogModule
