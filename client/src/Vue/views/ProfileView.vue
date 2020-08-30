<template>
	<div class="profile-view">
		<the-user-profile />
	</div>
</template>

<script lang="ts">
import TheUserProfile from '@/Vue/components/profile/TheUserProfile.vue'

export default {
	components: {
		TheUserProfile
	}
}
</script>

<style scoped lang="scss">
	@import "../styles/generic";

	.profile-view {
		display: flex;
		align-items: flex-end;
		justify-content: center;

		& > div {
			display: flex;
			flex-direction: column;
			background: $COLOR-BACKGROUND-TRANSPARENT;
		}
	}
</style>
