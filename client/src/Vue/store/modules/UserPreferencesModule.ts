import { createModule } from 'direct-vuex'
import Language from '@shared/models/Language'
import axios from 'axios'
import {moduleActionContext} from '@/Vue/store'
import UserProfileMessage from '@shared/models/network/UserProfileMessage'

const userPreferencesModule = createModule({
	namespaced: true,
	state: {
		selectedLanguage: 'en' as Language
	},

	mutations: {
		setSelectedLanguage(state, language: Language): void {
			state.selectedLanguage = language
		}
	},

	getters: {

	},

	actions: {
		async fetchPreferences(context): Promise<void> {
			const { commit } = moduleActionContext(context, userPreferencesModule)
			const response = await axios.get('/api/user/profile')
			const profileMessage = response.data.data as UserProfileMessage

			commit.setSelectedLanguage(profileMessage.userLanguage)
		},
	}
})

export default userPreferencesModule
