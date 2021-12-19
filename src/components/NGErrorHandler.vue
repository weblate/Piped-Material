<template>
    <v-alert v-if="error" color="error" prominent text>
        <span v-if="errorIsJSON === false">{{ $t(error) }}</span>
        <JSONViewer v-else :value="error" />
    </v-alert>
</template>

<script>
export default {
	name: 'NGErrorHandler',
	props: ['error', 'errorIsJSON'],
	components: {
		JSONViewer: () => import('vue-json-viewer')
	}
}
</script>
