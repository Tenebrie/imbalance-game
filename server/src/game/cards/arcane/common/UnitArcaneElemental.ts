import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEvent from '../../../models/GameEvent'

export default class UnitArcaneElemental extends ServerCard {
	manaGenerated = 2

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.ARCANE)
		this.basePower = 7
		this.baseTribes = [CardTribe.ELEMENTAL]
		this.dynamicTextVariables = {
			manaGenerated: this.manaGenerated
		}

		this.createCallback(GameEvent.EFFECT_UNIT_DEPLOY)
			.perform(() => this.onDeploy())
	}

	private onDeploy() {
		const player = this.owner
		player.setSpellMana(player.spellMana + this.manaGenerated)
	}
}
