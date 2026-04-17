<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="picker-wrapper fixed z-[102]"
      :style="position"
      @click.stop
      :ref="(el: any) => $emit('register', el)"
    >
      <em-emoji-picker
        :theme="dark ? 'dark' : 'light'"
        set="native"
      />
    </div>
    <div
      v-if="show"
      class="fixed inset-0 z-[99]"
      @click="$emit('close')"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

defineProps<{
  show: boolean
  position: Record<string, string>
}>()

defineEmits<{
  close: []
  register: [el: HTMLElement | null]
}>()

const { dark } = useTheme()
</script>

<style scoped>
.picker-wrapper {
  filter: drop-shadow(0 8px 32px rgba(0, 0, 0, 0.6));
}

:deep(em-emoji-picker) {
  --rgb-accent: 99, 179, 237;
  --rgb-background: 15, 23, 42;
  --rgb-color: 226, 232, 240;
  --rgb-input: 30, 41, 59;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-over: rgba(255, 255, 255, 0.15);
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  --border-radius: 16px;
  --font-family: inherit;
  --font-size: 14px;
  --emoji-size: 24px;
  --emoji-padding: 6px;
  --category-icon-size: 18px;
  width: 320px;
  height: 380px;
}
</style>
