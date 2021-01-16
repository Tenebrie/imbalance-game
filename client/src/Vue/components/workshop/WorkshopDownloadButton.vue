<template>
	<button class="primary game-button" @click="onClick">Download</button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { editorCardRenderer } from '@/utils/editor/EditorCardRenderer'
import CardMessage from '@shared/models/network/card/CardMessage'
import { WorkshopCardProps } from '@/Vue/components/workshop/WorkshopView.vue'

interface Props {
	name: string
	card: CardMessage & WorkshopCardProps
}

export default defineComponent({
	props: {
		name: {
			type: String,
			required: true,
		},
		card: {
			type: Object as PropType<CardMessage & WorkshopCardProps>,
			required: true,
		},
	},

	setup(props: Props) {
		const onClick = () => {
			const image = editorCardRenderer.doRender(props.card)

			const a = document.createElement('a')
			a.style.display = 'none'
			a.href = image.toDataURL('image/png').replace('image/png', 'image/octet-stream')
			a.download = `${props.name}.png`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
		}
		return {
			onClick,
		}
	},
})
</script>

<style scoped lang="scss">
button {
	width: 100%;
}
</style>
