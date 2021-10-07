import AccessLevel from '@shared/enums/AccessLevel'
import { createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import TextureAtlas from '@/Pixi/render/TextureAtlas'
import LocalStorage from '@/utils/LocalStorage'
import store from '@/Vue/store'

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

const requireAuthentication = async (next: NavigationGuardNext, beforeContinue?: () => void): Promise<void> => {
	if (store.state.isLoggedIn || (await fetchProfile())) {
		if (beforeContinue) {
			beforeContinue()
		}
		next()
		return
	}
	next({ name: 'login' })
}

const requireAdminAccess = async (next: NavigationGuardNext): Promise<void> => {
	if (
		(store.state.isLoggedIn || (await fetchProfile())) &&
		store.state.player &&
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

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/login',
			name: 'login',
			component: () => import('@/Vue/views/LoginView.vue'),
			beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
				requireNoAuthentication(next)
			},
		},
		{
			path: '/register',
			name: 'register',
			component: () => import('@/Vue/views/RegisterView.vue'),
			beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
				requireNoAuthentication(next)
			},
		},
		{
			path: '/',
			name: 'home',
			component: () => import('@/Vue/views/HomeView.vue'),
			beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
				requireAuthentication(next)
			},
		},
		{
			path: '/decks',
			component: () => import('@/Vue/views/EditorView.vue'),
			beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
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
			beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
				requireAuthentication(next)
			},
		},
		{
			path: '/workshop',
			name: 'workshop',
			component: () => import('@/Vue/components/workshop/WorkshopView.vue'),
			beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
				requireAuthentication(next, async () => {
					await store.dispatch.editor.loadCardLibrary()
					await TextureAtlas.preloadComponents()
				})
			},
		},
		{
			path: '/feedback',
			name: 'feedback',
			component: () => import('@/Vue/components/feedback/FeedbackView.vue'),
			beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
				requireAuthentication(next)
			},
		},
		{
			path: '/game',
			name: 'game',
			component: () => import('@/Vue/views/GameView.vue'),
			beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
				if (!store.state.currentGame) {
					next('/')
					return
				}
				requireAuthentication(next)
			},
		},
		{
			path: '/ds/:deckId',
			component: () => import('@/Vue/components/editor/SharedDeckImporter.vue'),
			beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
				requireAuthentication(next)
			},
		},
		{
			path: '/admin',
			name: 'admin',
			component: () => import('@/Vue/views/AdminView.vue'),
			beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
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
					component: () => import('@/Vue/components/admin/AdminCardsView.vue'),
				},
				{
					path: '/admin/cards/:cardId',
					name: 'admin-card-details',
					component: () => import('@/Vue/components/admin/cardDetails/AdminCardDetailsView.vue'),
				},
				{
					path: '/admin/stats',
					name: 'admin-stats',
					component: () => import('@/Vue/components/admin/AdminPlayerView.vue'),
				},
			],
		},
	],
})

export default router
