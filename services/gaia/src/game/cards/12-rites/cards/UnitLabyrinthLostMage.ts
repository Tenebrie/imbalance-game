import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import SpellLabyrinthMagicArrow from '@src/game/cards/12-rites/tokens/SpellLabyrinthMagicArrow'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitLabyrinthLostMage extends ServerCard {
	public static readonly INFUSE_COST = 3
	public static readonly CARDS_CREATED = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.LOST],
			relatedCards: [SpellLabyrinthMagicArrow],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.RITES,
		})
		this.addRelatedCards().requireTribe(CardTribe.SPARK)
		this.dynamicTextVariables = {
			infuseCost: UnitLabyrinthLostMage.INFUSE_COST,
			cardsCreated: UnitLabyrinthLostMage.CARDS_CREATED,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.requireImmediate(({ owner }) => owner.spellMana >= UnitLabyrinthLostMage.INFUSE_COST)
			.perform(() => onDeploy())

		const onDeploy = (): void => {
			Keywords.infuse(this, UnitLabyrinthLostMage.INFUSE_COST)
			for (let i = 0; i < UnitLabyrinthLostMage.CARDS_CREATED; i++) {
				this.game.animation.thread(() => Keywords.createCard.forOwnerOf(this).fromConstructor(SpellLabyrinthMagicArrow))
			}
			this.game.animation.syncAnimationThreads()
		}
	}
}
