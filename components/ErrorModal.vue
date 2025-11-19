<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="message" class="error-overlay" @click="close">
        <div class="error-panel" @click.stop>
          <h3 class="error-title">Error</h3>
          <p class="error-message">{{ message }}</p>
          <div class="error-actions">
            <button class="error-btn" @click="close">Close</button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoomStore } from '../stores/room'
const store = useRoomStore()
const message = computed(() => store.error)
const close = () => {
  const shouldRedirect = store.errorRedirect
  store.setError('')
  if(shouldRedirect && typeof window !== 'undefined'){
    window.location.href = '/'
  } else if(store.needNameModal){
    // leave modal state to NameModal (store.needNameModal already true)
  }
}
</script>
<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .15s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
.error-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(15,30,51,.78);backdrop-filter:blur(6px);z-index:1100;}
.error-panel{width:360px;background:#2d1f1f;border:1px solid #5c2d2d;border-radius:18px;padding:26px 28px;box-shadow:0 10px 32px -6px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.04);color:#f8fafc;font-family:inherit;}
.error-title{font-size:17px;font-weight:600;margin:0 0 14px;letter-spacing:.5px;color:#fecaca;}
.error-message{font-size:14px;line-height:1.5;color:#fee2e2;margin:0 0 20px;}
.error-actions{text-align:center;}
.error-btn{background:#dc2626;color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border:none;border-radius:10px;cursor:pointer;letter-spacing:.4px;box-shadow:0 6px 18px -6px rgba(220,38,38,.55);transition:background .15s,transform .15s;}
.error-btn:hover{background:#b91c1c;}
.error-btn:active{transform:translateY(1px);}
</style>
