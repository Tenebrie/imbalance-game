<template>
	<div class="the-changelog">
		<div class="iframe-container">
			<iframe id="frame" src="/changelog" />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-changelog {
		flex: 1;
		margin: 32px 32px 32px 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;

		.iframe-container {
			width: calc(100% - 64px);
			height: 100%;
			padding: 32px;
			background: $COLOR-BACKGROUND-TRANSPARENT;

			iframe {
				width: 100%;
				height: 100%;
				border: none;

				color: red !important;
			}

		}
	}
</style>
