<template>
	<div class="register">
		<the-register-form />
		<build-version-footer />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TheRegisterForm from '../components/login/TheRegisterForm.vue'
import BuildVersionFooter from '../components/utils/BuildVersionFooter.vue'

export default defineComponent({
	components: { TheRegisterForm, BuildVersionFooter },

	computed: {},
})
</script>
