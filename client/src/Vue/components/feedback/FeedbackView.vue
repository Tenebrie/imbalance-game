<template>
	<div class="feedback-view">
		<div class="container">
			<div class="content">
				<h2>Your feedback</h2>
				<div class="action-explanation">Your suggestions, ideas, or bug reports. And yes, I will, in fact, read them.</div>
				<textarea ref="feedbackRef" maxlength="4096" />
				<div class="separator" />
				<h3>Contact information (optional)</h3>
				<div class="action-explanation">If you want to receive a reply regarding anything written above.</div>
				<input type="text" ref="contactInfoRef" maxlength="256" />
				<div class="separator" />
				<div class="actions">
					<button class="primary" @click="onSend">
						<span v-if="!isSending"><i class="fas fa-paper-plane" /> Send</span>
						<span v-if="isSending"><progress-spinner /> Sending...</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import axios from 'axios'
import { defineComponent, ref } from 'vue'

import Notifications from '@/utils/Notifications'
import ProgressSpinner from '@/Vue/components/utils/ProgressSpinner.vue'

export default defineComponent({
	components: { ProgressSpinner },
	setup() {
		const isSending = ref<boolean>(false)
		const feedbackRef = ref<HTMLTextAreaElement | null>(null)
		const contactInfoRef = ref<HTMLInputElement | null>(null)

		const onSend = async () => {
			if (isSending.value) {
				return
			}

			const feedbackInput = feedbackRef.value
			const contactInfoInput = contactInfoRef.value
			if (feedbackInput === null || contactInfoInput === null) {
				throw new Error('References are not set')
			}

			const feedback = feedbackInput.value.trim()
			const contactInfo = contactInfoInput.value.trim()

			if (feedback.length === 0) {
				Notifications.error('The feedback field seems empty.')
				return
			}

			isSending.value = true

			try {
				await axios.post('/api/feedback', {
					feedbackBody: feedback,
					contactInfoBody: contactInfo,
				})
				Notifications.success('Your feedback has been received! 👋')
				feedbackInput.value = ''
				contactInfoInput.value = ''
			} catch (error) {
				Notifications.error(`Unable to send your feedback:<br>- ${error.message}`)
			}
			isSending.value = false
		}

		return {
			onSend,
			isSending,
			feedbackRef,
			contactInfoRef,
		}
	},
})
</script>

<style scoped lang="scss">
@import '../../styles/generic';

.feedback-view {
	display: flex;
	align-items: center;
	justify-content: center;

	.container {
		width: 100%;
		max-width: 1366px;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		background: $COLOR-BACKGROUND-TRANSPARENT;

		.content {
			width: calc(100% - 64px);
			display: flex;
			flex-direction: column;
			padding: 16px 32px;
			text-align: start;

			textarea {
				margin: 0;
				padding: 8px;

				width: calc(100% - 16px);
				min-width: 512px;
				max-width: calc(100% - 16px);
				height: 384px;
				min-height: 128px;
				max-height: 640px;
			}
		}
	}

	.separator {
		width: 100%;
		height: 1px;
		background: gray;
		margin: 16px 0;
	}
}
</style>
