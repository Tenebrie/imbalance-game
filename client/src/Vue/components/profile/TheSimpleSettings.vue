<template>
	<div class="the-simple-settings">
		<div class="the-simple-settings-container">
			<the-volume-settings />
		</div>
	</div>
</template>

<script lang="ts">
import TheVolumeSettings from '@/Vue/components/profile/TheVolumeSettings.vue'

export default {
	components: {TheVolumeSettings},
}
</script>

<style scoped lang="scss">
	@import "src/Vue/styles/generic";

	.the-simple-settings {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.the-simple-settings-container {
			width: calc(100% - 16px);
			height: 100%;
			max-width: 1000px;
			text-align: start;
			background: rgba(white, 0.1);
			padding: 8px;
			overflow-y: auto;
			display: flex;
			align-items: center;
		}
	}
</style>
