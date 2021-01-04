import ResolveStackEntry from '../../ResolveStackEntry'
import OwnedCardMessage from '../ownedCard/OwnedCardMessage'
import CardTargetMessage from '../CardTargetMessage'
import OpenOwnedCardMessage from '../ownedCard/OpenOwnedCardMessage'

export default class ResolveStackEntryMessage {
	ownedCard: OwnedCardMessage
	targetsSelected: CardTargetMessage[]

	constructor(entry: ResolveStackEntry) {
		this.ownedCard = new OpenOwnedCardMessage(entry.ownedCard)
		this.targetsSelected = entry.previousTargets.map((target) => new CardTargetMessage(target.target))
	}
}
