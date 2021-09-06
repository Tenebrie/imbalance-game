import { defineModule } from 'direct-vuex'
import { v4 as getRandomId } from 'uuid'

import store, { moduleActionContext } from '@/Vue/store'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export type NotificationProps = {
	type: NotificationType
	text: string
	actions: {
		text: string
		callback: () => void
	}[]
}

export type TemporaryNotificationProps = NotificationProps & {
	timeout: number
	persistent: false
}

export type PersistentNotificationProps = NotificationProps & {
	persistent: true
}

type StoredNotification = {
	id: string
	timestamp: Date
	discarded: boolean
}

export type TemporaryNotificationItem = StoredNotification & TemporaryNotificationProps
export type PersistentNotificationItem = StoredNotification & PersistentNotificationProps
export type NotificationItem = TemporaryNotificationItem | PersistentNotificationItem

export type NotificationWrapper = {
	data: NotificationItem
	setText(text: string): void
	discard(): void
	deleteImmediately(): void
}

export const assembleNotification = (payload: TemporaryNotificationProps | PersistentNotificationProps): NotificationWrapper => {
	const id = getRandomId()
	const timestamp = new Date()

	const setTextCallback = (text: string) => {
		store.commit.notifications.update({
			id,
			data: {
				text,
			},
		})
	}
	const discardCallback = () => {
		store.commit.notifications.discard(id)
		setTimeout(() => store.commit.notifications.delete(id), 300)
	}
	const deleteImmediatelyCallback = () => {
		store.commit.notifications.delete(id)
	}

	return {
		data: {
			id,
			timestamp,
			discarded: false,
			...payload,
		},
		setText: setTextCallback,
		discard: discardCallback,
		deleteImmediately: deleteImmediatelyCallback,
	}
}

const NotificationModule = defineModule({
	namespaced: true,
	state: {
		temporary: [] as TemporaryNotificationItem[],
		persistent: [] as PersistentNotificationItem[],
	},

	mutations: {
		addTemporary(state, value: TemporaryNotificationItem): void {
			state.temporary.push(value)
		},

		addPersistent(state, value: PersistentNotificationItem): void {
			state.persistent.push(value)
		},

		update(state, props: { id: string; data: Partial<NotificationProps> }): void {
			const temporaryItem = state.temporary.find((i) => i.id === props.id)
			if (temporaryItem) {
				const newItem = {
					...temporaryItem,
					...props.data,
				}
				state.temporary.splice(state.temporary.indexOf(temporaryItem), 1, newItem)
			}
			const persistentItem = state.persistent.find((i) => i.id === props.id)
			if (persistentItem) {
				const newItem = {
					...persistentItem,
					...props.data,
				}
				state.persistent.splice(state.persistent.indexOf(persistentItem), 1, newItem)
			}
		},

		discard(state, id: string): void {
			const item = state.temporary.find((i) => i.id === id) || state.persistent.find((i) => i.id === id)
			if (item) {
				item.discarded = true
			}
		},

		delete(state, id: string): void {
			state.temporary = state.temporary.filter((notification) => notification.id !== id)
			state.persistent = state.persistent.filter((notification) => notification.id !== id)
		},
	},

	actions: {
		sendNotification(context, payload: NotificationWrapper): void {
			const { state, commit } = moduleActionContext(context, NotificationModule)

			if (
				(payload.data.persistent && state.persistent.some((n) => n.text === payload.data.text)) ||
				(!payload.data.persistent &&
					state.temporary.some(
						(n) => n.text === payload.data.text && payload.data.timestamp.getTime() - n.timestamp.getTime() < n.timeout - 1000
					))
			) {
				return
			}

			if (payload.data.persistent) {
				commit.addPersistent(payload.data)
			} else {
				commit.addTemporary(payload.data)
				setTimeout(payload.discard, payload.data.timeout)
			}
		},
	},
})

export default NotificationModule
