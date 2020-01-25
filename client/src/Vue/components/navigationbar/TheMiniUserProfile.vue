<template>
	<div class="the-mini-user-profile">
		<div @click="onClick" class="username">{{ displayedUsername }}</div>
		<user-avatar @click="onClick" class="avatar" />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import UserAvatar from '@/Vue/components/navigationbar/UserAvatar.vue'
import Player from '@/Pixi/shared/models/Player'

export default Vue.extend({
	components: {
		UserAvatar
	},

	data: () => ({

	}),

	computed: {
		player(): Player | null {
			return store.state.player
		},

		displayedUsername(): string {
			if (this.player) {
				return this.player.username
			}
			return 'Login'
		}
	},

	methods: {
		onClick(): void {
			store.dispatch.logout()
		}
	}
})
</script>

<style scoped lang="scss">
	@import './src/Vue/styles/generic';

	.the-mini-user-profile {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		height: 100%;
		margin: 0 4px;

		.username {
			user-select: none;
			cursor: pointer;
		}
		.avatar {
			margin: 0 4px;
		}
	}
</style>
