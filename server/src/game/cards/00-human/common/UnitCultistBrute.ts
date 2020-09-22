import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import TargetType from '@shared/enums/TargetType'
import CardTribe from '@shared/enums/CardTribe'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerUnit from '../../../models/ServerUnit'
import BuffStrength from '../../../buffs/BuffStrength'

export default class UnitCultistBrute extends ServerCard {
	bonusPower = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			tribes: CardTribe.CULTIST,
			faction: CardFaction.HUMAN,
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 11,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower
		}

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.requireAlliedUnit()
			.requireNotSelf()

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD)
			.perform(({ targetCard }) => this.onSacrificeTargetSelected(targetCard.unit!))
	}

	private onSacrificeTargetSelected(target: ServerUnit): void {
		this.game.board.destroyUnit(target, this)
		this.buffs.addMultiple(BuffStrength, this.bonusPower, this)
	}
}
