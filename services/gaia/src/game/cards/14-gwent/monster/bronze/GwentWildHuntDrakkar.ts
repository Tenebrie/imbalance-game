import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentWildHuntDrakkar extends ServerCard {
	public static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.WILD_HUNT, CardTribe.CONSTRUCT],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentWildHuntDrakkar.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Wild Hunt Drakkar',
				description: 'Boost all Wild Hunt allies by {boost}.<p>Whenever another Wild Hunt ally appears, boost it by {boost}.',
				flavor:
					"Waves pummel the shore, waves pushed by the prow of the spectral Naglfar. Hemdall's horn rings in the air, and Hemdall stands facing his enemies atop Bifrost, the burning rainbow. The White Frost is nigh, nigh is the time of gale and storm…",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const validAllies = game.board
				.getUnitsOwnedByGroup(owner.group)
				.filter((unit) => unit.card.tribes.includes(CardTribe.WILD_HUNT))
				.filter((unit) => unit.card !== this)

			validAllies.forEach((unit) => {
				game.animation.thread(() => {
					unit.buffs.add(BuffStrength, this)
				})
			})
		})

		this.createCallback(GameEventType.UNIT_CREATED, [CardLocation.BOARD])
			.require(({ owner }) => owner.owns(this))
			.require(({ triggeringCard }) => triggeringCard.tribes.includes(CardTribe.WILD_HUNT))
			.perform(({ triggeringCard }) => {
				triggeringCard.buffs.add(BuffStrength, this)
			})
	}
}
