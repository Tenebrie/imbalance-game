<template>
	<div class="profile-view">
		<the-user-profile class="user-profile" />
		<div class="profile-footer">
			<span>State of Imbalance v0.14 (15.01.2021)</span>
		</div>
	</div>
</template>

<script lang="ts">
import TheUserProfile from '@/Vue/components/profile/TheUserProfile.vue'
import { defineComponent } from 'vue'

export default defineComponent({
	components: {
		TheUserProfile,
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

	& > .profile-footer {
		height: auto !important;
		position: absolute;
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		font-family: monospace, monospace;

		& > span {
			color: gray;
			padding: 4px;
		}
	}
}
</style>
