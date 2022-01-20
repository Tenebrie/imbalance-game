<template>
	<div class="notification-list-item-wrapper" ref="wrapperRef" :class="wrapperClass">
		<div class="item animated" :style="animatedItemStyle" v-if="targetBottom > 0">
			<NotificationListItemProgress :progress="progress">
				<div class="content" v-html="item.text"></div>
			</NotificationListItemProgress>
		</div>
		<div class="item static">
			<NotificationListItemProgress :progress="progress">
				<div class="content" v-html="item.text"></div>
			</NotificationListItemProgress>
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue'

import NotificationListItemProgress from '@/Vue/components/popup/connectionLostNotification/NotificationListItemProgress.vue'
import { NotificationItem } from '@/Vue/store/modules/NotificationModule'

export default defineComponent({
	components: { NotificationListItemProgress },
	props: {
		item: {
			type: Object as PropType<NotificationItem>,
			required: true,
		},
		index: {
			type: Number,
			required: true,
		},
		count: {
			type: Number,
			required: true,
		},
	},

	setup(props) {
		const wrapperRef = ref<HTMLDivElement | null>(null)

		const stickyIndex = ref(props.index)
		const targetBottom = ref(0)

		requestAnimationFrame(() => {
			const boundingRect = wrapperRef.value?.getBoundingClientRect()
			if (!boundingRect) {
				return
			}
			targetBottom.value = boundingRect.bottom + boundingRect.height + 4 || targetBottom.value
			requestAnimationFrame(() => {
				targetBottom.value = boundingRect.bottom || targetBottom.value
			})
		})

		watch(
			() => [props.index, props.count],
			() => {
				if (props.index >= 0) {
					requestAnimationFrame(() => {
						stickyIndex.value = props.index
						targetBottom.value = wrapperRef.value?.getBoundingClientRect().bottom || targetBottom.value
					})
				}
			}
		)

		const animatedItemStyle = computed(() => ({
			bottom: `${window.innerHeight - targetBottom.value - 4}px`,
		}))
		const wrapperClass = computed(() => ({
			info: props.item.type === 'info',
			success: props.item.type === 'success',
			warning: props.item.type === 'warning',
			error: props.item.type === 'error',
			discarded: props.item.discarded,
		}))

		const progress = ref(100)
		const interval = window.setInterval(() => {
			if (!props.item.persistent) {
				const diff = Math.min(1, Math.max(0, 1 - (new Date().getTime() - props.item.timestamp.getTime()) / props.item.timeout)) * 100
				if (diff === 0) {
					clearInterval(interval)
				}
				progress.value = diff
			}
		}, 8)

		const backgroundStyle = computed(() => ({
			width: `${progress.value}%`,
		}))

		return {
			targetBottom,
			progress,
			wrapperRef,
			wrapperClass,
			backgroundStyle,
			animatedItemStyle,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.notification-list-item-wrapper {
	width: 50%;
	text-align: start;
	font-family: 'Roboto', sans-serif;
	font-size: 1.1em;

	.item {
		max-width: 400px;
		border-radius: 4px;
		margin: 8px 8px 4px 32px;

		.content {
			border-radius: 4px;
			padding: 12px 16px 12px 16px;
		}
	}

	&.info .item .content {
		background-color: $COLOR-PRIMARY;
	}

	&.success .item .content {
		background-color: darkgreen;
	}

	&.warning .item .content {
		background-color: darken(darkorange, 10);
	}

	&.error .item .content {
		background-color: darkred;
	}

	.static {
		opacity: 0;
	}

	.animated {
		position: fixed;
		opacity: 1;
		transition: bottom 0.3s, opacity 0.3s;
	}

	&.discarded {
		.static {
			display: none;
		}
		.animated {
			opacity: 0;
		}
	}
}
</style>
