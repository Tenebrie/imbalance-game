import Vue from 'vue'
import store from '@/Vue/store'
import VueRouter, { Route } from 'vue-router'
import axios from 'axios'
import Player from '@shared/models/Player'
import LocalStorage from '@/utils/LocalStorage'

Vue.use(VueRouter)

const fetchProfile = async (): Promise<boolean> => {
	if (!LocalStorage.hasAuthCookie()) {
		return false
	}

	try {
		const response = await axios.get('/api/user')
		const player = response.data.data as Player
		store.commit.setPlayerData(player)
		await store.dispatch.userPreferencesModule.fetchPreferences()
	} catch (error) {
		return false
	}
	return true
}

const requireAuthentication = async (next: Function): Promise<void> => {
	if (store.state.isLoggedIn || await fetchProfile()) {
		next()
		return
	}
	next({ name: 'login' })
}

const requireNoAuthentication = async (next: Function): Promise<void> => {
	if (store.state.isLoggedIn || await fetchProfile()) {
		next({ name: 'home' })
		return
	}
	next()
}

const routes = [
	{
		path: '/login',
		name: 'login',
		component: () => import('@/Vue/views/LoginView.vue'),
		beforeEnter: (to: Route, from: Route, next: Function) => {
			requireNoAuthentication(next)
		}
	},
	{
		path: '/register',
		name: 'register',
		component: () => import('@/Vue/views/RegisterView.vue'),
		beforeEnter: (to: Route, from: Route, next: Function) => {
			requireNoAuthentication(next)
		}
	},
	{
		path: '/',
		name: 'home',
		component: () => import('@/Vue/views/HomeView.vue'),
		beforeEnter: (to: Route, from: Route, next: Function) => {
			requireAuthentication(next)
		}
	},
	{
		path: '/decks',
		component: () => import('@/Vue/views/EditorView.vue'),
		beforeEnter: (to: Route, from: Route, next: Function) => {
			requireAuthentication(next)
		},
		children: [
			{
				path: '',
				name: 'decks',
				component: () => import('@/Vue/components/editor/TheDeckList.vue'),
			},
			{
				path: '/decks/:deckId',
				name: 'single-deck',
				component: () => import('@/Vue/components/editor/EditorDeckCardList.vue'),
			},
		]
	},
	{
		path: '/rules',
		name: 'rules',
		component: () => import('@/Vue/views/RulesView.vue')
	},
	{
		path: '/profile',
		name: 'profile',
		component: () => import('@/Vue/views/ProfileView.vue'),
		beforeEnter: (to: Route, from: Route, next: Function) => {
			requireAuthentication(next)
		}
	},
	{
		path: '/game',
		name: 'game',
		component: () => import('@/Vue/views/GameView.vue'),
		beforeEnter: (to: Route, from: Route, next: Function) => {
			if (!store.state.selectedGameId) {
				next('/')
				return
			}
			requireAuthentication(next)
		}
	},
	{
		path: '/ds/:deckId',
		component: () => import('@/Vue/components/editor/SharedDeckImporter.vue'),
		beforeEnter: (to: Route, from: Route, next: Function) => {
			requireAuthentication(next)
		}
	}
]

const router = new VueRouter({
	mode: 'history',
	routes
})

export default router
