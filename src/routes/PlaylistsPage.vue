<template>
    <v-progress-linear indeterminate v-if="loading" />
    <NGErrorHandler :error="error" v-else-if="error != null" />
    <GridRow class="mt-2" v-else>
        <GridCol v-for="playlist in playlists" :key="playlist.id">
            <v-card link :to="{ name: 'Playlist', query: { list: playlist.id } }">
                <v-img :src="playlist.thumbnail" />
                <v-card-title>
                    {{ playlist.name }}
                </v-card-title>
                <v-card-text>
                    {{ playlist.shortDescription }}
                </v-card-text>
            </v-card>
        </GridCol>
    </GridRow>
</template>

<script>
import NGErrorHandler from '@/components/NGErrorHandler'
import GridRow from '@/components/Grid/GridRow'
import GridCol from '@/components/Grid/GridCol'

export default {
	name: 'PlaylistPage',
	components: {
		NGErrorHandler,
		GridRow,
		GridCol
	},
	data: () => ({
		playlists: [],
		error: null,
		loading: false
	}),
	mounted () {
		if (this.$store.getters['auth/isCurrentlyAuthenticated']) {
			this.loadPlaylists()
		} else {
			this.$router.replace('/')
		}
	},
	methods: {
		async loadPlaylists () {
			this.loading = true
			try {
				const data = await this.$store.dispatch('auth/makeRequest', {
					method: 'GET',
					path: '/user/playlists'
				})
				this.playlists = data
			} catch (e) {
				if (e.isAxiosError) {
					this.error = e.response.data
				} else {
					throw e
				}
			} finally {
				this.loading = false
			}
		}
	}
}
</script>
