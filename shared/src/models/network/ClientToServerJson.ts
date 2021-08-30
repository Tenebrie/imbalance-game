import TargetMode from '../../enums/TargetMode'
import { ClientToServerMessageTypes } from './messageHandlers/ClientToServerMessageTypes'

export type ClientToServerJson = {
	type: ClientToServerMessageTypes
	data: Record<string, any> | TargetMode | null
}
