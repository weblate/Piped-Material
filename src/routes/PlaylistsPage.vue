<template>
    <v-progress-linear indeterminate v-if="loading" />
    <NGErrorHandler :error="error" v-else-if="error != null" />
    <v-container fluid v-else>
        <CreatePlaylistDialog @created="loadPlaylists" />
        <v-divider class="my-2" />
        <GridRow>
            <GridCol v-for="playlist in playlists" :key="playlist.id">
                <v-card min-height="100%" link :to="{ name: 'Playlist', query: { list: playlist.id } }">
                    <img style="width: 100%; object-fit: cover" :src="playlist.thumbnail" />
                    <v-card-title>
                        {{ playlist.name }}
                    </v-card-title>
                    <v-card-text>
                        {{ playlist.shortDescription }}
                    </v-card-text>
                </v-card>
            </GridCol>
        </GridRow>
    </v-container>
</template>

<script>
import NGErrorHandler from '@/components/NGErrorHandler'
import GridRow from '@/components/Grid/GridRow'
import GridCol from '@/components/Grid/GridCol'

import CreatePlaylistDialog from '@/components/Playlist/CreatePlaylistDialog'

export default {
	name: 'PlaylistPage',
	components: {
		NGErrorHandler,
		GridRow,
		GridCol,

		CreatePlaylistDialog
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
