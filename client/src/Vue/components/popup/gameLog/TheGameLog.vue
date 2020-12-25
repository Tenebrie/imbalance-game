<template>
	<div class="the-game-log">
		<div class="the-game-log-container" @click="onMenuClick">
			<div class="the-game-log-scroller">
				<div class="current-time">{{ currentTime }}</div>
				<div class="entry-group" v-for="group in displayedEntryGroups" :key="group.id">
					<div class="entry" v-for="(entry, index) in group.entries" :key="`${group.id}-${index}`">
						<TheGameLogEntry :entry="entry" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import {defineComponent, onMounted, onUnmounted, ref} from '@vue/composition-api'
import TheGameLogEntry from '@/Vue/components/popup/gameLog/TheGameLogEntry.vue'
import moment from 'moment'

export default defineComponent({
	components: {
		TheGameLogEntry
	},
	setup() {
		const entryGroups = ref(store.state.gameLogModule.entryGroups)
		const displayedEntryGroups = entryGroups.value.slice().reverse()
		const currentTime = ref<string>('')

		let updateCurrentTimeInterval
		onMounted(() => {
			updateCurrentTimeInterval = setInterval(updateCurrentTime, 500)
			updateCurrentTime()
		})
		onUnmounted(() => clearInterval(updateCurrentTimeInterval))

		const updateCurrentTime = () => {
			currentTime.value = moment().format('HH:mm:ss')
		}

		const onMenuClick = (event: MouseEvent) => {
			event.cancelBubble = true
		}

		return {
			onMenuClick,
			currentTime,
			displayedEntryGroups,
		}
	}
})
</script>

<style scoped lang="scss">
	@import "src/Vue/styles/generic";

	.the-game-log {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.the-game-log-container {
		width: calc(100% - 16px);
		height: calc(100% - 64px);
		max-width: 1000px;
		text-align: start;
		background: $COLOR_BACKGROUND_GAME_MENU;
		padding: 8px 24px 8px 16px;
		border: 2px solid $COLOR_BACKGROUND_GAME_MENU_BORDER;
		border-radius: 16px;
	}

	.the-game-log-scroller {
		overflow-y: auto;
		width: 100%;
		height: 100%;
		padding: 0px 8px;
	}

	.current-time {
		width: 100%;
		text-align: right;
	}

	.entry-group {
		width: 100%;
		font-size: 20px;
		margin-top: 0.5em;
		padding-top: 0.5em;

		border-top: 1px solid rgba(white, 0.7);

		.entry {

		}
	}
</style>
