import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffDryadWolfspeakerEffect from '@src/game/buffs/02-wild/BuffDryadWolfspeakerEffect'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitDryadWolfspeaker extends ServerCard {
	public static readonly BEASTS_REQUIRED = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.WILD,
			tribes: [CardTribe.DRYAD],
			stats: {
				power: 12,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			beastsRequired: UnitDryadWolfspeaker.BEASTS_REQUIRED,
			bonusDamage: BuffDryadWolfspeakerEffect.BONUS_DAMAGE,
		}

		this.createSelector()
			.require(
				() =>
					game.board.getUnitsOwnedByGroup(this.ownerGroupNullable).filter((unit) => {
						return unit.card.tribes.includes(CardTribe.BEAST)
					}).length >= UnitDryadWolfspeaker.BEASTS_REQUIRED
			)
			.requireTarget(({ target }) => target === this)
			.provideSelf(BuffDryadWolfspeakerEffect)
	}
}
