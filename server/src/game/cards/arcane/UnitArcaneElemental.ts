import CardType from '@shared/enums/CardType'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import ServerUnit from '../../models/ServerUnit'
import ServerBoardRow from '../../models/ServerBoardRow'
import CardTribe from '@shared/enums/CardTribe'

export default class UnitArcaneElemental extends ServerCard {
	manaGenerated = 2

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 7
		this.baseTribes = [CardTribe.ELEMENTAL]
		this.dynamicTextVariables = {
			manaGenerated: this.manaGenerated
		}
	}

	onPlayedAsUnit(thisUnit: ServerUnit, targetRow: ServerBoardRow): void {
		const player = thisUnit.owner
		player.setSpellMana(player.spellMana + this.manaGenerated)
	}
}
