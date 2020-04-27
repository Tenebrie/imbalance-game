<template>
	<div class="the-navigation-bar">
		<div class="left-side-container">
			<div class="link-container">
				<router-link tag="span" :to="{ name: 'home' }" class="router-link" exact>Home</router-link>
			</div>
			<div class="link-container">
				<router-link tag="span" :to="{ name: 'decks' }" class="router-link">Decks</router-link>
			</div>
		</div>
		<div class="right-side-container">
			<the-mini-user-profile />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/Vue/store'
import TheMiniUserProfile from '@/Vue/components/navigationbar/TheMiniUserProfile.vue'

export default Vue.extend({
	components: {
		TheMiniUserProfile
	},

	data: () => ({

	}),

	computed: {
		isInGame() {
			return store.getters.gameStateModule.isInGame
		}
	},

	methods: {

	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-navigation-bar {
		position: fixed;
		top: 0;
		height: 48px;
		width: 100%;
		border-bottom: solid gray 1px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: $COLOR-BACKGROUND-TRANSPARENT;

		.left-side-container {
			display: flex;
			flex-direction: row;
			width: 100%;
			height: 100%;
			.link-container {
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin: 0 8px;

				.router-link {
					cursor: pointer;
				}

				.router-link:hover {
					text-decoration: underline;
				}

				.router-link-active {
					font-weight: bold;
				}
			}
		}

		.right-side-container {
			height: 100%;
		}
	}
</style>
