<template>
	<div class="the-navigation-bar">
		<div class="left-side-container">
			<div class="link-container">
				<router-link tag="span" :to="{ name: 'home' }" class="router-link" exact>
					{{ $locale.get('ui.navigation.home') }}
				</router-link>
			</div>
			<div class="link-container">
				<router-link tag="span" :to="{ name: 'decks' }" class="router-link">
					{{ $locale.get('ui.navigation.decks') }}
				</router-link>
			</div>
			<div class="link-container">
				<router-link tag="span" :to="{ name: 'rules' }" class="router-link">
					{{ $locale.get('ui.navigation.rules') }}
				</router-link>
			</div>
			<div class="link-container" v-if="showAdminView">
				<router-link tag="span" :to="{ name: 'admin' }" class="router-link">
					{{ $locale.get('ui.navigation.admin') }}
				</router-link>
			</div>
		</div>
		<div class="right-side-container">
			<language-dropdown v-if="displayLanguageSelector" />
			<the-mini-user-profile />
		</div>
	</div>
</template>

<script lang="ts">
import TheMiniUserProfile from '@/Vue/components/navigationbar/TheMiniUserProfile.vue'
import LanguageDropdown from '@/Vue/components/navigationbar/LanguageSelector.vue'
import {computed, defineComponent} from '@vue/composition-api'
import store from '@/Vue/store'
import AccessLevel from '@shared/enums/AccessLevel'

export default defineComponent({
	components: {
		TheMiniUserProfile,
		LanguageDropdown,
	},
	setup() {
		const displayLanguageSelector = computed<boolean>(() => !store.state.isLoggedIn)
		const accessLevel = computed<AccessLevel>(() => store.state.player ? store.state.player.accessLevel : AccessLevel.NORMAL)
		const showAdminView = computed<boolean>(() => accessLevel.value === AccessLevel.ADMIN || accessLevel.value === AccessLevel.SUPPORT)

		return {
			showAdminView,
			displayLanguageSelector
		}
	}
})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-navigation-bar {
		position: fixed;
		z-index: 1;
		top: 0;
		height: $NAVIGATION-BAR-HEIGHT;
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
			display: flex;
			flex-direction: row;
			justify-content: space-between;

			& > * {
			}
		}
	}
</style>
