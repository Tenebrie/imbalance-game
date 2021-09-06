<template>
	<div class="notification-list-item-progress pie-wrapper">
		<div class="pie" :class="pieStyle">
			<div class="left-side half-circle" :style="leftSideStyle"></div>
			<div class="right-side half-circle"></div>
		</div>
		<div class="shadow"></div>
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
		const pieStyle = computed(() => ({
			'less-than-half': props.progress <= 50,
			'over-half': props.progress > 50,
		}))
		const leftSideStyle = computed(() => ({
			transform: `rotate(${props.progress * 3.6}deg)`,
		}))
		return {
			pieStyle,
			leftSideStyle,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

// -- vars
$bg-color: #34495e;
$default-size: 1em;
$border-width: 1 / 7;

// -- mixins
@mixin size($width, $height) {
	height: $height;
	width: $width;
}

.pie-wrapper {
	@include size($default-size, $default-size);
	position: relative;

	&:nth-child(3n + 1) {
		clear: both;
	}

	.pie {
		@include size(100%, 100%);
		clip: rect(0, $default-size, $default-size, $default-size / 2);
		top: 0;
		left: 0;
		position: absolute;

		.half-circle {
			@include size(100%, 100%);
			box-sizing: border-box;
			border: ($default-size * $border-width) solid #3498db;
			border-radius: 50%;
			clip: rect(0, $default-size / 2, $default-size, 0);
			left: 0;
			position: absolute;
			top: 0;
		}
	}

	.shadow {
		@include size(100%, 100%);
		box-sizing: border-box;
		border: $default-size * $border-width solid #bdc3c7;
		border-radius: 50%;
	}

	.pie {
		.half-circle {
			border-color: $COLOR-SECONDARY;
		}

		&.less-than-half .right-side {
			display: none;
		}

		&.over-half {
			clip: rect(auto, auto, auto, auto);

			.right-side {
				transform: rotate(180deg);
			}
		}
	}
}
</style>
