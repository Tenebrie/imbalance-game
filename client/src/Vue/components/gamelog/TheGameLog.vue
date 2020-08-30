<template>
	<div class="the-game-log">
		<div class="the-game-log-container">
			<div class="current-time">{{ currentTime }}</div>
			<div class="entry-group" v-for="group in entryGroups" :key="group.id">
				<div class="entry" v-for="(entry, index) in group.entries" :key="`${group.id}-${index}`">
					<TheGameLogEntry :entry="entry" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import store from '@/Vue/store'
import {onMounted, onUnmounted, ref} from '@vue/composition-api'
import TheGameLogEntry from '@/Vue/components/gamelog/TheGameLogEntry.vue'
import moment from 'moment'

export default {
	components: {
		TheGameLogEntry
	},
	setup() {
		const entryGroups = ref(store.state.gameLogModule.entryGroups)
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

		return {
			entryGroups,
			currentTime,
		}
	},

}
</script>

<style scoped lang="scss">
	@import "src/Vue/styles/generic";

	.the-game-log {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.the-game-log-container {
			width: calc(100% - 16px);
			height: 100%;
			max-width: 1000px;
			text-align: start;
			background: rgba(white, 0.1);
			padding: 8px;
			overflow-y: auto;

			.current-time {
				width: 100%;
				text-align: right;
			}

			.entry-group {
				font-size: 20px;
				margin-bottom: 1em;

				.entry {

				}
			}
		}
	}
</style>
