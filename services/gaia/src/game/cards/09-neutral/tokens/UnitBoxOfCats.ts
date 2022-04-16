import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import UnitStrayCat from '@src/game/cards/09-neutral/tokens/UnitStrayCat'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class UnitBoxOfCats extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			features: [CardFeature.APATHY],
			stats: {
				power: 0,
				armor: 5,
			},
			relatedCards: [UnitStrayCat],
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: 'Box of Cats',
				description: '*Nightfall:*\n*Summon* two *Stray Cats*.',
			},
		})

		this.createEffect(GameEventType.UNIT_NIGHTFALL)
			.require(({ triggeringCard }) => triggeringCard === this)
			.perform(({ triggeringUnit }) => {
				Keywords.summonMultipleUnits({
					owner: this.ownerPlayer,
					cardConstructor: UnitStrayCat,
					rowIndex: triggeringUnit.rowIndex,
					unitIndex: triggeringUnit.unitIndex,
					count: 2,
				})
			})
	}
}
