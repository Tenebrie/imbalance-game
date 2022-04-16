import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class UnitAulerianInquisitor extends ServerCard {
	buffsRequired = 20

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.NOBLE],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			buffsRequired: this.buffsRequired,
		}

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetCard }) => targetCard.ownerPlayer !== this.ownerPlayer)
			.require(({ targetCard }) => targetCard.buffs.anyDispellable.length >= this.buffsRequired)
			.perform(({ targetUnit }) => {
				Keywords.destroy.unit(targetUnit).withSource(this)
			})
	}
}
