import axios from 'axios'
import {defineModule} from 'direct-vuex'
import Language from '@shared/enums/Language'
import {moduleActionContext} from '@/Vue/store'
import RenderQuality from '@shared/enums/RenderQuality'
import UserProfileMessage from '@shared/models/network/UserProfileMessage'
import {debounce} from 'throttle-debounce'
import AudioSystem from '@/Pixi/audio/AudioSystem'

const userPreferencesModule = defineModule({
	namespaced: true,
	state: {
		userLanguage: 'en' as Language,
		renderQuality: RenderQuality.DEFAULT as RenderQuality,
		masterVolume: 1.00 as number,
		musicVolume: 0.50 as number,
		effectsVolume: 0.50 as number,
		ambienceVolume: 0.50 as number,
		userInterfaceVolume: 0.50 as number,
		welcomeModalSeenAt: null as Date | null,
		mobileModalSeenAt: null as Date | null,
	},

	mutations: {
		setUserLanguage(state, language: Language): void {
			state.userLanguage = language
		},

		setRenderQuality(state, quality: RenderQuality): void {
			state.renderQuality = quality
		},

		setMasterVolume(state, volume: number): void {
			state.masterVolume = volume
		},
		setMusicVolume(state, volume: number): void {
			state.musicVolume = volume
		},
		setEffectsVolume(state, volume: number): void {
			state.effectsVolume = volume
		},
		setAmbienceVolume(state, volume: number): void {
			state.ambienceVolume = volume
		},
		setUserInterfaceVolume(state, volume: number): void {
			state.userInterfaceVolume = volume
		},

		setWelcomeModalSeenAt(state, timestamp: string): void {
			state.welcomeModalSeenAt = timestamp ? new Date(timestamp) : null
		},
		setMobileModalSeenAt(state, timestamp: string): void {
			state.mobileModalSeenAt = timestamp ? new Date(timestamp) : null
		}
	},

	getters: {

	},

	actions: {
		async fetchPreferences(context): Promise<void> {
			const { commit } = moduleActionContext(context, userPreferencesModule)
			const response = await axios.get('/api/user/profile')
			const profileMessage = response.data.data as UserProfileMessage

			commit.setUserLanguage(profileMessage.userLanguage)
			commit.setRenderQuality(profileMessage.renderQuality)
			commit.setMasterVolume(profileMessage.masterVolume)
			commit.setMusicVolume(profileMessage.musicVolume)
			commit.setEffectsVolume(profileMessage.effectsVolume)
			commit.setAmbienceVolume(profileMessage.ambienceVolume)
			commit.setUserInterfaceVolume(profileMessage.userInterfaceVolume)
			commit.setWelcomeModalSeenAt(profileMessage.welcomeModalSeenAt)
			commit.setMobileModalSeenAt(profileMessage.mobileModalSeenAt)
		},

		savePreferencesDebounced: debounce(1000, async (context) => {
			const { state } = moduleActionContext(context, userPreferencesModule)
			await axios.put('/api/user/profile', {
				userLanguage: state.userLanguage,
				renderQuality: state.renderQuality,
				masterVolume: state.masterVolume,
				musicVolume: state.musicVolume,
				effectsVolume: state.effectsVolume,
				ambienceVolume: state.ambienceVolume,
				userInterfaceVolume: state.userInterfaceVolume,
			})
		}),

		async savePreferences(context): Promise<void> {
			const { dispatch } = moduleActionContext(context, userPreferencesModule)
			const savePreferencesDebounced = dispatch.savePreferencesDebounced as (context) => Promise<void>
			await savePreferencesDebounced(context)
			AudioSystem.updateVolumeLevels()
		},

		async markWelcomeModalAsSeen(context): Promise<void> {
			const { commit } = moduleActionContext(context, userPreferencesModule)
			await axios.post('/api/user/modals/welcome')
			commit.setWelcomeModalSeenAt(String(new Date().getTime()))
		},

		async markMobileModalAsSeen(context): Promise<void> {
			const { commit } = moduleActionContext(context, userPreferencesModule)
			await axios.post('/api/user/modals/mobile')
			commit.setMobileModalSeenAt(String(new Date().getTime()))
		}
	}
})

export default userPreferencesModule
