<template>
	<div class="base-popup-buttons">
		<div class="menu-separator"></div>
		<div class="button-container-wrapper">
			<div class="button-container">
				<slot />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
	setup() {
		return {}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.button-container-wrapper {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: flex-end;

	.button-container {
		display: flex;

		::v-deep(button) {
			min-width: 100px;
		}
	}
}
</style>
