<template>
	<div class="inline-tooltip-container" ref="containerRef">
		<div class="inline-tooltip">
			<span class="question">?</span>
		</div>
		<div class="floating-text">
			<div class="arrow" />
			<div class="slot">
				<slot />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'

export default defineComponent({
	setup() {
		const containerRef = ref<HTMLDivElement>()

		return {
			containerRef,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

$ARROW_SIZE: 12px;
$BACKGROUND_COLOR: #404040;
$BACKGROUND_COLOR_ACTIVE: #404040;

.inline-tooltip-container {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: help;
	z-index: 1000;

	.inline-tooltip {
		display: inline-block;
		margin: 0.25em;
		width: 1.5em;
		height: 1.5em;
		user-select: none;
		font-size: 1em;

		.question {
			color: $COLOR-TEXT;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
			background: $BACKGROUND_COLOR;
			border-radius: 50%;
		}
	}

	&:hover {
		.inline-tooltip > .question,
		.floating-text > .arrow,
		.floating-text {
			background: $BACKGROUND_COLOR_ACTIVE;
		}

		.floating-text {
			display: inline;
		}
	}

	.floating-text {
		display: none;
		position: absolute;
		padding: 8px 16px;
		background: $BACKGROUND_COLOR;
		bottom: 100%;
		border-radius: 8px;
		width: max-content;
		max-width: 400px;

		.arrow {
			position: absolute;
			bottom: calc(-#{$ARROW_SIZE} / 2);
			left: calc(50% - calc(#{$ARROW_SIZE} / 2));
			width: $ARROW_SIZE;
			height: $ARROW_SIZE;
			background: $BACKGROUND_COLOR;
			transform: rotate(45deg);
			z-index: 0;
		}

		.slot {
			position: relative;
			z-index: 1;
		}
	}
}
</style>
