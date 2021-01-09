<template>
	<div class="point-display">
		<span class="point-header">{{ header }}:</span>
		<div class="point-container">
			<span v-for="point in displayedPoints" :key="point.index">
				<span v-if="point.filled">
					<span class="hex filled" v-if="!point.inDanger">⬢</span>
					<span class="hex filled danger" v-if="point.inDanger">⬢</span>
				</span>
				<span v-if="!point.filled">
					<span class="hex" v-if="!point.inDanger">⬡</span>
					<span class="hex danger" v-if="point.inDanger">⬡</span>
				</span>
			</span>
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'

interface Props {
	header: string
	value: number
	limit: number
	inDanger: number
}

type DisplayPoint = {
	index: number
	filled: boolean
	inDanger: boolean
}

export default defineComponent({
	props: {
		header: {
			type: String,
			required: true,
		},
		value: {
			type: Number,
			required: true,
		},
		limit: {
			type: Number,
			required: true,
		},
		inDanger: {
			type: Number,
			required: true,
		},
	},

	setup(props: Props) {
		const displayedPoints = computed<DisplayPoint[]>(() => {
			const points: DisplayPoint[] = []
			for (let i = 0; i < props.value; i++) {
				points.push({
					index: i,
					filled: true,
					inDanger: false,
				})
			}

			let dangerPoints = props.inDanger
			for (let i = points.length - 1; i >= points.length - props.inDanger; i--) {
				if (i < 0) {
					break
				}
				points[i].inDanger = true
				dangerPoints -= 1
			}
			for (let i = points.length; i < props.limit; i++) {
				points.push({
					index: i,
					filled: false,
					inDanger: false,
				})
			}
			for (let i = props.value; i < props.value + dangerPoints; i++) {
				if (i >= points.length) {
					break
				}
				points[i].inDanger = true
			}

			return points
		})

		return {
			displayedPoints,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.point-display {
	text-align: end;
	font-size: 20px;
}

.point-header {
	font-weight: bold;
}

.point-container {
	display: flex;
	flex-wrap: wrap;
	max-width: 100%;
	align-items: flex-end;
	justify-content: flex-end;
}

.hex {
	&.danger {
		color: lighten(red, 20);
	}
	&.filled.danger {
		color: lighten(red, 20);
	}
}
</style>
