<template>
    <NGErrorHandler :error="error" v-if="error != null" />
    <v-progress-linear indeterminate v-else-if="!loaded" />
    <div v-else>
        <Player
            ref="player"
            :video="video"
            :initial-skip="initialSkip"
            :sponsors="sponsors"
            :selectedAutoLoop="selectedAutoLoop"
            @videoEnded="videoEnded"
            @timeupdate="onTimeUpdate"
        />

        <v-row dense class="mb-2">
            <v-col md="10" offset-md="1">
                <v-card outlined color="bgTwo">
                    <v-card-title class="text-h5">{{ video.title }}</v-card-title>
                    <v-card-subtitle class="text-subtitle-1">
                        <v-row align="center">
                            <v-col>
                                {{ $tc('counts.views', video.views, { n: $store.getters['i18n/fmtNumber'](video.views) }) }}
                                •
                                {{ $store.getters['i18n/fmtDate'](new Date(video.uploadDate)) }}
                                <!-- TODO make translatable -->
                                <span v-if="lastWatch">
                                    •
                                    {{ $t('misc.lastWatchedTill', { t: lastWatchDurationH }) }}
                                    <ExpandableDate :date="lastWatch.timestamp" />
                                </span>
                            </v-col>
                            <v-col style="text-align: right">
                                <v-icon>mdi-thumb-up</v-icon>
                                <b class="ml-2">{{ addCommas(video.likes) }}</b>
                                <v-icon class="ml-2">mdi-thumb-down</v-icon>
                                <b class="ml-2">{{ addCommas(video.dislikes) }}</b>
                                <v-btn icon class="ml-2" link :href="'https://youtu.be/' + videoId"
                                       @click.prevent="onYTClick" target="_blank">
                                    <v-icon large>
                                        mdi-youtube
                                    </v-icon>
                                </v-btn>
                                <v-btn class="ml-2" link :href="'https://odysee.com/' + video.lbryId"
                                       v-if="video.lbryId" target="_blank" outlined>
                                    LBRY
                                </v-btn>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                            class="ml-2" @click="downloadAccess"
                                            outlined
                                            v-bind="attrs" v-on="on"
                                        >
                                            M3U8/DASH/Stream
                                        </v-btn>
                                    </template>
                                    <span>
                                        With this you can play the video in your own media player.
                                    </span>
                                </v-tooltip>
                            </v-col>
                        </v-row>
                    </v-card-subtitle>
                    <v-divider class="my-1" />
                    <VideoChapters :chapters="video.chapters" @seek="$refs.player.skipToTime($event)" v-if="Array.isArray(video.chapters) && video.chapters.length !== 0" />
                    <v-divider class="my-1" />
                    <v-card-text>
                        <router-link v-if="video.uploaderUrl" :to="video.uploaderUrl" custom v-slot="{ navigate }">
                            <div
                                style="justify-items: center; align-items: center; vertical-align: center; display: flex; cursor: pointer"
                                @click="navigate" @keypress.enter="navigate" role="link"
                            >
                                <div>
                                    <v-img :src="video.uploaderAvatar" height="48" width="48" class="rounded-circle" />
                                </div>
                                <a :href="video.uploaderUrl" class="text-h5 ml-4 text-decoration-none">
                                    {{ video.uploader }}
                                </a>
                                <div class="ml-4">
                                    <SubscriptionButton :channel-id="channelId" />
                                </div>
                            </div>
                        </router-link>
                        <YouTubeMarkupInterpreter :text="video.description" class="mt-4" @timeSegmentClick="$refs.player.skipToTime($event)" />
                        <v-divider class="my-4" v-if="Array.isArray(video.chapters) && video.chapters.length !== 0" />
                        <div class="mt-4" v-if="showDesc && sponsors && sponsors.segments">
                            Sponsors Segments: {{ sponsors.segments.length }}
                        </div>
                        <div>
                            <!-- TODO translate -->
                            <v-checkbox dense :input-value="isAutoplayEnabled" @change="onAutoplayChg"
                                        label="Autoplay Next Video" />
                            <v-checkbox dense v-model="selectedAutoLoop" label="Loop this video" />
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col md="8" offset-md="1" v-if="comments && comments.comments">
                <h5 class="text-h4 text-center my-4">Comments</h5>
                <VideoComment v-for="comment in comments.comments" :key="comment.commentId" :comment="comment"
                              :video="video" />
                <v-progress-linear indeterminate v-intersect="onCommentsProgressIntersect"
                                   v-if="comments.comments.length !== 0 && comments.nextpage != null" />
            </v-col>
            <v-col md="2" v-if="video && video.relatedStreams">
                <h5 class="text-h4 text-center my-4">Related Videos</h5>
                <VideoItem class="my-4" v-for="related in video.relatedStreams" :video="related" :key="related.url" />
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { debounce } from 'lodash-es'
import { LibPiped } from '@/tools/libpiped'

import Player from '@/components/Player.vue'
import VideoItem from '@/components/VideoItem.vue'
import NGErrorHandler from '@/components/NGErrorHandler'
import VideoComment from '@/components/VideoComment'
import { addWatchedVideo, updateWatchedVideoProgress, findLastWatch } from '@/store/watched-videos-db'
import SubscriptionButton from '@/components/SubscriptionButton'
import ExpandableDate from '@/components/ExpandableDate'
import YouTubeMarkupInterpreter from '@/components/YouTubeMarkupInterpreter'
import VideoChapters from '@/components/VideoChapters'

