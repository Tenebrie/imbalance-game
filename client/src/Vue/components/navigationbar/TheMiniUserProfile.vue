<template>
	<div class="the-mini-user-profile" @click="onClick">
		<div class="link-container">
			<span>{{ displayedUsername }}</span>
		</div>
		<user-avatar class="avatar" />
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import router from '@/Vue/router'
import UserAvatar from '@/Vue/components/navigationbar/UserAvatar.vue'
import Player from '@shared/models/Player'
import Localization from '@/Pixi/Localization'
import { defineComponent } from 'vue'

export default defineComponent({
	components: {
		UserAvatar,
	},

	data: () => ({}),

	computed: {
		player(): Player | null {
			return store.state.player
		},

		displayedUsername(): string {
			if (this.player) {
				return this.player.username
			}
			return Localization.get('ui.navigation.login')
		},
	},

	methods: {
		onClick(): void {
			if (this.$route.name !== 'profile') {
				router.push({ name: 'profile' })
			}
		},
	},
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
	padding: 0 8px;
	cursor: pointer;
	user-select: none;
	color: $COLOR-SECONDARY;
	transition: background-color 0.3s;

	&:hover {
		background: $COLOR-BACKGROUND-TRANSPARENT;
		transition: background-color 0s;
	}
	&:hover:active {
		background: darken($COLOR-BACKGROUND-TRANSPARENT, 30);
	}

	.username {
		user-select: none;
		cursor: pointer;
	}
	.avatar {
		margin: 0 4px;
	}
}
</style>
