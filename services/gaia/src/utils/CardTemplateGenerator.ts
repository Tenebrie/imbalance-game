import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import { cardColorToString, cardFactionToString } from '@shared/Utils'
import fs from 'fs'

export type CardTemplateGeneratorArgs = {
	type: CardType
	color: CardColor
	faction: CardFaction
	power: number
	armor: number
	name: string
	tribes: string
	description: string
	flavor: string
}

export const generateCardTemplate = (args: CardTemplateGeneratorArgs): string => {
	const { type, color, faction, power, armor, name, tribes, description, flavor } = args

	const filteredName = name.replace(/[^a-zA-Z0-9]+/g, '')
	const cardClass = `gwent${filteredName}`
	const capitalizedCardClass = cardClass.substring(0, 1).toUpperCase() + cardClass.substring(1)

	const colorFolder = cardColorToString(color)
	const factionFolder = cardFactionToString(faction)

	const targetFolder = `/app/services/gaia/src/game/cards/14-gwent/${factionFolder}/${colorFolder}`
	if (!fs.existsSync(targetFolder)) {
		throw new Error(`Folder ${targetFolder} does not exist.`)
	}

	const cardTypeString = type === CardType.UNIT ? 'UNIT' : 'SPELL'
	const cardTribesString = tribes
		.split(' ')
		.map((tribe) => `CardTribe.${tribe.trim().toUpperCase()}`)
		.join(', ')

	const statsString = type === CardType.SPELL ? `cost: 0,\n				unitCost: 1,` : `power: ${power},\n				armor: ${armor},`

	const cardVariables: { name: string; value: number; matchLength: number; matchPosition: number }[] = []

	const variableRegex = /{{([^}]+=[^}]+)}}/g

	let variableMatch = variableRegex.exec(description)
	while (variableMatch) {
		console.log(variableMatch[0])
		const match = variableMatch[1]
		const variableName = match.split('=')[0].trim()
		const variableValue = match.split('=')[1].trim()
		console.log(match)
		cardVariables.push({
			name: variableName,
			value: Number(variableValue),
			matchLength: variableMatch[0].length,
			matchPosition: variableMatch.index,
		})
		variableMatch = variableRegex.exec(description)
	}

	const processedDescription = cardVariables
		.slice()
		.reverse()
		.reduce((input, variable) => {
			return (
				input.slice(0, variable.matchPosition) +
				`*\$\{${capitalizedCardClass}.${variable.name.toUpperCase()}\}*` +
				input.slice(variable.matchPosition + variable.matchLength)
			)
		}, description)

	const varsString = cardVariables
		.map((variable) => `public static readonly ${variable.name.toUpperCase()} = ${variable.value}`)
		.join('\n	')
		.concat(cardVariables.length > 0 ? '\n\n	' : '')

	const cardContent = BASE_CARD_TEMPLATE.replace('{{CLASS}}', capitalizedCardClass)
		.replace('{{TYPE}}', cardTypeString)
		.replace('{{COLOR}}', colorFolder.toUpperCase())
		.replace('{{FACTION}}', factionFolder.toUpperCase())
		.replace('{{NAME}}', name.trim())
		.replace('{{DESCRIPTION}}', processedDescription.trim())
		.replace('{{FLAVOR}}', flavor.trim())
		.replace('{{TRIBES}}', cardTribesString)
		.replace('{{STATS}}', statsString)
		.replace('{{VARS}}', varsString)

	const targetFileName = `${targetFolder}/${capitalizedCardClass}.ts`
	if (fs.existsSync(targetFileName)) {
		throw new Error(`File ${targetFileName} already exists.`)
	}
	fs.writeFileSync(targetFileName, cardContent)
	fs.chmodSync(targetFileName, '777')

	return cardClass
}

const BASE_CARD_TEMPLATE = `import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class {{CLASS}} extends ServerCard {
	{{VARS}}constructor(game: ServerGame) {
		super(game, {
			type: CardType.{{TYPE}},
			color: CardColor.{{COLOR}},
			faction: CardFaction.{{FACTION}},
			tribes: [{{TRIBES}}],
			stats: {
				{{STATS}}
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: \`{{NAME}}\`,
				description: \`{{DESCRIPTION}}\`,
				flavor: \`{{FLAVOR}}\`,
			},
		})
	}
}
`
