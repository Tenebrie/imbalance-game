import Vue from 'vue'
import store from '@/Vue/store'
import VueRouter, { NavigationGuardNext, Route } from 'vue-router'
import LocalStorage from '@/utils/LocalStorage'
import AccessLevel from '@shared/enums/AccessLevel'

Vue.use(VueRouter)

const fetchProfile = async (): Promise<boolean> => {
	if (!LocalStorage.hasAuthCookie()) {
		return false
	}

	try {
		await store.dispatch.fetchUser()
		await store.dispatch.userPreferencesModule.fetchPreferences()
	} catch (error) {
		return false
	}
	return true
}

const requireAuthentication = async (next: NavigationGuardNext): Promise<void> => {
	if (store.state.isLoggedIn || (await fetchProfile())) {
		next()
		return
	}
	next({ name: 'login' })
}

const requireAdminAccess = async (next: NavigationGuardNext): Promise<void> => {
	if (
		(store.state.isLoggedIn || (await fetchProfile())) &&
		(store.state.player.accessLevel === AccessLevel.ADMIN || store.state.player.accessLevel === AccessLevel.SUPPORT)
	) {
		next()
		return
	}
	next({ name: 'home' })
}

const requireNoAuthentication = async (next: NavigationGuardNext): Promise<void> => {
	if (store.state.isLoggedIn || (await fetchProfile())) {
		next({ name: 'home' })
		return
	}
	next()
}

const router = new VueRouter({
	mode: 'history',
	routes: [
		{
			path: '/login',
			name: 'login',
			component: () => import('@/Vue/views/LoginView.vue'),
			beforeEnter: (to: Route, from: Route, next: NavigationGuardNext) => {
				requireNoAuthentication(next)
			},
		},
		{
			path: '/register',
			name: 'register',
			component: () => import('@/Vue/views/RegisterView.vue'),
			beforeEnter: (to: Route, from: Route, next: NavigationGuardNext) => {
				requireNoAuthentication(next)
			},
		},
		{
			path: '/',
			name: 'home',
			component: () => import('@/Vue/views/HomeView.vue'),
			beforeEnter: (to: Route, from: Route, next: NavigationGuardNext) => {
				requireAuthentication(next)
			},
		},
		{
			path: '/decks',
			component: () => import('@/Vue/views/EditorView.vue'),
			beforeEnter: (to: Route, from: Route, next: NavigationGuardNext) => {
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
			],
		},
		{
			path: '/rules',
			name: 'rules',
			component: () => import('@/Vue/views/RulesView.vue'),
		},
		{
			path: '/profile',
			name: 'profile',
			component: () => import('@/Vue/views/ProfileView.vue'),
			beforeEnter: (to: Route, from: Route, next: NavigationGuardNext) => {
				requireAuthentication(next)
			},
		},
		{
			path: '/game',
			name: 'game',
			component: () => import('@/Vue/views/GameView.vue'),
			beforeEnter: (to: Route, from: Route, next: NavigationGuardNext) => {
				if (!store.state.selectedGame) {
					next('/')
					return
				}
				requireAuthentication(next)
			},
		},
		{
			path: '/ds/:deckId',
			component: () => import('@/Vue/components/editor/SharedDeckImporter.vue'),
			beforeEnter: (to: Route, from: Route, next: NavigationGuardNext) => {
				requireAuthentication(next)
			},
		},
		{
			path: '/admin',
			name: 'admin',
			component: () => import('@/Vue/views/AdminView.vue'),
			beforeEnter: (to: Route, from: Route, next: NavigationGuardNext) => {
				requireAuthentication(next)
				requireAdminAccess(next)
			},
			redirect: { name: 'admin-games' },
			children: [
				{
					path: '/admin/games',
					name: 'admin-games',
					component: () => import('@/Vue/components/admin/AdminGamesView.vue'),
				},
				{
					path: '/admin/games/:gameId',
					name: 'admin-game-details',
					component: () => import('@/Vue/components/admin/gameDetails/AdminGameDetailsView.vue'),
				},
				{
					path: '/admin/users',
					name: 'admin-users',
					component: () => import('@/Vue/components/admin/AdminPlayerView.vue'),
				},
				{
					path: '/admin/users/:playerId',
					name: 'admin-player-details',
					component: () => import('@/Vue/components/admin/AdminPlayerDetailsView.vue'),
				},
				{
					path: '/admin/cards',
					name: 'admin-cards',
					// component: () => import('@/Vue/components/editor/EditorDeckCardList.vue'),
				},
				{
					path: '/admin/stats',
					name: 'admin-stats',
					// component: () => import('@/Vue/components/editor/EditorDeckCardList.vue'),
				},
			],
		},
	],
})

export default router
