import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import GameHookType, {CardTakesDamageHookArgs, CardTakesDamageHookValues} from '../../../models/GameHookType'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import SpellFleetingSpark from '../tokens/SpellFleetingSpark'
import CardLibrary from '../../../libraries/CardLibrary'

export default class HeroSparklingSpirit extends ServerCard {
	extraDamage = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.ARCANE)
		this.basePower = 8
		this.dynamicTextVariables = {
			extraDamage: this.extraDamage
		}
		this.baseRelatedCards = [SpellFleetingSpark]
		this.addRelatedCards().requireTribe(CardTribe.SPARK)

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())

		this.createHook<CardTakesDamageHookValues, CardTakesDamageHookArgs>(GameHookType.CARD_TAKES_DAMAGE, [CardLocation.BOARD])
			.require(({ damageInstance }) => damageInstance.sourceCard.tribes.includes(CardTribe.SPARK))
			.replace(values => this.onSparkDealsDamage(values))
	}

	private onDeploy(): void {
		const card = CardLibrary.instantiateByConstructor(this.game, SpellFleetingSpark)
		this.owner.cardHand.addSpell(card)
	}

	private onSparkDealsDamage(values: CardTakesDamageHookValues): CardTakesDamageHookValues {
		const newDamageInstance = values.damageInstance.clone()
		newDamageInstance.value = newDamageInstance.value + this.extraDamage
		return {
			...values,
			damageInstance: newDamageInstance
		}
	}
}
