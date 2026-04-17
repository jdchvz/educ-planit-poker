<template>
  <div class="flex flex-wrap justify-center gap-4 md:gap-6 w-full max-w-3xl min-h-[160px]">
    <template v-if="players.length === 0">
      <div
        class="text-sm tracking-wide transition-colors duration-300"
        :class="dark ? 'text-slate-500' : 'text-slate-400'"
      >
        Waiting for players to join…
      </div>
    </template>

    <div
      v-for="p in players"
      :key="p"
      :ref="(el: any) => registerCard(el, p)"
      class="flex flex-col items-center gap-2 relative"
      @mouseenter="hoveredPlayer = p"
      @mouseleave="hoveredPlayer = null"
    >
      <!-- Impact animations -->
      <EmojiImpactAnimation :impacts="impactMap[p] ?? []" />

      <!-- Quick emoji bar -->
      <EmojiQuickBar
        :show="hoveredPlayer === p && p !== currentPlayer"
        @throw="(emoji: string) => onThrow(emoji, p)"
        @open-picker="togglePicker(p)"
        @mouseenter="hoveredPlayer = p"
        @mouseleave="hoveredPlayer = null"
      />

      <!-- Player card -->
      <div
        class="card-flip relative transition-transform duration-150"
        :class="[
          { flipped: revealed && votes[p] !== undefined },
          p !== currentPlayer ? 'cursor-pointer hover:scale-105' : 'cursor-default'
        ]"
      >
        <div class="card-flip-inner">
          <!-- Front -->
          <div
            class="card-flip-front w-16 h-24 rounded-lg border-2 flex items-center justify-center shadow-md transition-all duration-200"
            :class="[
              votes[p] !== undefined
                ? dark ? 'border-green-400 bg-[#0f2d1f] shadow-green-900/40' : 'border-green-400 bg-green-50 shadow-green-200/60'
                : dark ? 'border-slate-600 bg-[#132a49]' : 'border-slate-300 bg-white',
              hoveredPlayer === p && p !== currentPlayer
                ? dark ? '!border-sky-400 shadow-sky-900/40' : '!border-sky-400 shadow-sky-200/60'
                : ''
            ]"
          >
            <span class="text-green-400 text-base font-medium" v-if="votes[p] !== undefined">✓</span>
            <span
              class="text-lg animate-pulse"
              :class="dark ? 'text-slate-500' : 'text-slate-400'"
              v-else
            >?</span>
          </div>
          <!-- Back -->
          <div
            class="card-flip-back w-16 h-24 rounded-lg border-2 flex items-center justify-center shadow-md transition-all duration-200"
            :class="[
              dark ? 'border-sky-400 bg-[#132a49]' : 'border-sky-400 bg-sky-50',
              hoveredPlayer === p && p !== currentPlayer
                ? dark ? '!border-sky-300 shadow-sky-900/40' : '!border-sky-300 shadow-sky-200/60'
                : ''
            ]"
          >
            <span
              class="text-lg font-semibold"
              :class="dark ? 'text-slate-300' : 'text-slate-700'"
            >{{ votes[p] ?? '?' }}</span>
          </div>
        </div>
      </div>

      <!-- Player name -->
      <div class="flex flex-col items-center gap-1">
        <div
          class="text-sm md:text-base font-medium lowercase tracking-wide flex items-center gap-1 transition-colors duration-300"
          :class="p === currentPlayer
            ? 'text-sky-500 font-bold'
            : hoveredPlayer === p
              ? dark ? 'text-sky-400' : 'text-sky-500'
              : dark ? 'text-slate-300' : 'text-slate-600'"
        >
          {{ p }}
          <span v-if="p === currentPlayer" class="text-sky-500 text-xs md:text-sm">(you)</span>
        </div>
        <span
          v-if="votes[p] === undefined && !revealed"
          class="text-xs animate-pulse tracking-wide transition-colors duration-300"
          :class="dark ? 'text-slate-500' : 'text-slate-400'"
        >
          waiting...
        </span>
      </div>
    </div>
  </div>

  <!-- Emoji picker overlay -->
  <EmojiPickerOverlay
    :show="pickerTarget !== null"
    :position="pickerPos"
    @close="pickerTarget = null; hoveredPlayer = null"
    @register="(el: HTMLElement | null) => registerPicker(el, pickerTarget!)"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useEmojiThrow } from '../composables/useEmojiThrow'
import { useEmojiAnimation, useEmojiPickerPosition, type EmojiImpact } from '../composables/useEmojiAnimation'
import { useRoomStore } from '../stores/room'
import type { CardValue } from '../types/room'

const props = defineProps<{
  players: string[]
  votes: Record<string, CardValue | '●' | null>
  revealed: boolean
  currentPlayer: string
}>()

