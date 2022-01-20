import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import HeroTroviar from '@src/game/cards/00-human/legendary/HeroTroviar'
import { asDirectHealingPotency } from '@src/utils/LeaderStats'

import ServerCard from '../../../models/ServerCard'
import { DamageInstance } from '../../../models/ServerDamageSource'
import ServerGame from '../../../models/ServerGame'

export default class TutorialHeroTroviar extends ServerCard {
	selfDamage = 40
	powerRestored = asDirectHealingPotency(10)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			stats: {
				power: 50,
			},
			sharedArtwork: HeroTroviar,
			expansionSet: ExpansionSet.TUTORIAL,
		})
		this.dynamicTextVariables = {
			selfDamage: this.selfDamage,
			powerRestored: this.powerRestored,
		}

		this.createLocalization({
			en: {
				name: 'Troviar',
				title: 'The Torturer',
				description: 'Whenever another unit takes damage, *Heal* {powerRestored} to self.<p>*Deploy:*\nDeal {selfDamage} Damage to self.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.dealDamage(DamageInstance.fromCard(this.selfDamage, this))
		})

		this.createCallback(GameEventType.CARD_TAKES_DAMAGE, [CardLocation.BOARD, CardLocation.STACK])
			.require(({ triggeringCard }) => triggeringCard !== this)
			.require(() => this.stats.power < this.stats.maxPower)
			.perform(() => {
				this.heal(DamageInstance.fromCard(this.powerRestored, this))
			})
	}
}
