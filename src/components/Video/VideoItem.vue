<template>
    <v-card link :to="video.url" outlined :height="maxHeight ? '100%' : undefined" color="bgTwo">
        <img
                :src="imgURL"
                style="width: 100%; object-fit: contain"
                loading="lazy"
        />
        <v-progress-linear :value="progress" v-if="alreadyWatched"/>
        <v-card-title class="text-subtitle-1">{{ video.title }}</v-card-title>
        <v-card-text>
            <router-link
                    :to="video.uploaderUrl" class="text-subtitle-1 text-decoration-none"
                    v-if="video.uploaderUrl && (video.uploaderName || video.uploader) && !hideChannel" custom
                    v-slot="{ navigate }"
            >
                <h5 @click="navigate" @keypress.enter="navigate" role="link">
                    {{ video.uploaderName || video.uploader }}
                </h5>
            </router-link>
            <slot name="top" />
            <ExpandableNumber :num="video.views" message-key="counts.views" />
            <br />
            <span v-if="video.uploaded > 0">
                <ExpandableDate :date="new Date(video.uploaded)"/>
            </span>
            <span v-else-if="video.uploadedDate">
                {{ video.uploadedDate }}
            </span>
            <br/>
            {{ $store.getters['i18n/fmtDuration'](video.duration) }}
        </v-card-text>
        <slot name="bottom" />
    </v-card>
</template>

<script>
import { LibPiped } from '@/tools/libpiped'
import { findLastWatch } from '@/store/watched-videos-db'
import ExpandableDate from '@/components/ExpandableDate'
import ExpandableNumber from '@/components/ExpandableNumber'

const CLICKBAIT_AVOIDANCE_REGEX = /(maxresdefault|hq720|hqdefault).(webp|jpg)/g

export default {
	name: 'VideoItem',
	components: { ExpandableNumber, ExpandableDate },
	props: {
		video: Object,
		height: Number,
		width: Number,
		hideChannel: Boolean,
		maxHeight: Boolean,
		srcProgress: Number
	},
	data: () => ({
		alreadyWatched: false,
		progress: 0
	}),
	mounted () {
		this.findIfVideoWatched()
	},
	watch: {
		'video.videoId': 'findIfVideoWatched',
		'video.url': 'findIfVideoWatched',
		srcProgress: 'findIfVideoWatched'
	},

	computed: {
		imgURL () {
			const url = this.video.thumbnail ?? this.video.thumbnailUrl
			const clickbaitAvoidance = this.$store.getters['prefs/getPreferenceBoolean']('clickbaitThumbnailAvoidance')
			return clickbaitAvoidance ? url.replaceAll(CLICKBAIT_AVOIDANCE_REGEX, 'hq2.jpg') : url
		}
	},

	methods: {
		async findIfVideoWatched () {
			// if it has source progress, it's already seen
			if (this.srcProgress) {
				this.alreadyWatched = true
				this.progress = this.srcProgress
				return
			}

			let videoId
			if (this.video.videoId) {
				videoId = this.video.videoId
			} else {
				videoId = LibPiped.determineVideoIdFromPath(this.video.url)
			}

			if (videoId) {
				let lastVideo = null
				try {
					lastVideo = await findLastWatch(videoId)
				} catch (e) {
				}
				if (lastVideo != null) {
					this.alreadyWatched = true
					this.progress = lastVideo.progressPcnt
				} else {
					this.alreadyWatched = false
				}
			}
		}
	}
}
</script>
