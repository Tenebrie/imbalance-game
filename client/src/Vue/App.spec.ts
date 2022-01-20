import { render } from '@testing-library/vue'

import App from '@/Vue/App.vue'

describe('App.vue', () => {
	it('renders correctly', () => {
		const { getByText } = render(App)
		expect(getByText('Home')).toBeInTheDocument()
	})
})
