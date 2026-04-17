import { ref, type Ref } from 'vue'

export interface EmojiImpact {
  id: number
  emoji: string
}

/**
 * Composable for emoji throwing animation logic
 */
export function useEmojiAnimation(
  cardRefs: Map<string, HTMLElement>,
  triggerImpact: (emoji: string, player: string) => void
) {
  /**
   * Launch an emoji from a random edge to a target player
   */
  function launchEmoji(emoji: string, toPlayer: string) {
    const targetEl = cardRefs.get(toPlayer)
    if (!targetEl) return

    const targetRect = targetEl.getBoundingClientRect()
    const toX = targetRect.left + targetRect.width / 2
    const toY = targetRect.top + targetRect.height / 2

    // Random edge: 0=left, 1=right, 2=top, 3=bottom
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

  return {
    launchEmoji,
  }
}

/**
 * Composable for emoji picker positioning
 */
export function useEmojiPickerPosition(
  cardRefs: Map<string, HTMLElement>,
  pickerPos: Ref<Record<string, string>>
) {
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

  return {
    computePickerPos,
  }
}
