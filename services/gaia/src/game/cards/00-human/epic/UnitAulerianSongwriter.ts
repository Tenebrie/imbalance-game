import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import BuffStrength from '../../../buffs/BuffStrength'

export default class UnitAulerianSongwriter extends ServerCard {
	public static readonly BONUS_POWER = 5
	bonusPower = UnitAulerianSongwriter.BONUS_POWER

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.NOBLE],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.perform(({ targetCard }) => this.onDeploy(targetCard))
	}

	private onDeploy(targetCard: ServerCard): void {
		this.createSelector()
			.requireTarget(({ target }) => target.class === targetCard.class)
			.provide(BuffStrength, this.bonusPower)
	}
}
