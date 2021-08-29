<template>
	<div class="the-game-log-entry" v-if="message !== '<no-content>'">
		<span class="timestamp">{{ timestamp }}</span> - <span v-html="message" />
	</div>
</template>

<script lang="ts">
import GameEventType from '@shared/enums/GameEventType'
import { GameHistoryPlayerDatabaseEntry } from '@shared/models/GameHistoryDatabaseEntry'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import moment from 'moment'
import { defineComponent, PropType } from 'vue'

import Core from '@/Pixi/Core'
import Localization from '@/Pixi/Localization'
import { getEntityName } from '@/utils/Utils'

export default defineComponent({
	props: {
		entry: {
			type: Object as PropType<EventLogEntryMessage>,
			required: true,
		},
	},

	computed: {
		timestamp(): string {
			return moment(this.entry.timestamp).format('HH:mm:ss')
		},

		message(): string {
			const entry = this.entry as EventLogEntryMessage
			const subtype = entry.subtype ? `.${entry.subtype}` : this.getCustomSubtype(entry)
			return this.populateTemplate(Localization.get(`log.entry.${entry.event}${subtype}`), entry.args)
		},
	},

	methods: {
		getCustomSubtype(entry: EventLogEntryMessage): string {
			if (entry.event === GameEventType.CARD_DRAWN) {
				const card = Core.game.findCardById(entry.args.triggeringCard as string)
				if (card && !Localization.getCardName(card)) {
					return '.hidden'
				}
			}
			return ''
		},

		populateTemplate(template: string, args: Record<string, any>): string {
			const variables = this.getTemplateVariables(template)

			let replacedText = template
			for (const variableNameIndex in variables) {
				const variableName = variables[variableNameIndex]
				const entityId = args[variableName]
				let variableValue = entityId || `{${variableName}}`

				if (entityId) {
					const players: GameHistoryPlayerDatabaseEntry[] = Core.allPlayers.map((playerInGame) => ({
						id: playerInGame.player.id,
						groupId: playerInGame.group.id,
						username: playerInGame.player.username,
					}))
					if (typeof entityId === 'string') {
						variableValue = getEntityName(entityId, players, 'game')
					} else {
						variableValue = entityId
					}
				}

				const regexp = new RegExp('{' + variableName + '}', 'g')
				replacedText = replacedText.replace(regexp, `<b>${variableValue.toString()}</b>`)
			}

			return replacedText
		},

		getTemplateVariables(template: string): string[] {
			const regexp = new RegExp('{([a-zA-Z0-9]+)}', 'g')

			const matches: string[] = []
			let result
			while ((result = regexp.exec(template))) {
				const value = result[1]
				matches.push(value)
			}
			return matches
		},
	},
})
</script>

<style scoped lang="scss">
@import 'src/Vue/styles/generic';

.the-game-log-entry {
	.timestamp {
		font-weight: bold;
	}
}
</style>
