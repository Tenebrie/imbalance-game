<template>
	<div class="button-container">
		<button class="secondary" @click="onClick">
			<span><i class="fas fa-list-ul" /> Manage your decks</span>
		</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import store from '@/Vue/store'

export default defineComponent({
	methods: {
		onClick(): void {
			store.dispatch.popupModule.closeAll()
			this.$router.push({ name: 'decks' })
		},
	},
})
</script>

<style scoped lang="scss">
@import '../../../styles/generic';

.button-container {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	button {
		width: 100%;
		font-size: 1.2em;
	}
}
</style>
