<template>
	<div class="the-changelog">
		<div class="iframe-container">
			<iframe id="frame" src="/changelog" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.the-changelog {
	.iframe-container {
		width: calc(100% - 64px);
		height: 100%;
		padding: 32px;

		iframe {
			width: 100%;
			height: 100%;
			border: none;

			color: red !important;
		}
	}
}
</style>