const { dark } = useTheme()
const { activeThrows } = useEmojiThrow()
const store = useRoomStore() as any

const hoveredPlayer = ref<string | null>(null)
const pickerTarget = ref<string | null>(null)
const pickerPos = ref<Record<string, string>>({})

const pickerListeners = new Map<string, {
  el: HTMLElement
  handler: (e: Event) => void
  docHandler?: (e: Event) => void
  observer?: MutationObserver
}>()

const cardRefs = new Map<string, HTMLElement>()
const impactMap = ref<Record<string, EmojiImpact[]>>({})
let impactId = 0

function triggerImpact(emoji: string, player: string) {
  const id = impactId++
  impactMap.value = {
    ...impactMap.value,
    [player]: [...(impactMap.value[player] ?? []), { id, emoji }],
  }
  setTimeout(() => {
    const updated = (impactMap.value[player] ?? []).filter(e => e.id !== id)
    impactMap.value = { ...impactMap.value, [player]: updated }
  }, 700)
}

function registerCard(el: HTMLElement | null, player: string) {
  if (el) cardRefs.set(player, el)
  else cardRefs.delete(player)
}

const { launchEmoji } = useEmojiAnimation(cardRefs, triggerImpact)
const { computePickerPos } = useEmojiPickerPosition(cardRefs, pickerPos)

watch(
  () => [...activeThrows.value],
  (newVal, oldVal) => {
    const oldIds = new Set((oldVal ?? []).map((t: any) => t.id))
    newVal.forEach((t: any) => {
      if (!oldIds.has(t.id)) launchEmoji(t.emoji, t.to)
    })
  }
)

function attachPickerListener(picker: Element, player: string, el: HTMLElement) {
  if (pickerListeners.has(player)) {
    const old = pickerListeners.get(player)!
    old.observer?.disconnect()
    if (old.docHandler) document.removeEventListener('click', old.docHandler, true)
  }

  const docHandler = (e: Event) => {
    if (pickerTarget.value !== player) return
    const path = (e as MouseEvent).composedPath()
    const hasEmojiPicker = path.some((el: any) => el?.tagName?.toLowerCase?.() === 'em-emoji-picker')
    if (!hasEmojiPicker) return
    const emojiBtn = path.find(
      (el: any) => el?.tagName?.toLowerCase?.() === 'button' && el?.classList?.contains('flex-middle')
    ) as HTMLElement | undefined
    if (!emojiBtn) return
    const emoji = emojiBtn.getAttribute('aria-label') ?? ''
    if (emoji) onThrow(emoji, player)
  }

  document.addEventListener('click', docHandler, true)
  pickerListeners.set(player, { el, handler: docHandler, docHandler, observer: undefined })
}

function registerPicker(el: HTMLElement | null, player: string) {
  if (!el) {
    if (pickerListeners.has(player)) {
      const old = pickerListeners.get(player)!
      old.observer?.disconnect()
      if (old.docHandler) document.removeEventListener('click', old.docHandler, true)
      pickerListeners.delete(player)
    }
    return
  }
  nextTick(() => {
    const picker = el.querySelector('em-emoji-picker')
    if (picker) { attachPickerListener(picker, player, el); return }
    const observer = new MutationObserver(() => {
      const p = el.querySelector('em-emoji-picker')
      if (p) { observer.disconnect(); attachPickerListener(p, player, el) }
    })
    observer.observe(el, { childList: true, subtree: true })
    pickerListeners.set(player, { el, handler: () => {}, observer })
  })
}

function togglePicker(player: string) {
  if (pickerTarget.value === player) {
    pickerTarget.value = null
  } else {
    pickerTarget.value = player
    nextTick(() => computePickerPos(player))
  }
}

function onThrow(emoji: string, toPlayer: string) {
  store.emitEmojiThrow(toPlayer, emoji)
  pickerTarget.value = null
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { pickerTarget.value = null; hoveredPlayer.value = null }
}

const onResize = () => {
  if (pickerTarget.value) computePickerPos(pickerTarget.value)
}

onMounted(async () => {
  const { Picker } = await import('emoji-mart')
  new Picker({ set: 'native' })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  pickerListeners.forEach(({ docHandler, observer }) => {
    observer?.disconnect()
    if (docHandler) document.removeEventListener('click', docHandler, true)
  })
  pickerListeners.clear()
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.card-flip {
  perspective: 1000px;
}

.card-flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.3s;
  transform-style: preserve-3d;
}

.flipped .card-flip-inner {
  transform: rotateY(180deg);
}

.card-flip-front,
.card-flip-back {
  backface-visibility: hidden;
}

.card-flip-back {
  position: absolute;
  inset: 0;
  transform: rotateY(180deg);
}
</style>
