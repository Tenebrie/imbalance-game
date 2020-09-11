import BuffMessage from '../buffs/BuffMessage'

export default interface BuffContainerMessage {
	cardId: string
	buffs: BuffMessage[]
}
