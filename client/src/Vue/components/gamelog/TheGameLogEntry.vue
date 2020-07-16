<template>
	<div class="the-game-log-entry">
		<span class="timestamp">{{ timestamp }}</span> - <span v-html="message" />
	</div>
</template>

<script lang="ts">
import moment from 'moment'
import Localization from '@/Pixi/Localization'
import EventLogEntryMessage from '@shared/models/network/EventLogEntryMessage'
import Core from '@/Pixi/Core'

export default {
	props: {
		entry: {
			type: Object as () => EventLogEntryMessage,
			required: true
		}
	},

	computed: {
		timestamp(): string {
			return moment(this.entry.timestamp).format('HH:mm:ss')
		},

		message(): string {
			const subtype = this.entry.subtype ? `.${this.entry.subtype}` : ''
			return this.populateTemplate(Localization.get(`log.entry.${this.entry.event}${subtype}`), this.entry.args)
		}
	},

	methods: {
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