export default {
	name: 'WatchVideo',
	data () {
		return {
			loaded: false,
			video: {
				title: 'Loading ...'
			},
			error: null,
			sponsors: null,
			selectedAutoLoop: false,
			showDesc: true,
			comments: null,
			channelId: null,

			dbID: null,
			lastWatch: null
		}
	},
	metaInfo () {
		return {
			title: this.video.title,
			meta: [
				{
					name: 'twitter:title',
					content: this.video.title
				},
				{
					name: 'twitter:description',
					content: this.video.description
				},
				{
					property: 'og:type',
					content: 'video'
				},
				{
					property: 'og:title',
					content: this.video.title
				},
				{
					property: 'og:description',
					content: this.video.description
				},
				{
					name: 'description',
					content: this.video.description
				},
				{
					property: 'og:image',
					content: this.video.thumbnailUrl
				},
				{
					name: 'twitter:image',
					content: this.video.thumbnailUrl
				}
			]
		}
	},

	mounted () {
		this.initialize()
	},
	watch: {
		'$route.query.v': function (v) {
			if (v) {
				window.scrollTo(0, 0)
			}
			this.initialize()
		}
	},
	methods: {
		initialize () {
			this.getVideoData()
			this.getSponsors()
			if (this.$store.getters['prefs/getPreferenceBoolean']('comments', true)) this.getComments()
		},

		videoEnded () {
			if (!this.selectedAutoLoop && this.isAutoplayEnabled && this.video.relatedStreams[0]) {
				this.$router.push({
					name: 'WatchVideo',
					query: {
						v: LibPiped.determineVideoIdFromPath(this.video.relatedStreams[0].url)
					}
				})
			}
		},

		onYTClick () {
			const time = this.$refs.player.getCurrentTime()

			const url = new URL('https://youtube.com/watch')
			url.searchParams.set('v', this.videoId)
			if (Number.isFinite(time)) {
				url.searchParams.set('t', time.toFixed(0))
			}
			window.location.href = url.href
		},

		addCommas (...args) {
			return LibPiped.addCommas(...args)
		},

		async fetchVideo () {
			try {
				return await this.$store.dispatch('auth/makeRequest', {
					method: 'GET',
					path: '/streams/' + this.videoId
				})
			} catch (e) {
				if (e.isAxiosError) {
					this.error = e.response.data
				} else {
					throw e
				}
			}
		},

		async getSponsors () {
			if (!this.$store.getters['prefs/getPreference']('sponsorblock', true)) {
				return
			}
			this.sponsors = await this.$store.dispatch('auth/makeRequest', {
				path: '/sponsors/' + this.videoId,
				params: {
					category: JSON.stringify(this.$store.getters['prefs/getPreference']('selectedSkip'))
				}
			})
		},
		fetchComments () {
			return this.$store.dispatch('auth/makeRequest', {
				path: '/comments/' + this.videoId
			})
		},

		onCommentsProgressIntersect (entries) {
			if (entries[0].isIntersecting) {
				this.fetchMoreComments()
			}
		},

		fetchMoreComments () {
			this.$store.dispatch('auth/makeRequest', {
				path: '/nextpage/comments/' + this.videoId,
				params: {
					nextpage: this.comments.nextpage
				}
			}).then(json => {
				this.comments.nextpage = json.nextpage
				this.comments.comments = this.comments.comments.concat(json.comments)
			})
		},

		onAutoplayChg (ev) {
			this.$store.commit('prefs/setPrefs', {
				id: 'autoplay',
				value: ev
			})
		},

		downloadAccess () {
			const [uri, mime] = this.$refs.player.getAccess()
			const a = document.createElement('a')
			a.href = uri
			a.target = '_blank'
			a.type = mime

			switch (mime) {
				case 'application/dash+xml':
					a.download = 'video.dash'
					break
				case 'application/x-mpegURL':
				default:
					a.download = 'video.m3u8'
					break
			}

			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
		},

		async getVideoData () {
			try {
				this.lastWatch = await findLastWatch(this.videoId)
			} catch (e) {
				console.error('Errored while finding last watched', e)
			}

			const video = await this.fetchVideo()
			video.videoId = this.videoId
			video.url = this.$route.fullPath
			this.video = video
			this.loaded = true

			if (this.video.error) {
				return
			}
			this.channelId = this.video.uploaderUrl.split('/')[2]
			this.dbID = await addWatchedVideo(video)
		},
		getComments () {
			this.fetchComments().then(data => (this.comments = data))
		},

		onTimeUpdate: debounce(function onTimeUpdate (e) {
			if (this.dbID == null || !this.$refs.player) {
				return
			}
			return updateWatchedVideoProgress(this.dbID, this.$refs.player.getCurrentTime(), this.video.duration)
		}, 500)
	},
	computed: {
		isAutoplayEnabled () {
			return this.$store.getters['prefs/getPreferenceBoolean']('autoplay', false)
		},
		videoId () {
			return this.$route.query.v || this.$route.params.v
		},
		initialSkip () {
			// 't' in $route.query ? Number($route.query.t) : (lastWatch.progress ? lastWatch.progress : undefined)
			// 1st Priority - t in query
			// 2nd Priority - Last Watched Progress, if enabled
			if ('t' in this.$route.query) {
				return Number(this.$route.query.t)
			} else if (this.lastWatch && this.lastWatch.progress != null && this.lastWatch.progress !== 0 && this.$store.getters['prefs/getPreferenceBoolean']('skipToLastPoint', true)) {
				return this.lastWatch.progress
			} else {
				return undefined
			}
		},

		lastWatchDurationH () {
			return LibPiped.timeFormat(this.lastWatch.progress)
		}
	},
	components: {
		YouTubeMarkupInterpreter,
		VideoChapters,
		ExpandableDate,
		SubscriptionButton,
		VideoComment,
		Player,
		VideoItem,
		NGErrorHandler
	}
}
</script>
