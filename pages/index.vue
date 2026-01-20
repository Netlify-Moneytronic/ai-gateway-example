<script setup lang="ts">
import { ref } from 'vue'
import { marked } from 'marked'

// Configure marked for safe rendering
marked.setOptions({
  breaks: true,
  gfm: true
})

// Helper function to render markdown
const renderMarkdown = (content: string): string => {
  if (!content) return ''
  return marked(content) as string
}

// Define types
interface Message {
  role: 'assistant' | 'user' | 'system'
  content: string
}

// State
const title = 'Netlify AI Gateway Demo'
const openaiChatHistory = ref<Message[]>([])
const anthropicChatHistory = ref<Message[]>([])
const geminiChatHistory = ref<Message[]>([])
const openaiLoading = ref<boolean>(false)
const anthropicLoading = ref<boolean>(false)
const geminiLoading = ref<boolean>(false)
const message = ref<string>('')
const isContactModalOpen = ref<boolean>(false)

// Modal methods
const openContactModal = () => {
  isContactModalOpen.value = true
}

const closeContactModal = () => {
  isContactModalOpen.value = false
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
    body: JSON.stringify(openaiChatHistory.value)
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
    body: JSON.stringify(anthropicChatHistory.value)
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
    body: JSON.stringify(geminiChatHistory.value)
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
</script>

<template>
  <div class="h-screen bg-gradient flex flex-col px-4 md:px-6 py-4 overflow-hidden">
    <h1 class="text-xl md:text-2xl font-bold text-center text-white mb-4 flex-shrink-0">
      {{ title }}
    </h1>

    <!-- Triple chat interface -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0">
      <!-- OpenAI Chat -->
      <div class="flex flex-col min-h-0">
        <div class="flex flex-col justify-center items-center space-y-1 mb-2 flex-shrink-0">
          <div class="flex items-center space-x-2">
            <img src="/openai.svg" alt="OpenAI Logo" class="w-6 h-6 logo-container" />
            <h2 class="text-base font-semibold text-white">OpenAI</h2>
          </div>
          <span class="text-xs text-white/60">GPT 5.2 Pro</span>
        </div>

        <div class="bg-[#1C1C1C] rounded-2xl shadow-lg flex-1 flex flex-col min-h-0">
          <div class="flex-1 overflow-auto openai-messages p-4">
            <div
              v-for="(msg, i) in openaiChatHistory"
              :key="i"
              class="flex flex-col mb-4"
            >
              <div
                :class="[
                  msg.role === 'assistant' ? 'pr-4' : 'pl-4 ml-auto',
                ]"
              >
                <div
                  class="p-3 text-sm text-white bg-[#2C2C2C] rounded-2xl markdown-content"
                  :class="[msg.role === 'assistant' ? 'max-w-full' : '']"
                  v-html="msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content"
                ></div>
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
      <div class="flex flex-col min-h-0">
        <div class="flex flex-col justify-center items-center space-y-1 mb-2 flex-shrink-0">
          <div class="flex items-center space-x-2">
            <img src="/anthropic.svg" alt="Anthropic Logo" class="w-6 h-6 logo-container" />
            <h2 class="text-base font-semibold text-white">Anthropic</h2>
          </div>
          <span class="text-xs text-white/60">Claude Opus 4.5</span>
        </div>

        <div class="bg-[#1C1C1C] rounded-2xl shadow-lg flex-1 flex flex-col min-h-0">
          <div class="flex-1 overflow-auto anthropic-messages p-4">
            <div
              v-for="(msg, i) in anthropicChatHistory"
              :key="i"
              class="flex flex-col mb-4"
            >
              <div
                :class="[
                  msg.role === 'assistant' ? 'pr-4' : 'pl-4 ml-auto',
                ]"
              >
                <div
                  class="p-3 text-sm text-white bg-[#2C2C2C] rounded-2xl markdown-content"
                  :class="[msg.role === 'assistant' ? 'max-w-full' : '']"
                  v-html="msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content"
                ></div>
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
      <div class="flex flex-col min-h-0">
        <div class="flex flex-col justify-center items-center space-y-1 mb-2 flex-shrink-0">
          <div class="flex items-center space-x-2">
            <svg class="w-6 h-6 logo-container" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#4285F4"/>
              <path d="M12 2L12 22" stroke="white" stroke-width="1"/>
              <path d="M2 7L22 17" stroke="white" stroke-width="1"/>
              <path d="M2 17L22 7" stroke="white" stroke-width="1"/>
            </svg>
            <h2 class="text-base font-semibold text-white">Gemini</h2>
          </div>
          <span class="text-xs text-white/60">Gemini 3 Pro</span>
        </div>

        <div class="bg-[#1C1C1C] rounded-2xl shadow-lg flex-1 flex flex-col min-h-0">
          <div class="flex-1 overflow-auto gemini-messages p-4">
            <div
              v-for="(msg, i) in geminiChatHistory"
              :key="i"
              class="flex flex-col mb-4"
            >
              <div
                :class="[
                  msg.role === 'assistant' ? 'pr-4' : 'pl-4 ml-auto',
                ]"
              >
                <div
                  class="p-3 text-sm text-white bg-[#2C2C2C] rounded-2xl markdown-content"
                  :class="[msg.role === 'assistant' ? 'max-w-full' : '']"
                  v-html="msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content"
                ></div>
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
    <form @submit.prevent="sendPrompt" class="w-full mt-4 flex-shrink-0">
      <div class="p-3 bg-[#1C1C1C] border border-[#2C2C2C] rounded-2xl">
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

    <div class="flex justify-center items-center space-x-6 py-3 flex-shrink-0">
      <NuxtLink
        to="https://netlify.com/"
        class="flex items-center font-medium underline transition-colors underline-offset-4 hover:text-white/70"
      >
        <img src="/netlify.svg" class="h-5" alt="Netlify Logo" />
      </NuxtLink>
      <NuxtLink
        to="https://nuxt.com/docs"
        class="flex items-center font-medium underline transition-colors underline-offset-4 hover:text-white/70"
      >
        <img src="/nuxt.svg" class="h-5" alt="Nuxt Logo" />
      </NuxtLink>
      <NuxtLink
        to="https://github.com/Netlify-Moneytronic/ai-gateway-example"
        class="flex items-center font-medium underline transition-colors underline-offset-4 hover:text-white/70"
      >
        <img src="/github.svg" class="h-3" alt="GitHub Logo" />
      </NuxtLink>
      <NuxtLink
        to="https://docs.netlify.com/build/ai-gateway/overview/"
        class="flex items-center text-sm font-medium text-white/70 hover:text-white transition-colors underline underline-offset-4"
      >
        Built with Netlify AI Gateway
      </NuxtLink>
      <button
        @click="openContactModal"
        class="flex items-center text-sm font-medium text-white/70 hover:text-white transition-colors underline underline-offset-4"
      >
        Contact
      </button>
    </div>

    <!-- Contact Modal -->
    <div
      v-if="isContactModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="closeContactModal"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeContactModal"></div>

      <!-- Modal content -->
      <div class="relative bg-[#0f1a1a] border border-[#2C2C2C] rounded-2xl p-8 text-white shadow-xl max-w-xl w-full mx-4 z-10">
        <!-- Close button -->
        <button
          @click="closeContactModal"
          class="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="mb-6">
          <h3 class="text-lg font-semibold">Contact the team</h3>
          <p class="text-sm text-white/70">Questions, ideas, or feedback? Drop a note and we will reply soon.</p>
        </div>

        <form
          name="contact"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input type="hidden" name="form-name" value="contact" />
          <div class="hidden">
            <label>
              Don't fill this out if you're human:
              <input name="bot-field" />
            </label>
          </div>

          <label class="flex flex-col space-y-1">
            <span class="text-sm font-medium text-white/80">Name</span>
            <input
              name="name"
              type="text"
              required
              class="p-3 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] focus:border-white/40 focus:outline-none text-sm"
              placeholder="Ada Lovelace"
            />
          </label>

          <label class="flex flex-col space-y-1">
            <span class="text-sm font-medium text-white/80">Email</span>
            <input
              name="email"
              type="email"
              required
              class="p-3 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] focus:border-white/40 focus:outline-none text-sm"
              placeholder="you@example.com"
            />
          </label>

          <label class="flex flex-col space-y-1 md:col-span-2">
            <span class="text-sm font-medium text-white/80">Message</span>
            <textarea
              name="message"
              rows="4"
              required
              class="p-3 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] focus:border-white/40 focus:outline-none text-sm"
              placeholder="Tell us what you're thinking about."
            ></textarea>
          </label>

          <div class="md:col-span-2 flex justify-end mt-2">
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition text-sm"
            >
              Send message
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
html, 
body {
  overflow-x: hidden;
  overflow-y: auto;
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

/* Markdown content styles */
.markdown-content {
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.markdown-content p {
  margin-bottom: 0.75rem;
}

.markdown-content p:last-child {
  margin-bottom: 0;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.markdown-content h1 { font-size: 1.25rem; }
.markdown-content h2 { font-size: 1.125rem; }
.markdown-content h3 { font-size: 1rem; }

.markdown-content ul,
.markdown-content ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.markdown-content ul {
  list-style-type: disc;
}

.markdown-content ol {
  list-style-type: decimal;
}

.markdown-content li {
  margin-bottom: 0.25rem;
}

.markdown-content code {
  background-color: #1a1a1a;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85em;
}

.markdown-content pre {
  background-color: #1a1a1a;
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  font-size: 0.8rem;
  line-height: 1.5;
}

.markdown-content blockquote {
  border-left: 3px solid #4a4a4a;
  padding-left: 0.75rem;
  margin: 0.75rem 0;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

.markdown-content a {
  color: #60a5fa;
  text-decoration: underline;
}

.markdown-content a:hover {
  color: #93c5fd;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.75rem 0;
  font-size: 0.85rem;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #3a3a3a;
  padding: 0.5rem;
  text-align: left;
}

.markdown-content th {
  background-color: #1a1a1a;
  font-weight: 600;
}

.markdown-content hr {
  border: none;
  border-top: 1px solid #3a3a3a;
  margin: 1rem 0;
}

.markdown-content strong {
  font-weight: 600;
}

.markdown-content em {
  font-style: italic;
}
</style>
