import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import SpellGatheringStorm from '../tokens/SpellGatheringStorm'
import ServerUnit from '../../../models/ServerUnit'
import ServerBoardRow from '../../../models/ServerBoardRow'
import ServerAnimation from '../../../models/ServerAnimation'
import ServerDamageInstance from '../../../models/ServerDamageSource'

export default class HeroCarienne extends ServerCard {
	damagePerWave = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.ARCANE)
		this.basePower = 6
		this.dynamicTextVariables = {
			damagePerWave: this.damagePerWave,
			waveCount: () => this.waveCount
		}
	}

	get waveCount() {
		let stormsPlayed = 0
		if (this.owner) {
			stormsPlayed = this.owner.cardGraveyard.findCardsByConstructor(SpellGatheringStorm).length
		}

		return stormsPlayed + 1
	}

	onPlayedAsUnit(thisUnit: ServerUnit, targetRow: ServerBoardRow): void {
		const enemies = this.game.board.getUnitsOwnedByOpponent(thisUnit.owner)

		for (let i = 0; i < this.waveCount; i++) {
			this.game.animation.play(ServerAnimation.unitAttacksUnits(thisUnit, enemies, this.damagePerWave))
			enemies.forEach(enemy => enemy.dealDamage(ServerDamageInstance.fromUnit(this.damagePerWave, thisUnit)))
		}
	}
}
