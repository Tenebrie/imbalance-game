import TargetMode from '../enums/TargetMode'
import CardTarget from './CardTarget'
import OwnedCard from './OwnedCard'

export default interface ResolveStackEntry {
	targetMode: TargetMode
	ownedCard: OwnedCard
	previousTargets: {
		target: CardTarget
	}[]
}
