<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="show" class="modal-overlay">
        <div class="modal-panel" @click.stop>
          <h3 class="modal-title">Enter your name</h3>
          <input
            v-model="name"
            @keyup.enter="submit"
            placeholder="Your name"
            class="modal-input"
            autofocus
          />
          <div class="modal-actions">
            <button @click="submit" class="join-btn" :disabled="!name">Join</button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e:'submit', name:string): void }>()
const name = ref('')
const submit = () => { if(name.value){ emit('submit', name.value) } }
// Lock body scroll when modal visible
const lock = () => { document.body.style.overflow = 'hidden' }
const unlock = () => { document.body.style.overflow = '' }
watch(() => props.show, (v) => { v ? lock() : unlock() })
onUnmounted(unlock)
</script>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .18s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
.modal-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(10,15,25,.72);backdrop-filter:blur(4px);z-index:1000;}
.modal-panel{width:360px;background:#132a49;border:1px solid #1d3554;border-radius:18px;padding:26px 28px;box-shadow:0 10px 34px -6px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.05);color:#e2e8f0;font-family:inherit;}
.modal-title{font-size:18px;font-weight:600;margin:0 0 18px;letter-spacing:.6px;color:#f1f5f9;text-align:center;}
.modal-input{width:100%;background:#0f1e33;border:1px solid #2e4f70;border-radius:10px;padding:12px 14px;color:#f1f5f9;font-size:15px;outline:none;transition:border-color .15s,background .15s;}
.modal-input:focus{border-color:#3b82f6;background:#173256;}
.modal-actions{margin-top:22px;text-align:center;}
.join-btn{background:#2563eb;color:#fff;font-weight:600;font-size:15px;padding:12px 22px;border:none;border-radius:10px;cursor:pointer;letter-spacing:.4px;box-shadow:0 6px 20px -6px rgba(37,99,235,.65);transition:background .15s,transform .15s,box-shadow .15s;}
.join-btn:hover:not(:disabled){background:#1d4ed8;box-shadow:0 6px 18px -6px rgba(37,99,235,.7);}
.join-btn:active:not(:disabled){transform:translateY(1px);}
.join-btn:disabled{opacity:.4;cursor:not-allowed;}
</style>
