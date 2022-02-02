<template>
	<div class="profile-view">
		<the-user-profile class="user-profile" />
		<build-version-footer />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TheUserProfile from '@/Vue/components/profile/TheUserProfile.vue'

import BuildVersionFooter from '../components/utils/BuildVersionFooter.vue'

export default defineComponent({
	components: {
		TheUserProfile,
		BuildVersionFooter,
	},
})
</script>

<style scoped lang="scss">
@import '../styles/generic';

.profile-view {
	display: flex;
	align-items: flex-end;
	justify-content: center;

	& > .user-profile {
		display: flex;
		flex-direction: column;
		background: $COLOR-BACKGROUND-TRANSPARENT;
	}
}
</style>
