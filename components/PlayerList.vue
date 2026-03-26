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
      :ref="el => registerCard(el as HTMLElement | null, p)"
      class="flex flex-col items-center gap-2 relative"
      @mouseenter="hoveredPlayer = p"
      @mouseleave="hoveredPlayer = null"
    >
      <!-- Impact bursts — one per incoming emoji, stacked -->
      <div
        v-for="impact in (impactMap[p] ?? [])"
        :key="impact.id"
        class="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
      >
        <div class="impact-ring" />
        <span class="impact-emoji text-4xl">{{ impact.emoji }}</span>
      </div>

      <!-- Quick emoji bar shown on hover -->
      <Transition name="quickbar">
        <div
          v-if="hoveredPlayer === p && p !== currentPlayer"
          class="absolute -top-12 left-1/2 -translate-x-1/2 z-[101] flex items-center gap-1 px-2 py-1.5 rounded-2xl shadow-xl border"
          :class="dark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'"
          @mouseenter="hoveredPlayer = p"
          @mouseleave="hoveredPlayer = null"
          @click.stop
        >
          <button
            v-for="emoji in quickEmojis"
            :key="emoji"
            class="text-xl w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-100 hover:scale-125 cursor-pointer"
            :class="dark ? 'hover:bg-sky-500/20' : 'hover:bg-sky-100'"
            @click="onThrow(emoji, p)"
          >
            {{ emoji }}
          </button>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-100 font-bold text-lg cursor-pointer"
            :class="dark ? 'text-slate-400 hover:text-sky-400 hover:bg-sky-500/20' : 'text-slate-500 hover:text-sky-500 hover:bg-sky-100'"
            @click.stop="togglePicker(p)"
            title="More emojis"
          >
            +
          </button>
        </div>
      </Transition>

      <!-- Card -->
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

  <Teleport to="body">
    <template v-for="p in players" :key="'picker-' + p">
      <div
        v-if="pickerTarget === p"
        class="picker-wrapper fixed z-[102]"
        :style="pickerPos"
        @click.stop
        :ref="el => registerPicker(el as HTMLElement | null, p)"
      >
        <em-emoji-picker
          :theme="dark ? 'dark' : 'light'"
          set="native"
        />
      </div>
    </template>
  </Teleport>

  <div
    v-if="pickerTarget"
    class="fixed inset-0 z-[99]"
    @click="pickerTarget = null; hoveredPlayer = null"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useEmojiThrow } from '../composables/useEmojiThrow'
import { useRoomStore } from '../stores/room'

const props = defineProps<{
  players: string[]
  votes: Record<string, any>
  revealed: boolean
  currentPlayer: string
}>()

const { dark } = useTheme()
const { activeThrows } = useEmojiThrow()
const store = useRoomStore() as any

const hoveredPlayer = ref<string | null>(null)
const pickerTarget = ref<string | null>(null)
const pickerPos = ref<Record<string, string>>({})
const quickEmojis = ['🎯', '✈️', '🪨', '❤️', '🧻', '💩']

const pickerListeners = new Map<string, {
  el: HTMLElement
  handler: (e: Event) => void
  docHandler?: (e: Event) => void
  observer?: MutationObserver
}>()

const cardRefs = new Map<string, HTMLElement>()

interface ImpactEntry { id: number; emoji: string }
const impactMap = ref<Record<string, ImpactEntry[]>>({})
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

function computePickerPos(player: string) {
  const cardEl = cardRefs.get(player)
  if (!cardEl) return
  const rect = cardEl.getBoundingClientRect()
  const pickerWidth = 320
  const pickerHeight = 380
  let left = rect.left + rect.width / 2 - pickerWidth / 2
  left = Math.max(8, Math.min(left, window.innerWidth - pickerWidth - 8))
  let top = rect.bottom + 60
  if (top + pickerHeight > window.innerHeight - 8) {
    top = rect.top - pickerHeight - 60
  }
  pickerPos.value = { left: `${left}px`, top: `${top}px` }
}

function launchEmoji(emoji: string, toPlayer: string) {
  const targetEl = cardRefs.get(toPlayer)
  if (!targetEl) return
  if (!props.players.includes(toPlayer)) return

  const targetRect = targetEl.getBoundingClientRect()
  const toX = targetRect.left + targetRect.width / 2
  const toY = targetRect.top + targetRect.height / 2

  const edge = Math.floor(Math.random() * 4)
  let fromX: number
  let fromY: number
  switch (edge) {
    case 0: fromX = -40; fromY = Math.random() * window.innerHeight; break
    case 1: fromX = window.innerWidth + 40; fromY = Math.random() * window.innerHeight; break
    case 2: fromX = Math.random() * window.innerWidth; fromY = -40; break
    default: fromX = Math.random() * window.innerWidth; fromY = window.innerHeight + 40; break
  }

  const dx = toX - fromX
  const dy = toY - fromY
  const perpX = -dy * 0.15
  const perpY = dx * 0.15
  const ctrlX = fromX + dx * 0.5 + perpX
  const ctrlY = fromY + dy * 0.5 + perpY

  const spinDir = Math.random() > 0.5 ? 1 : -1
  const totalSpin = spinDir * (120 + Math.random() * 180)
  const duration = 800

  const el = document.createElement('div')
  el.style.cssText = `
    position: fixed;
    font-size: 2rem;
    z-index: 9999;
    pointer-events: none;
    left: 0;
    top: 0;
    will-change: transform;
    transform-origin: center;
    opacity: 1;
  `
  el.textContent = emoji
  document.body.appendChild(el)

  const startTime = performance.now()

  function frame(now: number) {
    const t = Math.min((now - startTime) / duration, 1)
    const inv = 1 - t
    const x = inv * inv * fromX + 2 * inv * t * ctrlX + t * t * toX
    const y = inv * inv * fromY + 2 * inv * t * ctrlY + t * t * toY
    const rotate = totalSpin * t

    el.style.transform = `translate(${x - 16}px, ${y - 16}px) rotate(${rotate}deg)`

    if (t < 1) {
      requestAnimationFrame(frame)
    } else {
      document.body.removeChild(el)
      triggerImpact(emoji, toPlayer)
    }
  }

  requestAnimationFrame(frame)
}

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
.impact-emoji {
  position: absolute;
  animation: impact-pop 0.7s linear forwards;
  z-index: 51;
}

.impact-ring {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid currentColor;
  animation: ring-expand 0.7s linear forwards;
  opacity: 0.6;
}

@keyframes impact-pop {
  0%   { transform: scale(0.2); opacity: 1; }
  40%  { transform: scale(1.8); opacity: 1; }
  70%  { transform: scale(1.3); opacity: 0.8; }
  100% { transform: scale(1.0); opacity: 0; }
}

@keyframes ring-expand {
  0%   { transform: scale(0.2); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
}

.quickbar-enter-active,
.quickbar-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.quickbar-enter-from,
.quickbar-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

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