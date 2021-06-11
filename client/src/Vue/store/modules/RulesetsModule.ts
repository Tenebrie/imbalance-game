import { defineModule } from 'direct-vuex'
import axios from 'axios'
import { moduleActionContext } from '@/Vue/store'
import RulesetRefMessage from '@shared/models/network/ruleset/RulesetRefMessage'
import RulesetCategory from '@shared/enums/RulesetCategory'

const rulesetsModule = defineModule({
	namespaced: true,

	state: {
		pvpRulesets: [] as RulesetRefMessage[],
		pveRulesets: [] as RulesetRefMessage[],
		campaignRulesets: [] as RulesetRefMessage[],
		prototypeRulesets: [] as RulesetRefMessage[],
	},

	mutations: {
		setRulesetsPVP(state, value: RulesetRefMessage[]): void {
			state.pvpRulesets = value.sort((a, b) => a.sortPriority - b.sortPriority)
		},

		setRulesetsPVE(state, value: RulesetRefMessage[]): void {
			state.pveRulesets = value.sort((a, b) => a.sortPriority - b.sortPriority)
		},

		setRulesetsCampaign(state, value: RulesetRefMessage[]): void {
			state.campaignRulesets = value.sort((a, b) => a.sortPriority - b.sortPriority)
		},

		setRulesetsPrototype(state, value: RulesetRefMessage[]): void {
			state.prototypeRulesets = value.sort((a, b) => a.sortPriority - b.sortPriority)
		},
	},

	actions: {
		async loadLibrary(context): Promise<void> {
			const { commit } = moduleActionContext(context, rulesetsModule)

			const response = await axios.get('/api/rulesets')
			const messages = response.data as RulesetRefMessage[]
			commit.setRulesetsPVP(messages.filter((message) => message.category === RulesetCategory.PVP))
			commit.setRulesetsPVE(messages.filter((message) => message.category === RulesetCategory.PVE))
			commit.setRulesetsCampaign(messages.filter((message) => message.category === RulesetCategory.CAMPAIGN))
			commit.setRulesetsPrototype(messages.filter((message) => message.category === RulesetCategory.PROTOTYPES))
		},
	},
})

export default rulesetsModule
