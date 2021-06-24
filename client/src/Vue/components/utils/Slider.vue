<template>
	<div class="container">
		<div
			class="slider"
			@focus="onFocusReceived"
			@mousedown="onMouseDown"
			ref="sliderRef"
			tabindex="0"
			@keydown="onKeyDown"
			:class="showOutlineClass"
		>
			<div ref="trackRef" class="track">
				<div class="progress" :style="progressStyle" />
			</div>
			<div ref="thumbRef" class="thumb" :style="thumbStyle" />
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'

export default defineComponent({
	props: {
		modelValue: {
			type: Number,
			required: true,
		},
		min: {
			type: Number,
			default: 0,
		},
		max: {
			type: Number,
			default: 100,
		},
		step: {
			type: Number,
			default: 1,
		},
	},

	emits: ['update:modelValue'],

	setup(props, { emit }) {
		const thumbRef = ref<HTMLDivElement>()
		const trackRef = ref<HTMLDivElement>()
		const sliderRef = ref<HTMLDivElement>()

		const thumbPadding = 9
		const thumbValue = ref(thumbPadding)

		const sliderPositionX = ref(0)

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
			let value = props.modelValue
			if (event.key === 'ArrowRight') {
				value += props.step
			} else if (event.key === 'ArrowLeft') {
				value -= props.step
			}
			value = Math.max(props.min, Math.min(props.max, value))
			emit('update:modelValue', value)
			showOutline.value = true
		}

		const onMouseDown = (event: MouseEvent) => {
			sliderPositionX.value = event.clientX - event.offsetX
			onMouseMove(event)
			showOutline.value = false
			preventFocusEvent.value = true

			window.addEventListener('mousemove', onMouseMove)
			window.addEventListener('mouseup', onMouseUp)
		}

		const onMouseMove = (event: MouseEvent) => {
			if (!sliderRef.value) {
				return
			}

			const mousePosition = event.clientX - sliderPositionX.value - thumbPadding
			const sliderWidth = sliderRef.value.clientWidth - thumbPadding * 2

			const min = props.min
			const max = props.max
			const step = props.step

			// Calculate the initial value in [0; 1] range
			let tempValue = Math.min(1, Math.max(0, mousePosition / sliderWidth))

			// Apply the nearest valid step position
			const validPositions = (1 / step) * (max - min)
			tempValue = Math.round(tempValue * validPositions) / validPositions

			// Snap to [min; max] range
			tempValue = Math.round(min + tempValue * (max - min))

			// Flush value
			emit('update:modelValue', tempValue)
		}

		const onMouseUp = () => {
			window.removeEventListener('mousemove', onMouseMove)
			window.removeEventListener('mouseup', onMouseUp)
		}

		const useUpdateThumbValue = (baseValue: number) => {
			if (!sliderRef.value) {
				return
			}
			const rawValue = (baseValue - props.min) / (props.max - props.min)
			const sliderWidth = sliderRef.value.clientWidth - thumbPadding * 2
			thumbValue.value = Math.min(sliderRef.value.clientWidth - thumbPadding, Math.max(thumbPadding, rawValue * sliderWidth + thumbPadding))
		}

		const isMounted = ref(false)
		onMounted(() => {
			isMounted.value = true
			useUpdateThumbValue(props.modelValue)
		})

		watch(
			() => [props.modelValue],
			() => {
				useUpdateThumbValue(props.modelValue)
			}
		)

		const thumbStyle = computed(() => ({
			left: `${thumbValue.value}px`,
		}))

		const progressStyle = computed(() => ({
			width: `${thumbValue.value}px`,
		}))

		const showOutlineClass = computed(() => ({
			'show-outline': showOutline.value,
		}))

		return {
			thumbRef,
			trackRef,
			sliderRef,
			thumbStyle,
			progressStyle,
			showOutlineClass,
			onKeyDown,
			onMouseDown,
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
	}

	.thumb {
		position: absolute;
		height: 100%;
		width: 20px;
		margin-left: -10px;
		border-radius: 50%;
		background: lighten($COLOR-PRIMARY, 10);
		pointer-events: none;
	}

	.progress {
		height: 100%;
		background: lighten($COLOR-PRIMARY, 10);
		border-radius: 8px 0 0 8px;
	}

	&:hover {
		.track {
			background: lighten(gray, 5);
		}

		.thumb {
			background: lighten($COLOR-PRIMARY, 15);
		}

		.progress {
			background: lighten($COLOR-PRIMARY, 15);
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
