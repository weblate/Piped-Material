<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <slot /> {{ timeAgo }}
      </span>
    </template>
    <span>{{ formattedDate }}</span>
  </v-tooltip>
</template>

<script>
import { LibPiped } from '@/tools/libpiped'

export default {
  name: 'ExpandableDate',
  props: ['date'],
  computed: {
    timeAgo () {
      return LibPiped.timeAgo(this.date)
    },

    formattedDate () {
      return LibPiped.formatFullDate(this.date)
    }
  }
}
</script>
