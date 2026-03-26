import { ref } from 'vue'

export interface EmojiThrow {
  id: number
  emoji: string
  from: string
  to: string
}

const activeThrows = ref<EmojiThrow[]>([])
let nextId = 0

export function useEmojiThrow() {
  function addThrow(emoji: string, from: string, to: string) {
    const id = nextId++
    activeThrows.value.push({ id, emoji, from, to })
    setTimeout(() => {
      activeThrows.value = activeThrows.value.filter(t => t.id !== id)
    }, 2000)
  }

  function clearAll() {
    activeThrows.value = []
  }

  return { activeThrows, addThrow, clearAll }
}