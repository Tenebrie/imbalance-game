<template>
	<div class="the-user-profile">
		<div class="container">
			<user-avatar class="avatar" />
			<div class="section basic-info-section">
				<div class="info">
					<div class="info-field">
						<span class="label">{{ $locale.get('ui.profile.email') }}:</span>
						<span class="input">{{ email }}</span>
					</div>
					<div class="info-field" v-if="player && !isGuest">
						<span class="label">{{ $locale.get('ui.profile.changeUsername.label') }}:</span>
						<span class="input">
							<input type="text" v-model="username" :placeholder="currentUsername" />
							<button class="primary" @click="onChangeUsername">{{ $locale.get('ui.profile.changeUsername.button') }}</button>
						</span>
					</div>
					<div class="info-field" v-if="player && !isGuest">
						<span class="label">{{ $locale.get('ui.profile.changePassword.label') }}:</span>
						<span class="input">
							<input type="password" v-model="password" :placeholder="$locale.get('ui.profile.changePassword.placeholder')" />
							<button class="primary" @click="onChangePassword">{{ $locale.get('ui.profile.changePassword.button') }}</button>
						</span>
					</div>
				</div>
			</div>
			<div class="section">
				<!--	<div class="list language-list">-->
				<!--		<h3>{{ $locale.get('ui.profile.language.header') }}</h3>-->
				<!--		<div v-for="language in supportedLanguages" :key="language">-->
				<!--			<div class="language-list-content">-->
				<!--				<input :id="`language-list-item-${language}`" type="radio" name="language" :value="language" v-model="userLanguage" />-->
				<!--				<label :for="`language-list-item-${language}`">{{ $locale.get(`ui.language.${language}`) }}</label>-->
				<!--			</div>-->
				<!--		</div>-->
				<!--	</div>-->
				<div class="list render-quality-list">
					<h3>{{ $locale.get('ui.profile.quality.header') }}</h3>
					<div v-for="quality in supportedRenderQualities" :key="quality">
						<div class="render-quality-list-content">
							<input :id="`render-quality-list-item-${quality}`" type="radio" name="quality" :value="quality" v-model="renderQuality" />
							<label :for="`render-quality-list-item-${quality}`">{{ $locale.get(`ui.quality.${quality}`) }}</label>
						</div>
					</div>
				</div>
			</div>
			<div class="section">
				<the-gameplay-settings />
			</div>
			<div class="section">
				<the-volume-settings />
			</div>
			<div class="section button-section">
				<profile-logout-button />
				<profile-delete-user-button />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Language from '@shared/enums/Language'
import RenderQuality from '@shared/enums/RenderQuality'
import UserProfileMessage from '@shared/models/network/UserProfileMessage'
import Player from '@shared/models/Player'
import axios from 'axios'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'

import { supportedLanguages } from '@/Pixi/Localization'
import Notifications from '@/utils/Notifications'
import UserAvatar from '@/Vue/components/navigationbar/UserAvatar.vue'
import ProfileDeleteUserButton from '@/Vue/components/profile/ProfileDeleteUserButton.vue'
import ProfileLogoutButton from '@/Vue/components/profile/ProfileLogoutButton.vue'
import TheGameplaySettings from '@/Vue/components/profile/TheGameplaySettings.vue'
import TheVolumeSettings from '@/Vue/components/profile/TheVolumeSettings.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: {
		TheGameplaySettings,
		TheVolumeSettings,
		UserAvatar,
		ProfileLogoutButton,
		ProfileDeleteUserButton,
	},
	setup() {
		const email = ref<string>('')
		const username = ref<string>('')
		const password = ref<string>('')
		const currentUsername = ref<string>('')

		onMounted(async () => {
			const response = await axios.get('/api/user/profile')
			const profileMessage = response.data.data as UserProfileMessage

			email.value = profileMessage.email
			currentUsername.value = profileMessage.username
		})

		const userLanguage = computed<Language>({
			get() {
				return store.state.userPreferencesModule.userLanguage
			},
			set(value) {
				store.commit.userPreferencesModule.setUserLanguage(value)
				store.commit.editor.clearRenderedCards()
			},
		})

		const renderQuality = computed<RenderQuality>({
			get() {
				return store.state.userPreferencesModule.renderQuality
			},
			set(value) {
				store.commit.userPreferencesModule.setRenderQuality(value)
			},
		})

		const player = computed<Player | null>(() => store.state.player)
		const isGuest = computed<boolean>(() => !!store.state.player && store.state.player.isGuest)

		watch(
			() => [userLanguage.value, renderQuality.value],
			() => {
				store.dispatch.userPreferencesModule.savePreferences()
			}
		)

		const onChangeUsername = async () => {
			const value = username.value
			if (value.length === 0) {
				Notifications.error('Username field is empty!')
				return
			}

			username.value = ''
			try {
				await axios.put('/api/user/profile', {
					username: value,
				})
				await store.dispatch.fetchUser()
				currentUsername.value = username.value
				Notifications.success('Username updated!')
			} catch (error) {
				Notifications.error('Username update failed!')
			}
		}

		const onChangePassword = async () => {
			const value = password.value
			if (value.length === 0) {
				Notifications.error('Password field is empty!')
				return
			}

			password.value = ''
			try {
				await axios.put('/api/user/profile', {
					password: value,
				})
				Notifications.success('Password updated!')
			} catch (error) {
				Notifications.error('Password update failed!')
			}
		}

		return {
			email,
			username,
			password,
			player,
			isGuest,
			currentUsername,
			userLanguage,
			renderQuality,
			supportedLanguages,
			onChangeUsername,
			onChangePassword,
			supportedRenderQualities: RenderQuality,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.the-user-profile {
	min-width: 500px;
	max-width: 720px;
	flex: 1;
	margin: 0 32px 0 32px;

	.container {
		padding: 32px;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: auto;

		.section {
			width: 100%;
			display: flex;
			flex-direction: row;
			justify-content: space-around;
			border-bottom: 1px solid gray;
			padding-bottom: 16px;

			&.button-section {
				padding-bottom: 0;
			}

			& > .list {
				h3 {
					text-align: left;
				}

				min-width: 150px;
				display: flex;
				flex-direction: column;
				height: 100%;
				align-items: flex-start;
				justify-content: flex-start;

				input {
					margin-left: 0;
					margin-bottom: 1em;
				}

				.language-list-content {
					width: 100%;
					display: flex;
					justify-content: left;
				}
			}

			.info {
				width: 100%;

				.info-field {
					min-height: 3em;
					width: 100%;
					display: flex;
					flex-direction: row;

					.label {
						display: inline-flex;
						align-items: center;
						width: 20%;
					}
					.input {
						width: 80%;
						text-align: left;
						vertical-align: center;
						display: flex;
						align-items: center;

						button {
							width: 50%;
							margin-left: 8px;
							border: none;
						}
					}
				}
			}
		}

		.avatar {
			padding: 16px;
			max-height: 256px;
		}
	}
}
</style>
