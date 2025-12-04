<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Define types
interface Message {
  role: 'assistant' | 'user' | 'system'
  content: string
}

// State
const title = ref<string>('')
const fullTitle = 'Compare OpenAI, Anthropic, and Gemini side by side...'
const typeDelay = 30
const openaiChatHistory = ref<Message[]>([{ role: 'assistant', content: '' }])
const anthropicChatHistory = ref<Message[]>([{ role: 'assistant', content: '' }])
const geminiChatHistory = ref<Message[]>([{ role: 'assistant', content: '' }])
const openaiLoading = ref<boolean>(false)
const anthropicLoading = ref<boolean>(false)
const geminiLoading = ref<boolean>(false)
const message = ref<string>('')

// Methods
const typeText = async () => {
  for (let i = 0; i < fullTitle.length; i++) {
    await new Promise(resolve => setTimeout(resolve, typeDelay))
    title.value = fullTitle.slice(0, i + 1)
  }
}

//Scroll messages as they are added
const scrollToEnd = (provider: 'openai' | 'anthropic' | 'gemini') => {
  setTimeout(() => {
    const chatMessages = document.querySelector(`.${provider}-messages > div:last-child`)
    chatMessages?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, 50)
}

//Send prompt to all three APIs
const sendPrompt = async () => {
  if (!message.value) return

  const userMessage = message.value
  message.value = ''

  // Add user message to all chat histories
  openaiChatHistory.value.push({
    role: 'user',
    content: userMessage
  })
  anthropicChatHistory.value.push({
    role: 'user',
    content: userMessage
  })
  geminiChatHistory.value.push({
    role: 'user',
    content: userMessage
  })

  scrollToEnd('openai')
  scrollToEnd('anthropic')
  scrollToEnd('gemini')

  // Send to OpenAI
  openaiLoading.value = true
  fetch('/api/openai', {
    method: 'POST',
    body: JSON.stringify(openaiChatHistory.value.slice(1))
  })
    .then(async (res) => {
      if (res.ok) {
        const response = await res.json()
        openaiChatHistory.value.push({
          role: 'assistant',
          content: response?.message
        })
      } else {
        throw new Error('OpenAI API request failed')
      }
    })
    .catch((error) => {
      openaiChatHistory.value.push({
        role: 'system',
        content: 'Sorry, an error occurred with OpenAI.'
      })
    })
    .finally(() => {
      openaiLoading.value = false
      scrollToEnd('openai')
    })

  // Send to Anthropic
  anthropicLoading.value = true
  fetch('/api/anthropic', {
    method: 'POST',
    body: JSON.stringify(anthropicChatHistory.value.slice(1))
  })
    .then(async (res) => {
      if (res.ok) {
        const response = await res.json()
        anthropicChatHistory.value.push({
          role: 'assistant',
          content: response?.message
        })
      } else {
        throw new Error('Anthropic API request failed')
      }
    })
    .catch((error) => {
      anthropicChatHistory.value.push({
        role: 'system',
        content: 'Sorry, an error occurred with Anthropic.'
      })
    })
    .finally(() => {
      anthropicLoading.value = false
      scrollToEnd('anthropic')
    })

  // Send to Gemini
  geminiLoading.value = true
  fetch('/api/gemini', {
    method: 'POST',
    body: JSON.stringify(geminiChatHistory.value.slice(1))
  })
    .then(async (res) => {
      if (res.ok) {
        const response = await res.json()
        geminiChatHistory.value.push({
          role: 'assistant',
          content: response?.message
        })
      } else {
        throw new Error('Gemini API request failed')
      }
    })
    .catch((error) => {
      geminiChatHistory.value.push({
        role: 'system',
        content: 'Sorry, an error occurred with Gemini.'
      })
    })
    .finally(() => {
      geminiLoading.value = false
      scrollToEnd('gemini')
    })
}

// Initialize typing animation
onMounted(() => {
  typeText()
})
</script>

<template>
  <div class="min-h-screen bg-gradient flex items-center px-4 md:px-8 py-8">
    <div class="max-w-7xl mx-auto w-full flex flex-col space-y-8">
      <h1 class="text-2xl font-bold text-center text-white">
        {{ title }}<span class="animate-pulse">|</span>
      </h1>

      <!-- Triple chat interface -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
        <!-- OpenAI Chat -->
        <div class="flex flex-col space-y-4">
          <div class="flex justify-center items-center space-x-2">
            <img src="/openai.svg" alt="OpenAI Logo" class="w-8 h-8 logo-container" />
            <h2 class="text-lg font-semibold text-white">OpenAI</h2>
          </div>

          <div class="bg-[#1C1C1C] rounded-2xl shadow-lg h-[60vh] flex flex-col justify-between">
            <div class="h-full overflow-auto openai-messages p-6">
              <div
                v-for="(msg, i) in openaiChatHistory"
                :key="i"
                class="flex flex-col mb-4"
              >
                <div
                  :class="[
                    msg.role === 'assistant' ? 'pr-8' : 'pl-8 ml-auto',
                  ]"
                >
                  <div class="p-3 text-sm text-white bg-[#2C2C2C] rounded-2xl" :class="[
                    msg.role === 'assistant' ? 'max-w-[80%]' : ''
                  ]">
                    {{ msg.content }}
                  </div>
                </div>
              </div>
              <div
                v-if="openaiLoading"
                class="p-4 ml-10 mr-auto"
              >
                <span class="loader" />
              </div>
            </div>
          </div>
        </div>

        <!-- Anthropic Chat -->
        <div class="flex flex-col space-y-4">
          <div class="flex justify-center items-center space-x-2">
            <img src="/anthropic.svg" alt="Anthropic Logo" class="w-8 h-8 logo-container" />
            <h2 class="text-lg font-semibold text-white">Anthropic</h2>
          </div>

          <div class="bg-[#1C1C1C] rounded-2xl shadow-lg h-[60vh] flex flex-col justify-between">
            <div class="h-full overflow-auto anthropic-messages p-6">
              <div
                v-for="(msg, i) in anthropicChatHistory"
                :key="i"
                class="flex flex-col mb-4"
              >
                <div
                  :class="[
                    msg.role === 'assistant' ? 'pr-8' : 'pl-8 ml-auto',
                  ]"
                >
                  <div class="p-3 text-sm text-white bg-[#2C2C2C] rounded-2xl" :class="[
                    msg.role === 'assistant' ? 'max-w-[80%]' : ''
                  ]">
                    {{ msg.content }}
                  </div>
                </div>
              </div>
              <div
                v-if="anthropicLoading"
                class="p-4 ml-10 mr-auto"
              >
                <span class="loader" />
              </div>
            </div>
          </div>
        </div>

        <!-- Gemini Chat -->
        <div class="flex flex-col space-y-4">
          <div class="flex justify-center items-center space-x-2">
            <svg class="w-8 h-8 logo-container" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#4285F4"/>
              <path d="M12 2L12 22" stroke="white" stroke-width="1"/>
              <path d="M2 7L22 17" stroke="white" stroke-width="1"/>
              <path d="M2 17L22 7" stroke="white" stroke-width="1"/>
            </svg>
            <h2 class="text-lg font-semibold text-white">Gemini</h2>
          </div>

          <div class="bg-[#1C1C1C] rounded-2xl shadow-lg h-[60vh] flex flex-col justify-between">
            <div class="h-full overflow-auto gemini-messages p-6">
              <div
                v-for="(msg, i) in geminiChatHistory"
                :key="i"
                class="flex flex-col mb-4"
              >
                <div
                  :class="[
                    msg.role === 'assistant' ? 'pr-8' : 'pl-8 ml-auto',
                  ]"
                >
                  <div class="p-3 text-sm text-white bg-[#2C2C2C] rounded-2xl" :class="[
                    msg.role === 'assistant' ? 'max-w-[80%]' : ''
                  ]">
                    {{ msg.content }}
                  </div>
                </div>
              </div>
              <div
                v-if="geminiLoading"
                class="p-4 ml-10 mr-auto"
              >
                <span class="loader" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Shared input at the bottom -->
      <form @submit.prevent="sendPrompt" class="max-w-3xl mx-auto w-full">
        <div class="p-4 bg-[#1C1C1C] border border-[#2C2C2C] rounded-2xl">
          <div class="flex items-center w-full gap-2">
            <input
              v-model="message"
              type="text"
              placeholder="Ask all three models anything..."
              class="w-full p-3 text-sm text-white bg-[#2C2C2C] rounded-xl border-none focus:ring-0 focus:outline-none"
            />
            <button
              type="submit"
              class="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </form>

      <div class="flex justify-center items-center space-x-6">
        <NuxtLink
          to="https://netlify.com/"
          class="flex items-center font-medium underline transition-colors underline-offset-4 hover:text-white/70"
        >
          <img src="/netlify.svg" class="h-6" alt="Netlify Logo" />
        </NuxtLink>
        <NuxtLink
          to="https://nuxt.com/docs"
          class="flex items-center font-medium underline transition-colors underline-offset-4 hover:text-white/70"
        >
          <img src="/nuxt.svg" class="h-6" alt="Nuxt Logo" />
        </NuxtLink>
        <NuxtLink
          to="https://github.com/Netlify-Moneytronic/ai-gateway-example"
          class="flex items-center font-medium underline transition-colors underline-offset-4 hover:text-white/70"
        >
          <img src="/github.svg" class="h-4" alt="GitHub Logo" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style>
html, 
body {
  overflow: hidden;
  overscroll-behavior: none;
  height: 100%;
}

.bg-gradient {
  background: radial-gradient(100% 100% at 50% 50%, #000000, #001615, #000000);
  background-size: 400% 400%;
  animation: gradientBg 30s ease infinite;
}

@keyframes gradientBg {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.loader {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: block;
  position: relative;
  color: #2C2C2C;
  box-sizing: border-box;
  animation: animloader 2s linear infinite;
}

@keyframes animloader {
  0% { box-shadow: 14px 0 0 -2px, 38px 0 0 -2px, -14px 0 0 -2px, -38px 0 0 -2px; }
  25% { box-shadow: 14px 0 0 -2px, 38px 0 0 -2px, -14px 0 0 -2px, -38px 0 0 2px; }
  50% { box-shadow: 14px 0 0 -2px, 38px 0 0 -2px, -14px 0 0 2px, -38px 0 0 -2px; }
  75% { box-shadow: 14px 0 0 2px, 38px 0 0 -2px; }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.logo-container {
  animation: pulse 5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
  }
}
</style>