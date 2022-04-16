import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerAnimation from '@src/game/models/ServerAnimation'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getConstructorFromCard } from '@src/utils/Utils'

export default class GwentNekkerWarrior extends ServerCard {
	public static readonly EXTRA_COPIES = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.OGROID],
			stats: {
				power: 9,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			extraCopies: GwentNekkerWarrior.EXTRA_COPIES,
		}

		this.createLocalization({
			en: {
				name: 'Nekker Warrior',
				description: 'Choose a Bronze ally and add {copiesToAdd} copies of it to the bottom of your deck.',
				flavor: "Take heed, gents, there's nekkers under this here bridge.",
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.require(({ targetUnit }) => targetUnit.card.color === CardColor.BRONZE)
			.perform(({ targetUnit }) => {
				game.animation.play(ServerAnimation.cardInfuse(this))
				for (let i = 0; i < GwentNekkerWarrior.EXTRA_COPIES; i++) {
					Keywords.addCardToDeck(this.ownerPlayer, getConstructorFromCard(targetUnit.card))
				}
			})
	}
}
