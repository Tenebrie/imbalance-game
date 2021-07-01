<template>
	<div class="container">
		<div
			class="slider"
			@focus="onFocusReceived"
			@mousedown="onMouseDown"
			@click="onMouseClick"
			ref="sliderRef"
			tabindex="0"
			@keydown="onKeyDown"
			:class="showOutlineClass"
		>
			<div ref="trackRef" class="track">
				<div class="progress" />
			</div>
			<div ref="thumbRef" class="thumb" />
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

export default defineComponent({
	props: {
		modelValue: {
			type: Boolean,
			required: true,
		},
	},

	emits: ['update:modelValue'],

	setup(props, { emit }) {
		const thumbRef = ref<HTMLDivElement>()
		const trackRef = ref<HTMLDivElement>()
		const sliderRef = ref<HTMLDivElement>()

		const showOutline = ref(false)
		const preventFocusEvent = ref(false)
		const onFocusReceived = () => {
			if (preventFocusEvent.value) {
				preventFocusEvent.value = false
				return
			}
			showOutline.value = true
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Space') {
				onMouseClick()
				event.preventDefault()
			}
			showOutline.value = true
		}

		const onMouseDown = (event: MouseEvent) => {
			showOutline.value = false
			event.preventDefault()
		}

		const onMouseClick = () => {
			showOutline.value = false
			emit('update:modelValue', !props.modelValue)
		}

		const showOutlineClass = computed(() => ({
			'show-outline': showOutline.value,
			toggled: props.modelValue,
		}))

		return {
			thumbRef,
			trackRef,
			sliderRef,
			showOutlineClass,
			onKeyDown,
			onMouseDown,
			onMouseClick,
			onFocusReceived,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.container {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 2px;
}

.progress {
	background: red;
}

.slider {
	width: 9px;
	.progress {
		width: 0;
		transition: width 0.2s;
	}
	.thumb {
		left: 9px;
		transition: left 0.2s, right 0.2s;
	}

	&.toggled {
		.progress {
			width: 100%;
			border-radius: 8px;
		}
		.thumb {
			left: calc(100% - 9px);
		}
	}
}

.slider {
	height: 20px;
	cursor: pointer;
	position: relative;
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	margin: 0 4px;

	&:focus {
		outline: none;
	}
	&.show-outline:focus {
		outline: lighten($COLOR-PRIMARY, 10) solid 1px;
	}

	.track {
		width: 100%;
		height: 40%;
		background: gray;
		border-radius: 8px;
		transition: background-color 0.3s;
	}

	.thumb {
		position: absolute;
		height: 100%;
		width: 20px;
		margin-left: -10px;
		border-radius: 50%;
		background: lighten($COLOR-PRIMARY, 10);
		pointer-events: none;
		transition: background-color 0.3s;
	}

	.progress {
		height: 100%;
		background: lighten($COLOR-PRIMARY, 10);
		border-radius: 8px 0 0 8px;
		transition: background-color 0.3s;
	}

	&:hover {
		.track {
			background: lighten(gray, 5);
			transition: background-color 0s;
		}

		.thumb {
			background: lighten($COLOR-PRIMARY, 15);
			transition: background-color 0s;
		}

		.progress {
			background: lighten($COLOR-PRIMARY, 15);
			transition: background-color 0s;
		}
	}

	&:active {
		.track {
			background: lighten(gray, 2.5);
		}

		.thumb {
			background: lighten($COLOR-PRIMARY, 12.5);
		}

		.progress {
			background: lighten($COLOR-PRIMARY, 12.5);
		}
	}
}
</style>
