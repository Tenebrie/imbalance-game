import { render } from '@testing-library/vue'

import { setupIntersectionObserverMock } from '@/jest/mocks'
import GameObjectiveStore from '@/Vue/store/GameObjectiveStore'

import PixiUserInterface from './PixiUserInterface.vue'

describe('PixiUserInterface.vue', () => {
	beforeEach(() => {
		setupIntersectionObserverMock()
	})

	describe('game objective', () => {
		describe('when present', () => {
			beforeEach(() => {
				GameObjectiveStore.commit.setObjective({
					en: {
						title: 'Test objective',
						description: 'Objective',
					},
				})
				GameObjectiveStore.commit.show()
			})

			it('the button is rendered', () => {
				const { getByAltText } = render(PixiUserInterface)
				expect(getByAltText('Game objective button')).toBeVisible()
			})

			it('the objective container is rendered', () => {
				const { getByTestId } = render(PixiUserInterface)
				expect(getByTestId('objective-container')).toBeVisible()
			})
		})

		describe('when not present', () => {
			it('the button is not rendered', () => {
				const { getByAltText } = render(PixiUserInterface)
				expect(() => getByAltText('Game objective button')).toThrow()
			})

			it('the objective container is not rendered', () => {
				const { getByTestId } = render(PixiUserInterface)
				expect(() => getByTestId('objective-container')).toThrow()
			})
		})
	})
})
