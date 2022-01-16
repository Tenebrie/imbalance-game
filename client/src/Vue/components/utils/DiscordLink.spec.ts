import { render } from '@testing-library/vue'

import DiscordLink from '@/Vue/components/utils/DiscordLink.vue'

describe('DiscordLink.vue', () => {
	it('renders correctly', () => {
		const { getByText } = render(DiscordLink, {
			slots: {
				default: 'Test value',
			},
		})
		expect(getByText('Test value')).toBeInTheDocument()
	})
})
