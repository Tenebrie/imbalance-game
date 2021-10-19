<template>
	<div class="editor-deck-card-list-separator-unfinished" :onclick="onClick">
		<span class="line-container left"><span class="line"></span></span>
		<span class="text">{{ separatorText }}</span>
		<span class="line-container right"><span class="line"></span></span>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

import Notifications from '@/utils/Notifications'

export default defineComponent({
	setup() {
		const separatorText = computed<string>(() => 'Actions')
		const clickCount = ref<number>(0)

		const onClick = () => {
			clickCount.value += 1
			const clicksRemaining = 101 - clickCount.value
			if (clicksRemaining > 0 && clicksRemaining % 10 === 0) {
				Notifications.info(`${clicksRemaining} clicks remaining!`)
			} else if (clicksRemaining === 0) {
				Notifications.success(`Here's your cake: 🎂`, {
					timeout: 10000,
				})
			}
		}
		return {
			separatorText,
			onClick,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.editor-deck-card-list-separator-unfinished {
	width: calc(100% - 16px);
	display: flex;
	flex-direction: row;
	padding: 4px 8px;
	user-select: none;
	font-size: 1.1em;
	cursor: pointer;
	transition: background-color 0.3s;

	&:hover {
		background: $COLOR-BACKGROUND-TRANSPARENT;
		transition: background-color 0s;
	}

	color: darken(white, 10);
	.line {
		background: darken(white, 10);
	}

	.text {
		display: inline-block;
		margin: 0 8px;
	}

	.line-container.left {
		width: 30px;
	}

	.line-container.right {
		flex: 1;
	}

	.line-container {
		width: 100px;
		display: flex;
		flex-direction: column;
		justify-content: center;

		.line {
			width: 100%;
			border-radius: 2px;
			height: 4px;
			display: block;
		}
	}
}
</style>
