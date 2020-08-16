import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import BotCardEvaluation from '../../../AI/BotCardEvaluation'

export default class UnitArcaneElemental extends ServerCard {
	manaGenerated = 2

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.ARCANE)
		this.basePower = 7
		this.baseTribes = [CardTribe.ELEMENTAL]
		this.dynamicTextVariables = {
			manaGenerated: this.manaGenerated
		}
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY]
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy() {
		const player = this.owner
		player.setSpellMana(player.spellMana + this.manaGenerated)
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		const card = this.card as UnitArcaneElemental
		return card.power + card.manaGenerated * 2
	}
}
