<template>
  <ErrorHandler v-if="video && video.error" :message="video.message" :error="video.error" />
  <div v-else>
    <Player
      ref="videoPlayer"
      :video="video"
      :sponsors="sponsors"
      :selectedAutoPlay="this.$store.getters.getPreferenceBoolean('autoplay')"
      :selectedAutoLoop="selectedAutoLoop"
    />

    <v-row dense class="my-2">
      <v-col md="10" offset-md="1">
        <v-card outlined>
          <v-card-title class="text-h5">{{ video.title }}</v-card-title>
          <v-card-subtitle class="subtitle-1">
            <v-row>
              <v-col md="4" align-self="start">
                {{ addCommas(video.views) }} views
                •
                {{ video.uploadDate }}
              </v-col>
              <v-col offset-md="6" md="2" align-self="end">
                <v-icon>mdi-thumb-up</v-icon>
                <b class="ml-2">{{ addCommas(video.likes) }}</b>
                <v-icon class="ml-2">mdi-thumb-down</v-icon>
                <b class="ml-2">{{ addCommas(video.dislikes) }}</b>
                <v-btn icon class="ml-2" link :href="'https://youtu.be/' + getVideoId()" target="_blank">
                  <v-icon large>
                    mdi-youtube
                  </v-icon>
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
                <div class="text-h5 ml-4">
                  {{ video.uploader }}
                </div>
                <div class="ml-4">
                  <v-btn
                    v-if="$store.state.isAuthenticated"
                    @click="subscribeHandler"
                    color="primary"
                  >
                    {{ subscribed ? "Unsubscribe" : "Subscribe" }}
                  </v-btn>
                </div>
              </div>
            </router-link>
            <div class="mt-4" v-html="video.description" />
            <v-divider class="my-4" />
            <div class="mt-4" v-if="showDesc && sponsors && sponsors.segments">
              Sponsors Segments: {{ sponsors.segments.length }}
            </div>
            <v-checkbox :value="this.$store.getters.getPreferenceBoolean('autoplay')" @change="onAutoplayChg" label="Autoplay next video" />
            <v-checkbox v-model="selectedAutoLoop" label="Loop this video" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

        <div uk-grid>
            <div class="uk-width-4-5@xl uk-width-3-4@l uk-width-1" v-if="comments" ref="comments">
                <div
                    class="uk-tile-default uk-align-left uk-width-expand"
                    :style="[{ background: backgroundColor }]"
                    v-bind:key="comment.commentId"
                    v-for="comment in comments.comments"
                >
                    <div align="left">
                        <div v-if="comment.pinned">
                            <font-awesome-icon icon="thumbtack"></font-awesome-icon>&nbsp; Pinned by
                            {{ video.uploader }}
                        </div>
                        <img
                            :src="comment.thumbnail"
                            style="width: 10vmin"
                            height="176"
                            width="176"
                            loading="lazy"
                            alt="avatar"
                        />
                        <br />
                        <router-link class="uk-link-muted" v-bind:to="comment.commentorUrl">
                            {{ comment.author }} </router-link
                        >&thinsp;<font-awesome-icon v-if="comment.verified" icon="check"></font-awesome-icon>
                    </div>
                    <p style="white-space: pre-wrap">{{ comment.commentText }}</p>
                    <div>
                        <b>{{ numberFormat(comment.likeCount) }}</b>
                        &nbsp;
                        <font-awesome-icon icon="thumbs-up"></font-awesome-icon>
                        &nbsp;
                        <font-awesome-icon v-if="comment.hearted" icon="heart"></font-awesome-icon>
                    </div>
                    <hr />
                </div>
            </div>

            <div class="uk-width-1-5@xl uk-width-1-4@l uk-width-1 uk-flex-last@l uk-flex-first" v-if="video">
                <div
                    class="uk-tile-default uk-width-auto"
                    :style="[{ background: backgroundColor }]"
                    v-bind:key="related.url"
                    v-for="related in video.relatedStreams"
                >
                    <VideoItem :video="related" height="94" width="168" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { LibPiped } from '@/tools/libpiped'

import Player from '@/components/Player.vue'
import VideoItem from '@/components/VideoItem.vue'
import ErrorHandler from '@/components/ErrorHandler.vue'

