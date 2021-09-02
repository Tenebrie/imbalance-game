import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import UnitShadow from '@src/game/cards/01-arcane/tokens/UnitShadow'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'

import BuffStrength from '../../../../buffs/BuffStrength'
import CardLibrary from '../../../../libraries/CardLibrary'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'

export default class SpellNightmareDrain extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_POWER],
			relatedCards: [UnitShadow],
			stats: {
				cost: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createLocalization({
			en: {
				name: 'Living Nightmare',
				description:
					'Choose a damaged unit.<p>Summon a *Shadow* on your front row.\nIt gains bonus Power equal to Power the target misses.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.require((args) => args.targetCard.stats.power < args.targetCard.stats.basePower)
			.perform(({ player, targetCard }) => this.onTargetSelected(player, targetCard.unit!))

		/* Create basic unit if no target available */
		this.createEffect(GameEventType.SPELL_DEPLOYED)
			.require(() => this.game.cardPlay.getDeployTargets().length === 0)
			.perform(({ owner }) => {
				const shadowspawn = CardLibrary.instantiate(this.game, UnitShadow)
				const targetRow = this.game.board.getRowWithDistanceToFront(this.ownerPlayer, 0)
				this.game.board.createUnit(shadowspawn, owner, targetRow.index, targetRow.cards.length)
			})
	}

	private onTargetSelected(owner: ServerPlayerInGame, target: ServerUnit): void {
		const shadowspawn = CardLibrary.instantiate(this.game, UnitShadow)
		const targetRow = this.game.board.getRowWithDistanceToFront(this.ownerPlayer, 0)
		const shadowspawnUnit = this.game.board.createUnit(shadowspawn, owner, targetRow.index, targetRow.cards.length)
		if (!shadowspawnUnit) {
			return
		}

		const missingHealth = target.card.stats.basePower - target.card.stats.power
		shadowspawnUnit.buffs.addMultiple(BuffStrength, missingHealth, shadowspawn, BuffDuration.INFINITY)
	}
}
