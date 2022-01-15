import Language from '@shared/enums/Language'
import { RulesetObjective, RulesetObjectiveLocalizationEntry } from '@shared/models/ruleset/RulesetObjectiveLocalization'
import { createDirectStore, defineModule } from 'direct-vuex'

import globalStore from './index'

const { store, rootActionContext } = createDirectStore({
	modules: {
		_: defineModule({}),
	},

	state: {
		objective: null as RulesetObjective | null,
		popupVisible: false as boolean,
	},

	mutations: {
		show(state): void {
			state.popupVisible = true
		},

		hide(state): void {
			state.popupVisible = false
		},

		setObjective(state, objective: RulesetObjective | null): void {
			state.objective = objective
		},

		clearObjective(state): void {
			state.objective = null
			state.popupVisible = false
		},
	},

	getters: {
		current: (state): RulesetObjectiveLocalizationEntry | null => {
			const objective = state.objective
			if (objective === null) {
				return null
			}
			const language = globalStore.state.userPreferencesModule.userLanguage
			return objective[language] || objective[Language.English]
		},
	},

	actions: {
		clear(context): void {
			const { commit } = rootActionContext(context)
			commit.clearObjective()
		},
	},
})

export default store
