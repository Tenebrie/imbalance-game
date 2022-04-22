import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffGwentAmbush from '@src/game/buffs/14-gwent/BuffGwentAmbush'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentToruviel extends ServerCard {
	public static readonly BOOST = 2
	public static readonly UNIT_COUNT = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF, CardTribe.OFFICER],
			features: [CardFeature.AMBUSH],
			stats: {
				power: 6,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Toruviel`,
				description: `*Ambush*: When your opponent passes, flip over and boost *${GwentToruviel.BOOST}* units on each side by *${GwentToruviel.UNIT_COUNT}*.`,
				flavor: `I'd gladly kill you from up close, stare in your eyes… But you reek, human.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.buffs.add(BuffGwentAmbush, this)
		})

		this.createCallback(GameEventType.ROUND_ENDED, [CardLocation.BOARD])
			.require(() => this.isAmbush)
			.require(({ group }) => !group.owns(this))
			.perform(({}) => {
				Keywords.revealCard(this)
				const unit = game.board.getAllUnitsFor(this).find((unit) => unit.card === this)

				if (!unit) {
					return
				}

				unit.boardRow.getUnitsWithinHorizontalDistance(unit, GwentToruviel.UNIT_COUNT + 1).forEach((unit) => {
					if (unit.card === this) {
						return
					}

					if (!unit.card.features.includes(CardFeature.UNSPLASHABLE)) {
						unit.boost(GwentToruviel.BOOST, this)
					}
				})
			})
	}
}
