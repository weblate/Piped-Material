<template>
  <v-card>
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
  </v-card>
</template>

<script>
import { LibPiped } from '@/tools/libpiped'

export default {
  name: 'VideoComment',
  props: ['comment'],
  methods: {
    numberFormat (...args) {
      return LibPiped.numberFormat(...args)
    }
  }
}
</script>
