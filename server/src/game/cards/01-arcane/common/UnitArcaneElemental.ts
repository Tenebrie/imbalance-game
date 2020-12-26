import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import BotCardEvaluation from '../../../AI/BotCardEvaluation'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '../../../../utils/Keywords'

export default class UnitArcaneElemental extends ServerCard {
	manaGenerated = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.ELEMENTAL],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			manaGenerated: this.manaGenerated,
		}
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())
	}

	private onDeploy() {
		Keywords.generateMana(this, this.manaGenerated)
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		const card = this.card as UnitArcaneElemental
		return card.stats.power + card.manaGenerated * 2
	}
}
