import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Sparkles, FileText, Mail, Youtube, Hash, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

// Content types configuration
const CONTENT_TYPES = [
  { id: 'blog_post', name: 'Blog Post', icon: FileText, color: 'bg-blue-500' },
  { id: 'social_media', name: 'Social Media', icon: MessageSquare, color: 'bg-pink-500' },
  { id: 'email', name: 'Email', icon: Mail, color: 'bg-purple-500' },
  { id: 'youtube_script', name: 'YouTube Script', icon: Youtube, color: 'bg-red-500' },
  { id: 'seo_content', name: 'SEO Content', icon: Hash, color: 'bg-green-500' },
]

const TONES = ['professional', 'casual', 'friendly', 'formal', 'witty', 'empathetic']
const LANGUAGES = [
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'en', name: 'English' },
  { code: 'ms', name: 'Bahasa Melayu' },
]
const LENGTHS = [
  { value: 'short', label: 'Short (~150 words)' },
  { value: 'medium', label: 'Medium (~500 words)' },
  { value: 'long', label: 'Long (~1000 words)' },
]

interface GeneratedContent {
  title: string
  content: string
  meta_description?: string
  hashtags?: string[]
  reading_time?: string
  word_count?: number
}

function App() {
  const [contentType, setContentType] = useState('blog_post')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [language, setLanguage] = useState('id')
  const [length, setLength] = useState('medium')
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeneratedContent | null>(null)
  const [usage, setUsage] = useState<any>(null)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('http://localhost:8000/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: contentType,
          topic,
          tone,
          language,
          length,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        setUsage(data.usage)
        toast.success('Content generated successfully!')
      } else {
        toast.error(data.error || 'Failed to generate content')
      }
    } catch (error) {
      toast.error('Failed to connect to API. Make sure the backend is running!')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Content Generator</h1>
              <p className="text-sm text-gray-400">Generate content with AI in seconds</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-6">Configure Content</h2>

            {/* Content Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Content Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CONTENT_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => setContentType(type.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                        contentType === type.id
                          ? `${type.color} text-white`
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{type.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Topic */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Topic / Keyword
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Benefits of AI in Education"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Tone & Language */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t} className="bg-gray-900">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-gray-900">
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Length */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Length
              </label>
              <div className="flex gap-3">
                {LENGTHS.map((len) => (
                  <button
                    key={len.value}
                    onClick={() => setLength(len.value)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      length === len.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {len.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Keywords (comma separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., AI, technology, innovation"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Content
                </>
              )}
            </button>
          </div>

          {/* Results */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Generated Content</h2>
              {result && (
                <button
                  onClick={() => copyToClipboard(result.content)}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Copy All
                </button>
              )}
            </div>

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <Sparkles className="w-16 h-16 mb-4 opacity-50" />
                <p>Your generated content will appear here</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <p className="mt-4 text-gray-400">Generating content...</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Title</h3>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-semibold">{result.title}</p>
                    <button
                      onClick={() => copyToClipboard(result.title)}
                      className="text-gray-500 hover:text-white"
                    >
                      📋
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Content</h3>
                  <div className="bg-black/20 rounded-xl p-4 max-h-80 overflow-y-auto">
                    <pre className="text-gray-300 whitespace-pre-wrap text-sm font-sans">
                      {result.content}
                    </pre>
                  </div>
                </div>

                {/* Meta Description */}
                {result.meta_description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Meta Description</h3>
                    <p className="text-gray-300 text-sm bg-black/20 rounded-lg p-3">
                      {result.meta_description}
                    </p>
                  </div>
                )}

                {/* Hashtags */}
                {result.hashtags && result.hashtags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Hashtags</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage Stats */}
                {usage && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">Model:</span>{' '}
                        <span className="text-white">{usage.model}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tokens:</span>{' '}
                        <span className="text-white">{usage.tokens_used}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cost:</span>{' '}
                        <span className="text-green-400">{usage.cost}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          Built with ❤️ by{' '}
          <a
            href="https://github.com/antono4"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300"
          >
            @antono4
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
