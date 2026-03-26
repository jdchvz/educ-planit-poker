<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2" ref="widgetRef">
    <Transition name="fade">
      <div
        v-if="showFeedback"
        class="rounded-2xl shadow-xl p-4 w-72 transition-colors duration-300"
        :class="dark ? 'bg-[#1a2f4a] text-slate-200' : 'bg-white text-slate-800'"
      >
        <p class="font-semibold text-sm mb-2">Send Feedback</p>

        <!-- Success Message -->
        <div v-if="submitted" class="text-center py-4">
          <p class="text-green-400 font-semibold text-sm">✅ Thanks for your feedback!</p>
        </div>

        <!-- Error Message -->
        <div v-else-if="error" class="text-center py-2">
          <p class="text-red-400 text-xs mb-2">❌ Something went wrong. Try again.</p>
        </div>

        <template v-if="!submitted">
          <textarea
            ref="textareaRef"
            v-model="feedbackText"
            rows="3"
            placeholder="Share your thoughts..."
            class="w-full rounded-lg text-sm p-2 resize-none outline-none transition-colors duration-300"
            :class="dark ? 'bg-[#0f1e33] text-slate-200 placeholder-slate-500' : 'bg-slate-100 text-slate-800 placeholder-slate-400'"
            @keydown.enter.exact.prevent="submitFeedback"
            @keydown.shift.enter.exact="() => feedbackText += '\n'"
            @keydown.esc="showFeedback = false"
          />
          <div class="flex justify-end gap-2 mt-2">
            <button
              @click="showFeedback = false"
              class="text-xs px-3 py-1.5 rounded-lg transition-colors duration-200"
              :class="dark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'"
            >Cancel</button>
            <button
              @click="submitFeedback"
              :disabled="loading || !feedbackText.trim()"
              class="text-xs px-3 py-1.5 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Sending...' : 'Submit' }}
            </button>
          </div>
        </template>
      </div>
    </Transition>

    <button
      @click="toggleWidget"
      class="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg font-semibold text-sm bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200"
    >
      💬 Feedback
    </button>
  </div>
</template>

<script setup>
const { dark } = useTheme()
const config = useRuntimeConfig()

const showFeedback = ref(false)
const feedbackText = ref('')
const loading = ref(false)
const submitted = ref(false)
const error = ref(false)
const widgetRef = ref(null)
const textareaRef = ref(null)

// Expose ref so parent can handle outside click (same as invite button)
defineExpose({ widgetRef })

const toggleWidget = () => {
  showFeedback.value = !showFeedback.value
  if (showFeedback.value) {
    submitted.value = false
    error.value = false
    feedbackText.value = ''
    nextTick(() => textareaRef.value?.focus())
  }
}

// Close if click is outside the widget
const handleOutsideClick = (e) => {
  if (widgetRef.value && !widgetRef.value.contains(e.target)) {
    showFeedback.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))

const submitFeedback = async () => {
  if (!feedbackText.value.trim()) return

  loading.value = true
  error.value = false

  try {
    const res = await fetch(`https://formspree.io/f/${config.public.formspreeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: feedbackText.value,
        _subject: 'New Feedback - PlanIt Poker',
      }),
    })

    if (res.ok) {
      submitted.value = true
      feedbackText.value = ''
      setTimeout(() => {
        showFeedback.value = false
        submitted.value = false
      }, 3000)
    } else {
      error.value = true
    }
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>