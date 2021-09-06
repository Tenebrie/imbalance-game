import store from '@/Vue/store'
import { assembleNotification, NotificationWrapper, TemporaryNotificationProps } from '@/Vue/store/modules/NotificationModule'

const obj = {
	info(text: string): NotificationWrapper {
		const item = assembleNotification({
			type: 'info',
			text,
			actions: [],
			timeout: 2000,
			persistent: false,
		})
		store.dispatch.notifications.sendNotification(item)
		return item
	},

	success(text: string): NotificationWrapper {
		const item = assembleNotification({
			type: 'success',
			text,
			actions: [],
			timeout: 2000,
			persistent: false,
		})
		store.dispatch.notifications.sendNotification(item)
		return item
	},

	warning(text: string): NotificationWrapper {
		const item = assembleNotification({
			type: 'warning',
			text,
			actions: [],
			timeout: 3000,
			persistent: false,
		})
		store.dispatch.notifications.sendNotification(item)
		return item
	},

	error(text: string, args: Partial<TemporaryNotificationProps> = {}): NotificationWrapper {
		const item = assembleNotification({
			type: 'error',
			text,
			actions: [],
			timeout: 5000,
			...args,
			persistent: false,
		})
		store.dispatch.notifications.sendNotification(item)
		return item
	},

	loading(text: string): NotificationWrapper {
		const item = assembleNotification({
			type: 'info',
			text,
			actions: [],
			persistent: true,
		})
		store.dispatch.notifications.sendNotification(item)
		return item
	},

	connectionLost(text: string): NotificationWrapper {
		const item = assembleNotification({
			type: 'error',
			text,
			actions: [],
			persistent: true,
		})
		store.dispatch.notifications.sendNotification(item)
		return item
	},
}

export default obj
