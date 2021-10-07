<template>
	<div class="the-navigation-bar">
		<div class="left-side-container">
			<div class="link-container">
				<router-link :to="{ name: 'home' }" class="router-link" exact>
					<tenebrie-logo class="logo" />
				</router-link>
			</div>
			<div class="link-container">
				<router-link :to="{ name: 'home' }" class="router-link" exact>
					<i class="fas fa-home" />
					{{ $locale.get('ui.navigation.home') }}
				</router-link>
			</div>
			<div class="link-container">
				<router-link :to="{ name: 'decks' }" class="router-link">
					<i class="fas fa-list" />
					{{ $locale.get('ui.navigation.decks') }}
				</router-link>
			</div>
			<div class="link-container">
				<router-link :to="{ name: 'workshop' }" class="router-link">
					<i class="fas fa-wrench" />
					{{ $locale.get('ui.navigation.workshop') }}
				</router-link>
			</div>
			<div class="link-container">
				<router-link :to="{ name: 'feedback' }" class="router-link">
					<i class="fas fa-comment" />
					{{ $locale.get('ui.navigation.feedback') }}
				</router-link>
			</div>
			<div class="link-container">
				<router-link :to="{ name: 'profile' }" class="router-link">
					<i class="fas fa-user" />
					{{ $locale.get('ui.navigation.profile') }}
				</router-link>
			</div>
			<div class="link-container" v-if="showAdminView">
				<router-link :to="{ name: 'admin' }" class="router-link">
					<i class="fas fa-hammer" />
					{{ $locale.get('ui.navigation.admin') }}
				</router-link>
			</div>
		</div>
		<div class="right-side-container">
			<language-dropdown v-if="displayLanguageSelector" />
			<the-discord-link />
			<the-mini-user-profile />
		</div>
	</div>
</template>

<script lang="ts">
import AccessLevel from '@shared/enums/AccessLevel'
import { computed, defineComponent } from 'vue'

import LanguageDropdown from '@/Vue/components/navigationbar/LanguageSelector.vue'
import TheMiniUserProfile from '@/Vue/components/navigationbar/TheMiniUserProfile.vue'
import TheDiscordLink from '@/Vue/components/navigationbar/TheNavigationBarDiscordLink.vue'
import TenebrieLogo from '@/Vue/components/utils/TenebrieLogo.vue'
import store from '@/Vue/store'

export default defineComponent({
	components: {
		TenebrieLogo,
		TheDiscordLink,
		TheMiniUserProfile,
		LanguageDropdown,
	},
	setup() {
		const displayLanguageSelector = computed<boolean>(() => !store.state.isLoggedIn)
		const accessLevel = computed<AccessLevel>(() => (store.state.player ? store.state.player.accessLevel : AccessLevel.NORMAL))
		const showAdminView = computed<boolean>(() => accessLevel.value === AccessLevel.ADMIN || accessLevel.value === AccessLevel.SUPPORT)

		return {
			showAdminView,
			displayLanguageSelector,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

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
	background: darken($COLOR-BACKGROUND-TRANSPARENT, 30);

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

			.router-link {
				height: 100%;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0 12px;
				transition: background-color 0.3s;

				i {
					margin-right: 4px;
				}

				&:hover {
					text-decoration: none !important;
					background: $COLOR-BACKGROUND-TRANSPARENT;
					transition: background-color 0s;
				}

				&:hover:active {
					background: darken($COLOR-BACKGROUND-TRANSPARENT, 30);
				}

				&.router-link-active {
					font-weight: bold;
				}
			}
		}
	}

	.right-side-container {
		height: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
}

.logo {
	display: inline-block;
	height: calc(#{$NAVIGATION-BAR-HEIGHT} - 8px);
}
</style>
