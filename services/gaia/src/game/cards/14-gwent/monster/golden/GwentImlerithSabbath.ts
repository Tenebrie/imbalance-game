import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffExtraArmor from '@src/game/buffs/BuffExtraArmor'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentImlerithSabbath extends ServerCard {
	public static readonly POST_HEAL = 2
	public static readonly POST_ARMOR = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			tribes: [CardTribe.WILD_HUNT, CardTribe.OFFICER],
			faction: CardFaction.MONSTER,
			stats: {
				power: 5,
				armor: 2,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			postHeal: GwentImlerithSabbath.POST_HEAL,
			postArmor: GwentImlerithSabbath.POST_ARMOR,
		}

		this.createLocalization({
			en: {
				name: 'Imlerith: Sabbath',
				description:
					'Every turn, *Duel* the *Highest* enemy on turn end.<p>If this unit survives, *Heal* it by {postHeal} and give it {postArmor} *Armor*.',
				flavor: "The sisters said you would come. They saw you arrive in the water's surface.",
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => {
				const sortedUnits = game.board.getUnitsOwnedByOpponent(this)
				const highestPower = sortedUnits[0].card.stats.power
				const highestUnits = sortedUnits.filter((unit) => unit.card.stats.power === highestPower)
				const target = getRandomArrayValue(highestUnits)

				for (let i = 0; i < 100; i++) {
					target.dealDamage(DamageInstance.fromCard(this.stats.power, this))
					if (target.card.stats.power <= 0) {
						break
					}

					this.dealDamage(DamageInstance.fromCard(target.card.stats.power, target.card))
					if (this.stats.power <= 0) {
						break
					}
				}
				if (this.stats.power > 0) {
					game.animation.thread(() => {
						this.heal(DamageInstance.fromCard(GwentImlerithSabbath.POST_HEAL, this))
					})
					game.animation.thread(() => {
						this.buffs.addMultiple(BuffExtraArmor, GwentImlerithSabbath.POST_ARMOR, this)
					})
					game.animation.syncAnimationThreads()
				}
			})
	}
}
