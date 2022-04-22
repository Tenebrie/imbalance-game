import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { asSplashUnitDamage } from '@src/utils/LeaderStats'

import { DamageInstance } from '../../../models/ServerDamageSource'

export default class HeroCarienne extends ServerCard {
	damagePerWave = asSplashUnitDamage(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.WILD,
			stats: {
				power: 12,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damagePerWave: this.damagePerWave,
			waveCount: () => this.waveCount,
		}
		this.addRelatedCards().requireTribe(CardTribe.STORM)

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onUnitDeploy())
	}

	get waveCount(): number {
		let stormsPlayed = 0
		const owner = this.ownerPlayerNullable
		if (owner) {
			stormsPlayed = owner.cardGraveyard.findCardsByTribe(CardTribe.STORM).length
		}

		return stormsPlayed + 1
	}

	private onUnitDeploy(): void {
		const enemies = this.game.board.getSplashableUnitsForOpponentOf(this)

		for (let i = 0; i < this.waveCount; i++) {
			enemies.forEach((enemy) => {
				this.game.animation.createAnimationThread()
				enemy.dealDamage(DamageInstance.fromCard(this.damagePerWave, this))
				this.game.animation.commitAnimationThread()
			})
			this.game.animation.syncAnimationThreads()
		}
	}
}
