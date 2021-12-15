<template>
  <div>
    <p>{{ message }}</p>
    <v-btn x-large color="warning" @click="showStacktrace = !showStacktrace">Show More</v-btn>
    <p style="white-space: pre-wrap" v-if="showStacktrace">{{ error }}</p>
  </div>
</template>

<script>
export default {
	props: {
		error: String,
		message: String
	},
	data: () => ({
		showStacktrace: false
	})
}
</script>
