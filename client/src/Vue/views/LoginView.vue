<template>
	<div class="login">
		<the-login-form />
		<build-version-footer />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TheLoginForm from '../components/login/TheLoginForm.vue'
import BuildVersionFooter from '../components/utils/BuildVersionFooter.vue'

export default defineComponent({
	components: { TheLoginForm, BuildVersionFooter },

	computed: {},
})
</script>
