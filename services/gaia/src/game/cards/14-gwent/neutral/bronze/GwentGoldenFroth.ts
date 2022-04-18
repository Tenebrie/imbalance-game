import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffGwentRowFroth from '@src/game/buffs/14-gwent/BuffGwentRowFroth'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentGoldenFroth extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.BOON],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: BuffGwentRowFroth.BOOST,
			targets: BuffGwentRowFroth.TARGETS,
		}

		this.createLocalization({
			en: {
				name: 'Golden Froth',
				description: 'Apply a Boon to an allied row that boosts {targets} random units by {boost} on turn start.',
				flavor: "Smell that? That's the smell of happiness.",
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireAllied()
			.perform(({ targetRow }) => {
				targetRow.buffs.add(BuffGwentRowFroth, this)
			})
	}
}
