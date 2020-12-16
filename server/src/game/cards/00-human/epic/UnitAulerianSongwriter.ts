import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '../../../buffs/BuffStrength'
import CardFeature from '@shared/enums/CardFeature'

export default class UnitAulerianSongwriter extends ServerCard {
	bonusPower = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.HUMAN],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			bonusPower: this.bonusPower,
		}

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT)
			.perform(({ targetCard }) => this.onDeploy(targetCard))
	}

	private onDeploy(targetCard: ServerCard): void {
		this.createSelector()
			.requireTarget(({ target }) => target.class === targetCard.class)
			.onSelected(({ target }) => target.buffs.addMultiple(BuffStrength, this.bonusPower, null))
			.onReleased(({ target }) => target.buffs.remove(BuffStrength, this.bonusPower))
	}
}
