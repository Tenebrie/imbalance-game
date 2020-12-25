<template>
	<div class="the-footer">
		<div class="right-side-container">
			<span>Discord!</span>
		</div>
	</div>
</template>

<script lang="ts">
import TheMiniUserProfile from '@/Vue/components/navigationbar/TheMiniUserProfile.vue'
import LanguageDropdown from '@/Vue/components/navigationbar/LanguageSelector.vue'
import {computed, defineComponent} from '@vue/composition-api'
import store from '@/Vue/store'
import AccessLevel from '@shared/enums/AccessLevel'
import TenebrieLogo from '@/Vue/components/utils/TenebrieLogo.vue'

export default defineComponent({
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

	.the-footer {
		position: fixed;
		z-index: 1;
		bottom: 0;
		height: $FOOTER-HEIGHT;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.logo {
		display: inline-block;
		height: calc(#{$NAVIGATION-BAR-HEIGHT} - 8px);
	}
</style>
