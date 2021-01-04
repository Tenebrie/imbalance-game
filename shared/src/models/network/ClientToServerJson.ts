import { ClientToServerMessageTypes } from './messageHandlers/ClientToServerMessageTypes'
import TargetMode from '../../enums/TargetMode'

export type ClientToServerJson = {
	type: ClientToServerMessageTypes
	data: Record<string, any> | TargetMode | null
}
