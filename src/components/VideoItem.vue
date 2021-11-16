<template>
    <v-card link :to="video.url" outlined :height="maxHeight ? '100%' : undefined">
      <v-img
        :height="height"
        :width="width"
        :src="video.thumbnail || video.thumbnailUrl"
        alt="thumbnail"
        loading="lazy"
      />
      <v-progress-linear :value="progress" v-if="alreadyWatched" />
      <v-card-title class="text-subtitle-1">{{ video.title }}</v-card-title>
      <v-card-text>
        <router-link :to="video.uploaderUrl" class="text-subtitle-1 text-decoration-none" v-if="video.uploaderUrl && (video.uploaderName || video.uploader) && !hideChannel" custom v-slot="{ navigate }">
          <h5 @click="navigate" @keypress.enter="navigate" role="link">{{ video.uploaderName || video.uploader }}</h5>
        </router-link>
        <slot />
        {{ $tc('counts.views', video.views, { n: numberFormat(video.views) }) }}<br />
        {{ video.uploadedDate }} <br />
        {{ timeFormat(video.duration) }}
      </v-card-text>
    </v-card>
</template>

<script>
import { LibPiped } from '@/tools/libpiped'
import { findLastWatch } from '@/store/watched-videos-db'

export default {
  name: 'VideoItem',
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

  methods: {
    calcProgress (prog, dur) {
      return Math.min((prog / dur) * 100, 100)
    },

    async findIfVideoWatched () {
      // if it has source progress, it's already seen
      if (this.srcProgress) {
        this.alreadyWatched = true
        this.progress = this.calcProgress(this.srcProgress, this.video.duration)
        return
      }

      let videoId
      if (this.video.videoId) {
        videoId = this.video.videoId
      } else {
        videoId = LibPiped.determineVideoIdFromPath(this.video.url)
      }

      if (videoId) {
        const lastVideo = await findLastWatch(videoId)
        if (lastVideo != null) {
          this.alreadyWatched = true
          this.progress = lastVideo.progress != null ? this.calcProgress(lastVideo.progress, lastVideo.video.duration) : 100
        }
      }
    },

    numberFormat (...args) {
      return LibPiped.numberFormat(...args)
    },

    timeFormat (...args) {
      return LibPiped.timeFormat(...args)
    }
  }
}
</script>
