<template lang="pug">
.StickyTabs(
  v-if="Settings.stickyTabs"
  v-show="show"
  :data-hide="DnD.reactive.isStarted")
  .sticky-box
    TabComponent(
      v-for="id in stickyTabIds"
      :key="Tabs.getRenderId(id)"
      :tabId="id"
      :sticky="true")
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import * as Settings from 'src/services/settings'
import * as Search from 'src/services/search.fg'
import * as DnD from 'src/services/drag-and-drop.fg'
import * as Tabs from 'src/services/tabs.fg'
import TabComponent from './tab.vue'

const props = defineProps<{ stickyTabIds?: ID[] }>()
const show = computed<boolean>(
  () => !Search.reactive.active && (props.stickyTabIds?.length ?? 0) > 0
)
</script>
