<template>
  <v-card elevation="4" class="pa-4">
    <v-row>
      <v-col md="1">
        <v-avatar size="96">
          <v-img :src="comment.thumbnail"></v-img>
        </v-avatar>
      </v-col>
      <v-col md="11">
        <v-card-title class="subtitle-1">
          <span v-if="comment.pinned"><v-icon>mdi-pin</v-icon> Pinned by {{ video.uploader }}</span>
          <router-link :to="comment.commentorUrl" class="text-decoration-none black--text">
            <b>{{ comment.author }}</b><v-icon v-if="comment.verified">mdi-account-check</v-icon>
          </router-link>
        </v-card-title>
        <v-card-text>
          {{ comment.commentText }}

          <v-divider class="my-2" />

          <v-icon>mdi-thumb-up</v-icon> {{ numberFormat(comment.likeCount) }}
          <v-icon v-if="comment.hearted" class="ml-4">mdi-heart</v-icon>
        </v-card-text>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { LibPiped } from '@/tools/libpiped'

export default {
  name: 'VideoComment',
  props: ['comment', 'video'],
  methods: {
    numberFormat (...args) {
      return LibPiped.numberFormat(...args)
    }
  }
}
</script>