export default {
  name: 'WatchVideo',
  data () {
    return {
      video: {
        title: 'Loading...'
      },
      active: false,
      sponsors: null,
      selectedAutoLoop: false,
      showDesc: true,
      comments: null,
      subscribed: false,
      channelId: null
    }
  },
  mounted () {
    this.getVideoData().then(() => {
      if (this.active) {
        this.$refs.videoPlayer.loadVideo()
      }
    })
    this.getSponsors()
    if (this.$store.getters.getPreferenceBoolean('comments', true)) this.getComments()
  },
  activated () {
    this.active = true
    this.selectedAutoPlay = this.$store.getters.getPreferenceBoolean('autoplay', true)
    if (this.video.duration) this.$refs.videoPlayer.loadVideo()
    window.addEventListener('scroll', this.handleScroll)
  },
  deactivated () {
    this.active = false
    window.removeEventListener('scroll', this.handleScroll)
  },
  watch: {
    '$route.query.v': function (v) {
      if (v) {
        window.scrollTo(0, 0)
      }
    }
  },
  methods: {
    numberFormat (...args) {
      return LibPiped.numberFormat(...args)
    },

    addCommas (...args) {
      return LibPiped.addCommas(...args)
    },

    fetchVideo () {
      return this.$store.dispatch('fetchJson', {
        path: '/streams/' + this.getVideoId()
      })
    },

    async fetchSponsors () {
      return this.$store.dispatch('fetchJson', {
        path: '/sponsors/' + this.getVideoId(),
        params: {
          category:
              '["' +
              this.$store.getters.getPreferenceString('selectedSkip', 'sponsor,interaction,selfpromo,music_offtopic').replaceAll(
                ',',
                '","'
              ) +
              '"]'
        }
      })
    },
    fetchComments () {
      return this.$store.dispatch('fetchJson', {
        path: '/comments/' + this.getVideoId()
      })
    },
    onAutoplayChg (ev) {
      this.$store.commit('setPrefs', {
        id: 'autoplay',
        value: ev
      })
    },

    async getVideoData () {
      await this.fetchVideo()
        .then(data => {
          this.video = data
        })
        .then(() => {
          if (!this.video.error) {
            document.title = this.video.title + ' - Piped'
            this.channelId = this.video.uploaderUrl.split('/')[2]
            this.fetchSubscribedStatus()

            this.video.description = LibPiped.purifyHTML(
              this.video.description
                .replaceAll('http://www.youtube.com', '')
                .replaceAll('https://www.youtube.com', '')
                .replaceAll('\n', '<br>')
            )
          }
        })
    },
    async getSponsors () {
      if (this.$store.getters.getPreferenceString('sponsorblock', true)) { this.fetchSponsors().then(data => (this.sponsors = data)) }
    },
    async getComments () {
      this.fetchComments().then(data => (this.comments = data))
    },
    async fetchSubscribedStatus () {
      if (!this.channelId) return

      this.$store.dispatch('fetchJson', {
        path: '/subscribed',
        params: {
          channelId: this.channelId
        },
        options: {
          headers: {
            Authorization: this.$store.getters.getAuthToken
          }
        }
      }).then(json => {
        this.subscribed = json.subscribed
      })
    },
    subscribeHandler () {
      this.$store.dispatch('fetchJson', {
        path: (this.subscribed ? '/unsubscribe' : '/subscribe'),
        params: null,
        options: {
          method: 'POST',
          body: JSON.stringify({
            channelId: this.channelId
          }),
          headers: {
            Authorization: this.$store.getters.getAuthToken,
            'Content-Type': 'application/json'
          }
        }
      })
      this.subscribed = !this.subscribed
    },
    handleScroll () {
      if (this.loading || !this.comments || !this.comments.nextpage) return
      if (window.innerHeight + window.scrollY >= this.$refs.comments.offsetHeight - window.innerHeight) {
        this.loading = true
        this.$store.dispatch('fetchJson', {
          path: '/nextpage/comments/' + this.getVideoId(),
          options: {
            url: this.comments.nextpage
          }
        }).then(json => {
          this.comments.nextpage = json.nextpage
          this.loading = false
          json.comments.map(comment => this.comments.comments.push(comment))
        })
      }
    },
    getVideoId () {
      return this.$route.query.v || this.$route.params.v
    }
  },
  components: {
    Player,
    VideoItem,
    ErrorHandler
  }
}
</script>
