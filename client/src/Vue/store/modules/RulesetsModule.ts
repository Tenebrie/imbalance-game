import { defineModule } from 'direct-vuex'
import axios from 'axios'
import { moduleActionContext } from '@/Vue/store'
import RulesetRefMessage from '@shared/models/network/ruleset/RulesetRefMessage'
import GameMode from '@shared/enums/GameMode'

const rulesetsModule = defineModule({
	namespaced: true,

	state: {
		pvpRulesets: [] as RulesetRefMessage[],
		pveRulesets: [] as RulesetRefMessage[],
		campaignRulesets: [] as RulesetRefMessage[],
	},

	mutations: {
		setRulesetsPVP(state, value: RulesetRefMessage[]): void {
			state.pvpRulesets = value.slice()
		},

		setRulesetsPVE(state, value: RulesetRefMessage[]): void {
			state.pveRulesets = value.slice()
		},

		setRulesetsCampaign(state, value: RulesetRefMessage[]): void {
			state.campaignRulesets = value.slice()
		},
	},

	actions: {
		async loadLibrary(context): Promise<void> {
			const { commit } = moduleActionContext(context, rulesetsModule)

			const response = await axios.get('/api/rulesets')
			const messages = response.data as RulesetRefMessage[]
			commit.setRulesetsPVP(messages.filter((message) => message.gameMode === GameMode.PVP))
			commit.setRulesetsPVE(messages.filter((message) => message.gameMode === GameMode.PVE))
		},
	},
})

export default rulesetsModule
