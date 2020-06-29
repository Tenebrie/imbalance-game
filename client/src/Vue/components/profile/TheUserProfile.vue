<template>
	<div class="the-user-profile">
		<div class="container">
			<user-avatar class="avatar" />
			<div class="section basic-info-section">
				<div class="info">
					<div class="info-field">
						<span class="label">Email:</span>
						<span class="input">{{ email }}</span>
					</div>
					<div class="info-field">
						<span class="label">Username:</span>
						<span class="input">{{ username }}</span>
					</div>
					<div class="info-field">
						<span class="label">Password:</span>
						<span class="input">
							<input type="password" v-model="password" placeholder="New password" />
							<button class="primary" @click="onChangePassword">Change password</button>
						</span>
					</div>
				</div>
			</div>
			<div class="section">
				<div class="language-list">
					<h3>Language</h3>
					<div v-for="language in supportedLanguages" :key="language">
						<div class="language-list-content">
							<input :id="`language-list-item-${language}`"
									type="radio"
									name="language"
									:value="language"
									v-model="selectedLanguage"
							/>
							<label :for="`language-list-item-${language}`">{{ $locale.get(`ui.language.${language}`) }}</label>
						</div>
					</div>
				</div>
			</div>
			<div class="section button-section">
				<profile-logout-button />
				<profile-delete-user-button />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import store from '@/Vue/store'
import {computed, onMounted, ref, watch} from '@vue/composition-api'
import UserAvatar from '@/Vue/components/navigationbar/UserAvatar.vue'
import UserProfileMessage from '@shared/models/network/UserProfileMessage'
import ProfileLogoutButton from '@/Vue/components/profile/ProfileLogoutButton.vue'
import ProfileDeleteUserButton from '@/Vue/components/profile/ProfileDeleteUserButton.vue'
import {supportedLanguages} from '@/Pixi/Localization'
import Language from '@shared/models/Language'
import Notifications from '@/utils/Notifications'

function TheUserProfile() {
	const email = ref<string>('')
	const username = ref<string>('')
	const password = ref<string>('')

	onMounted(async () => {
		const response = await axios.get('/api/user/profile')
		const profileMessage = response.data.data as UserProfileMessage

		email.value = profileMessage.email
		username.value = profileMessage.username
	})

	const selectedLanguage = computed({
		get() {
			return store.state.userPreferencesModule.selectedLanguage
		},
		set(value) {
			const language = value as Language
			store.commit.userPreferencesModule.setSelectedLanguage(language)
			store.commit.editor.clearRenderedCards()
		}
	})

	watch(() => [selectedLanguage.value], () => {
		axios.put('/api/user/profile', {
			userLanguage: selectedLanguage.value
		})
	})

	const onChangePassword = async () => {
		password.value = ''
		await axios.put('/api/user/profile', {
			password: password.value
		})
		Notifications.success('Password updated!')
	}

	return {
		email,
		username,
		password,
		selectedLanguage,
		supportedLanguages,
		onChangePassword
	}
}

export default {
	components: {
		UserAvatar,
		ProfileLogoutButton,
		ProfileDeleteUserButton
	},
	setup: TheUserProfile
}
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

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

			.section {
				width: 100%;
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				border-bottom: 1px solid gray;
				padding-bottom: 16px;

				&.button-section {
					padding-bottom: 0;
				}

				.language-list {
					h3 {
						text-align: left;
					}

					min-width: 150px;
					display: flex;
					flex-direction: column;
					height: 100%;
					justify-content: center;

					input {
						margin-left: 0;
						// min-height: 2em;
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
