<template>
	<div class="profile-view">
		<the-user-profile />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import TheUserProfile from '@/Vue/components/profile/TheUserProfile.vue'

export default Vue.extend({
	components: {
		TheUserProfile
	}
})
</script>

<style scoped lang="scss">
	@import "../styles/generic";

	.profile-view {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: center;

		& > div {
			display: flex;
			flex-direction: column;
			background: $COLOR-BACKGROUND-TRANSPARENT;
			height: calc(100% - #{$NAVIGATION-BAR-HEIGHT});
		}
	}
</style>
