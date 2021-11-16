<template>
  <ErrorHandler v-if="video && video.error" :message="video.message" :error="video.error" />
  <v-progress-linear indeterminate v-else-if="!loaded" />
  <div v-else>
    <Player
      ref="player"
      :video="video"
      :skip-to-time="'t' in $route.query ? Number($route.query.t) : null"
      :sponsors="sponsors"
      :selectedAutoLoop="selectedAutoLoop"
      @videoEnded="videoEnded"
      @timeupdate="onTimeUpdate"
    />

    <v-row dense class="my-2">
      <v-col md="10" offset-md="1">
        <v-card outlined>
          <v-card-title class="text-h5">{{ video.title }}</v-card-title>
          <v-card-subtitle class="text-subtitle-1">
            <v-row>
              <v-col md="4" align-self="start">
                {{ $tc('counts.views', video.views, { n: addCommas(video.views) }) }}
                •
                {{ video.uploadDate }}
              </v-col>
              <v-col offset-md="5" md="3" align-self="end">
                <v-icon>mdi-thumb-up</v-icon>
                <b class="ml-2">{{ addCommas(video.likes) }}</b>
                <v-icon class="ml-2">mdi-thumb-down</v-icon>
                <b class="ml-2">{{ addCommas(video.dislikes) }}</b>
                <v-btn icon class="ml-2" link :href="'https://youtu.be/' + getVideoId()" @click.prevent="onYTClick" target="_blank">
                  <v-icon large>
                    mdi-youtube
                  </v-icon>
                </v-btn>
                <v-btn class="ml-2" link :href="'https://odysee.com/' + video.lbryId" v-if="video.lbryId" target="_blank" outlined>
                  LBRY
                </v-btn>
              </v-col>
            </v-row>
          </v-card-subtitle>
          <v-divider />
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
            <div class="mt-4" v-html="video.description" />
            <v-divider class="my-4" />
            <div class="mt-4" v-if="showDesc && sponsors && sponsors.segments">
              Sponsors Segments: {{ sponsors.segments.length }}
            </div>
            <div>
              <!-- TODO translate -->
              <v-checkbox dense :input-value="isAutoplayEnabled" @change="onAutoplayChg" label="Autoplay Next Video" />
              <v-checkbox dense v-model="selectedAutoLoop" label="Loop this video" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col md="8" offset-md="1" v-if="comments && comments.comments">
        <h5 class="text-h4 text-center my-4">Comments</h5>
        <VideoComment v-for="comment in comments.comments" :key="comment.commentId" :comment="comment" :video="video" class="my-4" />
        <v-progress-linear indeterminate v-intersect="onCommentsProgressIntersect" v-if="comments.comments.length !== 0 && comments.nextpage != null" />
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
import ErrorHandler from '@/components/ErrorHandler.vue'
import VideoComment from '@/components/VideoComment'
import { addWatchedVideo, updateWatchedVideoProgress } from '@/store/watched-videos-db'
import SubscriptionButton from '@/components/SubscriptionButton'

export default {
  name: 'WatchVideo',
  data () {
    return {
      loaded: false,
      video: {
        title: 'Loading ...'
      },
      sponsors: null,
      selectedAutoLoop: false,
      showDesc: true,
      comments: null,
      channelId: null,

      dbID: null
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
      url.searchParams.set('v', this.getVideoId())
      if (Number.isFinite(time)) {
        url.searchParams.set('t', time.toFixed(0))
      }
      window.location.href = url.href
    },

    numberFormat (...args) {
      return LibPiped.numberFormat(...args)
    },

    addCommas (...args) {
      return LibPiped.addCommas(...args)
    },

    fetchVideo () {
      return this.$store.dispatch('auth/makeRequest', {
        method: 'GET',
        path: '/streams/' + this.getVideoId()
      })
    },

    async getSponsors () {
      if (!this.$store.getters['prefs/getPreference']('sponsorblock', true)) {
        return
      }
      this.sponsors = await this.$store.dispatch('auth/makeRequest', {
        path: '/sponsors/' + this.getVideoId(),
        params: {
          category: JSON.stringify(this.$store.getters['prefs/getPreference']('selectedSkip', ['sponsor', 'interaction', 'selfpromo', 'music_offtopic']))
        }
      })
    },
    fetchComments () {
      return this.$store.dispatch('auth/makeRequest', {
        path: '/comments/' + this.getVideoId()
      })
    },

    onCommentsProgressIntersect (entries) {
      if (entries[0].isIntersecting) {
        this.fetchMoreComments()
      }
    },

    fetchMoreComments () {
      this.$store.dispatch('auth/makeRequest', {
        path: '/nextpage/comments/' + this.getVideoId(),
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

    async getVideoData () {
      const video = await this.fetchVideo()
      video.videoId = this.getVideoId()
      video.url = this.$route.fullPath
      this.video = video
      this.loaded = true

      if (this.video.error) {
        return
      }
      this.channelId = this.video.uploaderUrl.split('/')[2]

      this.video.description = LibPiped.purifyHTML(
        this.video.description
          .replaceAll('http://www.youtube.com', '')
          .replaceAll('https://www.youtube.com', '')
          .replaceAll('\n', '<br>')
      )
      this.dbID = await addWatchedVideo(this.video)
    },
    getComments () {
      this.fetchComments().then(data => (this.comments = data))
    },

    getVideoId () {
      return this.$route.query.v || this.$route.params.v
    },

    onTimeUpdate: debounce(function onTimeUpdate (e) {
      if (this.dbID == null || !this.$refs.player) {
        return
      }
      return updateWatchedVideoProgress(this.dbID, this.$refs.player.getCurrentTime())
    }, 500)
  },
  computed: {
    isAutoplayEnabled () {
      return this.$store.getters['prefs/getPreferenceBoolean']('autoplay', false)
    }
  },
  components: {
    SubscriptionButton,
    VideoComment,
    Player,
    VideoItem,
    ErrorHandler
  }
}
</script>
