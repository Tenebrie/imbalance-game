import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../models/ServerCard'
import ServerGame from '../../models/ServerGame'
import ServerUnit from '../../models/ServerUnit'
import BuffStrength from '../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import CardFaction from '@shared/enums/CardFaction'

export default class HeroGarellion extends ServerCard {
	powerPerMana = 2

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.ARCANE)
		this.basePower = 12
		this.dynamicTextVariables = {
			powerPerMana: this.powerPerMana
		}
	}

	onRoundEnded(thisUnit: ServerUnit): void {
		const consumedMana = thisUnit.owner.spellMana
		thisUnit.owner.setSpellMana(0)
		for (let i = 0; i < consumedMana * this.powerPerMana; i++) {
			thisUnit.buffs.add(new BuffStrength(), thisUnit.card, BuffDuration.INFINITY)
		}
	}
}
