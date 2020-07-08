import axios from 'axios'
import { createModule } from 'direct-vuex'
import Language from '@shared/models/Language'
import {moduleActionContext} from '@/Vue/store'
import RenderQuality from '@shared/enums/RenderQuality'
import UserProfileMessage from '@shared/models/network/UserProfileMessage'

const userPreferencesModule = createModule({
	namespaced: true,
	state: {
		selectedLanguage: 'en' as Language,
		selectedQuality: RenderQuality.DEFAULT as RenderQuality
	},

	mutations: {
		setSelectedLanguage(state, language: Language): void {
			state.selectedLanguage = language
		},

		setSelectedQuality(state, quality: RenderQuality): void {
			state.selectedQuality = quality
		},
	},

	getters: {

	},

	actions: {
		async fetchPreferences(context): Promise<void> {
			const { commit } = moduleActionContext(context, userPreferencesModule)
			const response = await axios.get('/api/user/profile')
			const profileMessage = response.data.data as UserProfileMessage

			commit.setSelectedLanguage(profileMessage.userLanguage)
			commit.setSelectedQuality(profileMessage.renderQuality)
		},
	}
})

export default userPreferencesModule
