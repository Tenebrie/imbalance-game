import { Component } from 'vue'
import { defineModule } from 'direct-vuex'
import { moduleActionContext } from '@/Vue/store'
import { markRaw } from 'vue'
import { EmptyFunction } from '@shared/Utils'

type ComponentInStack = {
	component: Component
	sticky?: boolean
	debug?: boolean
	params?: Record<string, string> | undefined
	onConfirm?: () => void
}

const PopupModule = defineModule({
	namespaced: true,
	state: {
		componentStack: [] as ComponentInStack[],
	},

	mutations: {
		pushComponent(state, component: ComponentInStack): void {
			state.componentStack.push(component)
		},

		popComponent(state): void {
			state.componentStack.pop()
		},

		clearComponents(state): void {
			state.componentStack = state.componentStack.filter((component) => component.debug)
		},
	},

	getters: {
		component: (state): Component | null => {
			if (state.componentStack.length === 0) {
				return null
			}
			return state.componentStack[state.componentStack.length - 1].component
		},

		sticky: (state): boolean => {
			if (state.componentStack.length === 0) {
				return false
			}
			return !!state.componentStack[state.componentStack.length - 1].sticky
		},

		params: (state): Record<string, string> | undefined => {
			if (state.componentStack.length === 0) {
				return undefined
			}
			return state.componentStack[state.componentStack.length - 1].params
		},

		onConfirm: (state): (() => void) => {
			if (state.componentStack.length === 0) {
				return EmptyFunction
			}
			return state.componentStack[state.componentStack.length - 1].onConfirm || EmptyFunction
		},
	},

	actions: {
		open(context, payload: ComponentInStack): void {
			const { commit } = moduleActionContext(context, PopupModule)
			commit.pushComponent({
				...payload,
				component: markRaw(payload.component),
			})
		},

		close(context): void {
			const { commit } = moduleActionContext(context, PopupModule)
			commit.popComponent()
		},

		closeAll(context): void {
			const { commit } = moduleActionContext(context, PopupModule)
			commit.clearComponents()
		},
	},
})

export default PopupModule
