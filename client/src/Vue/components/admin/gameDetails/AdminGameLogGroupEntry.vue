<template>
	<div class="admin-game-log-group-entry">{{ timestamp }}: <span v-html="localizedString" /></div>
</template>

<script lang="ts">
import moment from 'moment'
import { computed, defineComponent, PropType } from '@vue/composition-api'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import Localization from '@/Pixi/Localization'
import { GameHistoryPlayerDatabaseEntry } from '@shared/models/GameHistoryDatabaseEntry'

interface Props {
	entry: EventLogEntryMessage
	players: GameHistoryPlayerDatabaseEntry[]
}

export default defineComponent({
	props: {
		entry: {
			type: Object as PropType<EventLogEntryMessage>,
			required: true,
		},
		players: {
			type: Array as PropType<GameHistoryPlayerDatabaseEntry[]>,
			required: true,
		},
	},

	setup(props: Props) {
		const timestamp = computed<string>(() => {
			return moment(props.entry.timestamp).format('HH:mm:ss')
		})

		const localizedString = computed<string>(() => {
			let id = `log.entry.${props.entry.event}`
			if (props.entry.subtype) {
				id += `.${props.entry.subtype}`
			}
			let template = Localization.get(id)
			for (const key in props.entry.args) {
				let value = props.entry.args[key] as string
				if (typeof value === 'string') {
					if (value.startsWith('player:') && props.players.find((player) => player.id === value)) {
						value = `<b>${props.players.find((player) => player.id === value).username}</b>`
					} else if (value.startsWith('player:')) {
						value = `<b>Player#${value.substr(7, 8)}</b>`
					} else if (value.startsWith('ai:')) {
						value = `<b>AI</b>`
					} else if (value.startsWith('card:')) {
						value = `<b>${Localization.get(`card.${value.split(':')[1]}.name`)} [${value.split(':')[2].substr(0, 8)}]</b>`
					} else if (value.startsWith('buff:')) {
						value = `<b>${Localization.get(`buff.${value.split(':')[1]}.name`)} [${value.split(':')[2].substr(0, 8)}]</b>`
					}
				}

				template = template.replace(new RegExp(`{${key}}`, 'g'), value)
			}
			return template
		})

		return {
			timestamp,
			localizedString,
		}
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.admin-game-log-group-entry {
	margin-bottom: 8px;
}
</style>
