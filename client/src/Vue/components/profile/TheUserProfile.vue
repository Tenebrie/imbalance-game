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
						<span class="input"><input type="password" v-model="password" placeholder="New password" />
						</span>
					</div>
				</div>
			</div>
			<div class="section">
				<profile-logout-button />
			</div>
			<div class="section">
				<profile-delete-user-button />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import {onMounted, ref} from '@vue/composition-api'
import UserAvatar from '@/Vue/components/navigationbar/UserAvatar.vue'
import UserProfileMessage from '@shared/models/network/UserProfileMessage'
import ProfileLogoutButton from '@/Vue/components/profile/ProfileLogoutButton.vue'
import ProfileDeleteUserButton from '@/Vue/components/profile/ProfileDeleteUserButton.vue'

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

	return {
		email,
		username,
		password
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
				border-bottom: 1px solid gray;

				&.basic-info-section {
					padding-bottom: 16px;
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
