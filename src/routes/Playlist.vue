<template>
    <ErrorHandler v-if="playlist && playlist.error" :message="playlist.message" :error="playlist.error" />

    <v-container fluid v-else-if="playlist">
      <v-row>
        <v-col md="8" offset-md="2">
          <v-card>
            <v-img v-if="playlist.avatarUrl" :src="playlist.avatarUrl" />
            <v-card-title class="display-1">
              {{ playlist.name }}
            </v-card-title>
            <v-card-text>
              <router-link v-if="playlist.uploaderUrl" :to="playlist.uploaderUrl" custom v-slot="{ navigate }">
                <div
                  style="justify-items: center; align-items: center; vertical-align: center; display: flex; cursor: pointer"
                  @click="navigate" @keypress.enter="navigate" role="link"
                >
                  <div>
                    <v-img :src="playlist.uploaderAvatar" height="48" width="48" class="rounded-circle" />
                  </div>
                  <div class="text-h5 ml-4">
                    {{ playlist.uploader }}
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
              <h5 class="text-h5 ml-16">{{ playlist.videos }} Videos</h5>
            </v-card-text>
            <v-card-actions>
              <v-btn icon x-large link :href="getRssUrl"><v-icon x-large>mdi-rss-box</v-icon></v-btn>
            </v-card-actions>
          </v-card>

          <v-row v-for="(chunk, chunkId) in chunkedByFour" :key="chunkId" class="mt-4">
            <v-col md="3" v-for="video in chunk" :key="video.url">
              <VideoItem :video="video" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <div v-else-if="playlist" v-show="!playlist.error">
        <h1 class="uk-text-center">
            <img v-bind:src="playlist.avatarUrl" height="48" width="48" loading="lazy" />
            {{ playlist.name }}
        </h1>

        <b
            ><router-link class="uk-text-justify" v-bind:to="playlist.uploaderUrl || '/'">
                <img v-bind:src="playlist.uploaderAvatar" loading="lazy" />
                {{ playlist.uploader }}</router-link
            ></b
        >

        <div class="uk-align-right">
            <b>{{ playlist.videos }} Videos</b>
            <br />
            <a :href="getRssUrl"><font-awesome-icon icon="rss"></font-awesome-icon></a>
        </div>

        <hr />

        <div class="uk-grid-xl" uk-grid="parallax: 0">
            <div
                class="uk-width-1-2 uk-width-1-3@m uk-width-1-4@l uk-width-1-5@xl"
                v-bind:key="video.url"
                v-for="video in this.playlist.relatedStreams"
            >
                <VideoItem :video="video" height="94" width="168" />
            </div>
        </div>
    </div>
</template>

<script>
import ErrorHandler from '@/components/ErrorHandler.vue'
import VideoItem from '@/components/VideoItem.vue'

import { chunk as _chunk } from 'lodash-es'

export default {
  data () {
    return {
      playlist: null
    }
  },
  metaInfo () {
    return { title: this.playlist ? this.playlist.name : 'Loading' }
  },

  mounted () {
    this.getPlaylistData()
  },
  computed: {
    getRssUrl () {
      return this.$store.getters.apiUrl + '/rss/playlists/' + this.$route.query.list
    },

    chunkedByFour () {
      return _chunk(this.playlist.relatedStreams, 4)
    }
  },
  methods: {
    async fetchPlaylist () {
      return this.$store.dispatch('fetchJson', {
        path: '/playlists/' + this.$route.query.list
      })
    },
    async getPlaylistData () {
      this.fetchPlaylist()
        .then(data => (this.playlist = data))
    }
  },
  components: {
    ErrorHandler,
    VideoItem
  }
}
</script>
