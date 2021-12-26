<template>
    <ErrorHandler v-if="channel && channel.error" :message="channel.message" :error="channel.error" />
    <v-container fluid v-else-if="channel">
        <v-card class="pa-4">
            <div
                style="justify-items: center; align-items: center; vertical-align: center; display: flex;"
            >
                <div>
                    <v-img :src="channel.avatarUrl" height="48" width="48" class="rounded-circle" />
                </div>
                <div class="text-h5 ml-4">
                    {{ channel.name }}
                </div>
                <SubscriptionButton :channel-id="channel.id" />
            </div>
            <v-card-text>
                <div v-html="renderedDescription" />
            </v-card-text>
        </v-card>

        <v-divider class="my-4" />

        <div v-if="channel && channel.relatedStreams">
            <GridRow>
                <GridCol v-for="(video, videoId) in channel.relatedStreams" :key="videoId">
                    <VideoItem :height="270" :width="480" :video="video" max-height />
                </GridCol>
            </GridRow>
            <v-progress-linear v-if="channel.nextpage != null" indeterminate
                               v-intersect="onRelatedStreamsEndIntersect" />
        </div>
    </v-container>
</template>

<script>
import marked from 'marked'

import ErrorHandler from '@/components/ErrorHandler'
import VideoItem from '@/components/VideoItem.vue'
import SubscriptionButton from '@/components/SubscriptionButton'
import GridRow from '@/components/Grid/GridRow'
import GridCol from '@/components/Grid/GridCol'

import { LibPiped } from '@/tools/libpiped'

export default {
	data () {
		return {
			channel: null
		}
	},
	metaInfo () {
		const title = this.channel ? this.channel.name : 'Loading'

		return {
			title,
			meta: this.channel && [
				{
					name: 'twitter:title',
					content: this.channel.name
				},
				{
					name: 'twitter:description',
					content: this.channel.description
				},
				{
					property: 'og:type',
					content: 'profile'
				},
				{
					property: 'og:title',
					content: this.channel.name
				},
				{
					property: 'og:profile:username',
					content: this.channel.name
				},
				{
					property: 'og:description',
					content: this.channel.description
				},
				{
					name: 'description',
					content: this.channel.description
				},
				{
					property: 'og:image',
					content: this.channel.bannerUrl
				},
				{
					name: 'twitter:image',
					content: this.channel.bannerUrl
				}
			]
		}
	},

	mounted () {
		this.fetchChannel()
	},
	watch: {
		'$route.params.channelId': 'fetchChannel'
	},
	methods: {
		async fetchChannel () {
			this.channel = await this.$store.dispatch('auth/makeRequest', {
				path: '/' + this.$route.params.path + '/' + this.$route.params.channelId
			})
		},

		onRelatedStreamsEndIntersect (entries) {
			if (entries[0].isIntersecting) {
				this.fetchMoreVideos()
			}
		},

		fetchMoreVideos () {
			this.$store.dispatch('auth/makeRequest', {
				path: '/nextpage/channel/' + this.channel.id,
				params: {
					nextpage: this.channel.nextpage
				}
			}).then(j => {
				this.channel.relatedStreams = this.channel.relatedStreams.concat(j.relatedStreams)
				this.channel.nextpage = j.nextpage
			})
		}
	},
	computed: {
		renderedDescription () {
			return LibPiped.purifyHTML(marked.parseInline(this.channel.description, {
				breaks: true
			}))
		}
	},
	components: {
		GridRow,
		GridCol,
		SubscriptionButton,
		ErrorHandler,
		VideoItem
	}
}
</script>
