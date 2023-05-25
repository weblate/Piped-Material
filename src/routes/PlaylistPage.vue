<template>
    <ErrorHandler v-if="playlist && playlist.error" :message="playlist.message" :error="playlist.error"/>

    <v-container fluid v-else-if="playlist">
        <v-row>
            <v-col md="8" offset-md="2">
                <v-card>
                    <v-img v-if="playlist.avatarUrl" :src="playlist.avatarUrl"/>
                    <v-card-title class="text-h4">
                        {{ playlist.name }}
                    </v-card-title>
                    <v-card-text>
                        <router-link v-if="playlist.uploaderUrl" :to="playlist.uploaderUrl" custom
                                     v-slot="{ navigate }">
                            <div style="justify-items: center; align-items: center; vertical-align: center; display: flex; cursor: pointer" @click="navigate" @keypress.enter="navigate" role="link">
                                <img :src="playlist.uploaderAvatar" height="48" width="48" class="rounded-circle" />
                                <div class="text-h5 ml-4">
                                    {{ playlist.uploader }}
                                </div>
                            </div>
                        </router-link>
                        <h5 class="text-h5 ml-16">{{ $tc('counts.videos', playlist.videos, { n: $store.getters['i18n/fmtFullNumber'](playlist.videos) }) }}</h5>
                        <br />
                        <div v-html="renderedDescription" />
                    </v-card-text>
                    <v-card-actions>
                        <v-btn icon x-large link :href="getRssUrl">
                            <v-icon x-large>{{ mdiRssBox }}</v-icon>
                        </v-btn>
                        <v-btn icon x-large link :href="youtubeURL">
                            <v-icon x-large>{{ mdiYoutube }}</v-icon>
                        </v-btn>
                        <v-btn v-if="isAdmin" @click="deleteSelf" outlined>
                            {{ $t('playlists.delete_self') }}
                        </v-btn>
                        <v-btn v-if="isAdmin" @click="renameSelf" outlined>
                            {{ $t('playlists.rename_self') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>

                <v-row v-for="(chunk, chunkId) in chunkedByFour" :key="chunkId" class="mt-4">
                    <v-col md="3" v-for="video in chunk" :key="video.url">
                        <VideoItem :video="video" max-height>
                            <template v-slot:bottom>
                                <v-card-actions v-if="isAdmin">
                                    <v-btn
                                            outlined
                                            color="secondary"
                                            @click.prevent="removeVideo(video)"
                                            class="pm-breakable-button"
                                    >
                                        {{ $t('playlists.remove_video')}}
                                    </v-btn>
                                </v-card-actions>
                            </template>
                        </VideoItem>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { chunk as _chunk } from 'lodash-es'
import { mdiRssBox, mdiYoutube } from '@mdi/js'

import ErrorHandler from '@/components/ErrorHandler.vue'
import VideoItem from '@/components/Video/VideoItem.vue'

import { LibPiped } from '@/tools/libpiped'

export default {
	data () {
		return {
			playlist: null,
			isAdmin: false,

			mdiRssBox,
			mdiYoutube
		}
	},
	metaInfo () {
		return { title: this.playlist ? this.playlist.name : 'Loading' }
	},

	async mounted () {
		await this.getPlaylistData()
		if (this.$store.getters['auth/isCurrentlyAuthenticated'] && this.playlistID?.length === 36) {
			const playlists = await this.$store.dispatch('auth/makeRequest', {
				method: 'GET',
				path: '/user/playlists'
			})
			for (const playlist of playlists) {
				if (playlist.id === this.playlistID) {
					this.isAdmin = true
					break
				}
			}
		}
	},
	computed: {
		getRssUrl () {
			return this.$store.getters['prefs/apiUrl'] + '/rss/playlists/' + this.playlistID
		},
		playlistID () {
			return this.$route.query.list
		},
		renderedDescription () {
			return LibPiped.purifyHTML(this.playlist.description ?? '')
		},
		youtubeURL () {
			const url = new URL('https://youtube.com/playlist')
			url.searchParams.set('list', this.playlistID)
			return url.href
		},
		chunkedByFour () {
			return _chunk(this.playlist.relatedStreams, 4)
		}
	},
	methods: {
		async fetchPlaylist () {
			return this.$store.dispatch('auth/makeRequest', {
				path: '/playlists/' + this.playlistID
			})
		},
		getPlaylistData () {
			return this.fetchPlaylist()
				.then(data => (this.playlist = data))
		},

		async removeVideo (video) {
			await this.$store.dispatch('auth/makeRequest', {
				method: 'POST',
				path: '/user/playlists/remove',
				data: {
					playlistId: this.playlistID,
					index: this.playlist.relatedStreams.indexOf(video)
				}
			})
			await this.getPlaylistData()
		},

		async deleteSelf () {
			await this.$store.dispatch('auth/makeRequest', {
				path: '/user/playlists/delete',
				method: 'POST',
				data: {
					playlistId: this.playlistID
				}
			})
			await this.$router.replace('/playlists')
		},

		async renameSelf () {
			const newName = window.prompt(this.$t('playlists.new_name_msg'))
			await this.$store.dispatch('auth/makeRequest', {
				path: '/user/playlists/rename',
				method: 'POST',
				data: {
					playlistId: this.playlistID,
					newName
				}
			})
			await this.getPlaylistData()
		}
	},
	components: {
		ErrorHandler,
		VideoItem
	}
}
</script>
