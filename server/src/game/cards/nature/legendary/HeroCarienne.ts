import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import GameEventType from '@shared/enums/GameEventType'
import CardTribe from '@shared/enums/CardTribe'
import CardFeature from '@shared/enums/CardFeature'

export default class HeroCarienne extends ServerCard {
	damagePerWave = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NATURE,
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 6,
			}
		})
		this.dynamicTextVariables = {
			damagePerWave: this.damagePerWave,
			waveCount: () => this.waveCount
		}
		this.addRelatedCards().requireTribe(CardTribe.STORM)

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onUnitDeploy())
	}

	get waveCount(): number {
		let stormsPlayed = 0
		if (this.owner) {
			stormsPlayed = this.owner.cardGraveyard.findCardsByTribe(CardTribe.STORM).length
		}

		return stormsPlayed + 1
	}

	private onUnitDeploy(): void {
		const enemies = this.game.board.getUnitsOwnedByOpponent(this.unit.owner)

		for (let i = 0; i < this.waveCount; i++) {
			enemies.forEach(enemy => enemy.dealDamage(ServerDamageInstance.fromUnit(this.damagePerWave, this.unit)))
		}
	}
}
