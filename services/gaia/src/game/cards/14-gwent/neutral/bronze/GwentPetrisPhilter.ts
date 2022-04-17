import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getMultipleRandomArrayValues } from '@src/utils/Utils'

export default class GwentPetrisPhilter extends ServerCard {
	public static readonly BOOST = 2
	public static readonly TARGETS = 6

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY, CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentPetrisPhilter.BOOST,
			targets: GwentPetrisPhilter.BOOST,
		}

		this.createLocalization({
			en: {
				name: "Petri's Philter",
				description: 'Boost {targets} random allies by {boost}.',
				flavor: 'But that night, the moon was the color of blood.',
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const allies = game.board.getUnitsOwnedByGroup(owner.group)
			const targets = getMultipleRandomArrayValues(allies, GwentPetrisPhilter.TARGETS)
			targets.forEach((unit) => {
				game.animation.thread(() => {
					unit.buffs.addMultiple(BuffStrength, GwentPetrisPhilter.BOOST, this)
				})
			})
			game.animation.syncAnimationThreads()
		})
	}
}
