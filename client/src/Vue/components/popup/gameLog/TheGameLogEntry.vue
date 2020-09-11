<template>
	<div class="the-game-log-entry">
		<span class="timestamp">{{ timestamp }}</span> - <span v-html="message" />
	</div>
</template>

<script lang="ts">
import moment from 'moment'
import Core from '@/Pixi/Core'
import Localization from '@/Pixi/Localization'
import GameEventType from '@shared/enums/GameEventType'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import {PropType} from '@vue/composition-api'
import store from '@/Vue/store'

export default {
	props: {
		entry: {
			type: Object as PropType<EventLogEntryMessage>,
			required: true
		}
	},

	computed: {
		timestamp(): string {
			return moment(this.entry.timestamp).format('HH:mm:ss')
		},

		message(): string {
			const entry = this.entry as EventLogEntryMessage
			const subtype = entry.subtype ? `.${entry.subtype}` : this.getCustomSubtype(entry)
			return this.populateTemplate(Localization.get(`log.entry.${entry.event}${subtype}`), entry.args)
		}
	},

	methods: {
		getCustomSubtype(entry: EventLogEntryMessage): string {
			if (entry.event === GameEventType.CARD_DRAWN) {
				const card = Core.game.findCardById(entry.args.triggeringCard)
				if (!card.name) {
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
					variableValue = this.getEntityName(entityId)
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
			while (result = regexp.exec(template)) {
				const value = result[1]
				matches.push(value)
			}
			return matches
		},

		getEntityName(id: string): string {
			const localizedString = Localization.get(id)
			if (localizedString && localizedString !== id) {
				return localizedString
			}
			if (Core.player.player.id === id) {
				return Core.player.player.username
			}
			if (Core.opponent && Core.opponent.player.id === id) {
				return Core.opponent.player.username
			}
			const card = Core.game.findCardById(id)
			if (card) {
				return `${Localization.get(card.name)}`
			}
			const cardInLibrary = store.state.editor.cardLibrary.find(card => card.id === id)
			if (cardInLibrary) {
				return `${Localization.get(cardInLibrary.name)}`
			}
			const buff = Core.game.findBuffById(id)
			if (buff) {
				return `${Localization.get(buff.name)}`
			}
			return id
		}
	}
}
</script>

<style scoped lang="scss">
	@import "src/Vue/styles/generic";

	.the-game-log-entry {
		.timestamp {
			font-weight: bold;
		}
	}
</style>
