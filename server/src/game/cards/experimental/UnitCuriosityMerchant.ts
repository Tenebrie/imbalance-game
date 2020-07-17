import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'

export default class UnitCuriosityMerchant extends ServerCard {
	spellDiscount = 3

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.EXPERIMENTAL)
		this.basePower = 5
		this.baseTribes = [CardTribe.HUMAN]
		this.dynamicTextVariables = {
			spellDiscount: this.spellDiscount
		}

		this.createCallback(GameEventType.EFFECT_UNIT_DEPLOY)
			.perform(() => this.onDeploy())
	}

	private onDeploy() {
		const player = this.owner
		// player.setSpellMana(player.spellMana + this.manaGenerated)
	}
}
