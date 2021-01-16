<template>
	<div class="the-discord-link">
		<DiscordLink>
			<img src="https://discord.com/assets/f8389ca1a741a115313bede9ac02e2c0.svg" alt="Discord group link" height="100px" />
		</DiscordLink>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import router from '@/Vue/router'
import Player from '@shared/models/Player'
import Localization from '@/Pixi/Localization'
import DiscordLink from '@/Vue/components/utils/DiscordLink.vue'
import { defineComponent } from 'vue'

export default defineComponent({
	components: { DiscordLink },

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

.the-discord-link {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	height: 100%;
	margin: 0 4px;

	a {
		display: flex;
		height: 100%;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}
	img {
		height: 80%;
	}
}
</style>
