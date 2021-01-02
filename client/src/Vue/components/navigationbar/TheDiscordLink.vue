<template>
	<div class="the-discord-link">
		<a href="https://discord.gg/9fSWxMnBFa" target="_blank">
			<img src="https://discord.com/assets/f8389ca1a741a115313bede9ac02e2c0.svg" alt="Discord group link" height="100px" />
		</a>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import router from '@/Vue/router'
import Player from '@shared/models/Player'
import Localization from '@/Pixi/Localization'

export default Vue.extend({
	components: {},

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
