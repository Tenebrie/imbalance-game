<template>
	<div class="the-discord-link">
		<DiscordLink>
			<img src="../../assets/discord.svg" alt="Discord server link" height="100px" />
		</DiscordLink>
	</div>
</template>

<script lang="ts">
import Player from '@shared/models/Player'
import { defineComponent } from 'vue'

import Localization from '@/Pixi/Localization'
import DiscordLink from '@/Vue/components/utils/DiscordLink.vue'
import router from '@/Vue/router'
import store from '@/Vue/store'

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
	padding: 0 8px;
	transition: background-color 0.3s;

	&:hover {
		background: $COLOR-BACKGROUND-TRANSPARENT;
		transition: background-color 0s;
	}
	&:hover:active {
		background: darken($COLOR-BACKGROUND-TRANSPARENT, 30);
	}

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
