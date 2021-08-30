import TargetMode from '../../enums/TargetMode'
import AnonymousTarget from '../AnonymousTarget'
import AnonymousTargetMessage from './AnonymousTargetMessage'

export default class AnonymousTargetsMessage {
	targetMode: TargetMode
	targets: AnonymousTargetMessage[]

	public constructor(targetMode: TargetMode, targets: AnonymousTarget[]) {
		const messages = targets.map((target) => new AnonymousTargetMessage(target))

		this.targetMode = targetMode
		this.targets = messages
	}
}
