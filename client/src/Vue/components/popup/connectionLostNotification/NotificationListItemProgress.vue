<template>
	<div class="notification-list-item-progress">
		<div class="progress" :style="progressStyle" />
		<div class="slot">
			<slot />
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
	props: {
		progress: {
			type: Number,
			required: true,
		},
	},

	setup(props) {
		const progressStyle = computed(() => ({
			width: `${props.progress}%`,
		}))
		return {
			progressStyle,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.notification-list-item-progress {
	padding: 3px;
	background-color: #bfbfbf;
	position: relative;
	border-radius: 4px;

	.progress {
		position: absolute;
		top: 0;
		left: 0;
		background-color: $COLOR-SECONDARY;
		height: 100%;
		border-radius: 4px;
	}

	.slot {
		position: relative;
	}
}
</style>
