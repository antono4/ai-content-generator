import { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { 
  Sparkles, 
  FileText, 
  Mail, 
  Youtube, 
  Hash, 
  MessageSquare,
  Globe,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  Zap
} from 'lucide-react'
import { generateContent, getHealth, type GenerationResponse } from './services/api'

// Content types configuration
const CONTENT_TYPES = [
  { id: 'blog_post', name: 'Blog Post', icon: FileText, color: 'bg-blue-500 hover:bg-blue-600' },
  { id: 'social_media', name: 'Social Media', icon: MessageSquare, color: 'bg-pink-500 hover:bg-pink-600' },
  { id: 'email', name: 'Email', icon: Mail, color: 'bg-purple-500 hover:bg-purple-600' },
  { id: 'youtube_script', name: 'YouTube Script', icon: Youtube, color: 'bg-red-500 hover:bg-red-600' },
  { id: 'seo_content', name: 'SEO Content', icon: Hash, color: 'bg-green-500 hover:bg-green-600' },
  { id: 'product_description', name: 'Product', icon: Globe, color: 'bg-orange-500 hover:bg-orange-600' },
]

const TONES = ['professional', 'casual', 'friendly', 'formal', 'witty', 'empathetic']
const LANGUAGES = [
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
]
const LENGTHS = [
  { value: 'short', label: 'Short', words: '~150 words' },
  { value: 'medium', label: 'Medium', words: '~500 words' },
  { value: 'long', label: 'Long', words: '~1000 words' },
]

function App() {
  const [contentType, setContentType] = useState('blog_post')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [language, setLanguage] = useState('id')
  const [length, setLength] = useState('medium')
  const [keywords, setKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerationResponse | null>(null)
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await getHealth()
        setApiStatus(health.status === 'healthy' ? 'connected' : 'disconnected')
      } catch {
        setApiStatus('disconnected')
      }
    }
    checkHealth()
  }, [])

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic!', {
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #374151',
        }
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await generateContent({
        content_type: contentType,
        topic,
        tone,
        language,
        length,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      })

      if (response.success && response.data) {
        setResult(response)
        toast.success('Content generated successfully! 🎉', {
          style: {
            background: '#065f46',
            color: '#fff',
            border: '1px solid #059669',
          }
        })
      } else {
        toast.error(response.error || 'Failed to generate content', {
          style: {
            background: '#7f1d1d',
            color: '#fff',
            border: '1px solid #dc2626',
          }
        })
      }
    } catch (error) {
      toast.error('Failed to connect to API. Make sure the backend is running!', {
        style: {
          background: '#7f1d1d',
          color: '#fff',
          border: '1px solid #dc2626',
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string = 'Content') => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`, {
      style: {
        background: '#1f2937',
        color: '#fff',
        border: '1px solid #374151',
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Content Generator</h1>
                <p className="text-sm text-gray-400">Generate content with AI in seconds</p>
              </div>
            </div>
            
            {/* API Status */}
            <div className="flex items-center gap-2">
              {apiStatus === 'loading' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-full">
                  <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                  <span className="text-sm text-yellow-400">Checking...</span>
                </div>
              )}
              {apiStatus === 'connected' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">API Connected</span>
                </div>
              )}
              {apiStatus === 'disconnected' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-full">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">Demo Mode</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Configure Content</h2>
            </div>

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
                      className={`flex items-center gap-2 p-3 rounded-xl transition-all text-white ${
                        contentType === type.id
                          ? `${type.color} shadow-lg shadow-purple-500/25`
                          : 'bg-white/5 hover:bg-white/10 border border-white/5'
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-gray-900">
                      {lang.flag} {lang.name}
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
              <div className="grid grid-cols-3 gap-3">
                {LENGTHS.map((len) => (
                  <button
                    key={len.value}
                    onClick={() => setLength(len.value)}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                      length === len.value
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <div>{len.label}</div>
                    <div className={`text-xs mt-1 ${length === len.value ? 'text-purple-200' : 'text-gray-500'}`}>
                      {len.words}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Keywords <span className="text-gray-500">(comma separated)</span>
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., AI, technology, innovation"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-size-200 hover:bg-pos-100 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating amazing content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>

          {/* Results */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Generated Content</h2>
              </div>
              {result?.data && (
                <button
                  onClick={() => result.data && copyToClipboard(result.data.content)}
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy All
                </button>
              )}
            </div>

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500 animate-pulse">
                <Sparkles className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg">Your content will appear here</p>
                <p className="text-sm mt-2 opacity-70">Configure settings and click Generate</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full" />
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
                </div>
                <p className="mt-6 text-gray-400 font-medium">Generating content...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
              </div>
            )}

            {result?.data && (
              <div className="space-y-4 animate-fade-in">
                {/* Title */}
                {result.data.title && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-medium text-purple-400 uppercase tracking-wide mb-1">Title</h3>
                        <p className="text-white font-semibold text-lg">{result.data.title}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(result.data!.title, 'Title')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div>
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Content</h3>
                  <div className="bg-black/30 rounded-xl p-4 max-h-96 overflow-y-auto custom-scrollbar">
                    <pre className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed font-sans">
                      {result.data.content}
                    </pre>
                  </div>
                </div>

                {/* Meta Description */}
                {result.data.meta_description && (
                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                    <h3 className="text-xs font-medium text-green-400 uppercase tracking-wide mb-1">Meta Description</h3>
                    <p className="text-gray-300 text-sm">{result.data.meta_description}</p>
                  </div>
                )}

                {/* Hashtags */}
                {result.data.hashtags && result.data.hashtags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Hashtags</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.data.hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-pink-500/20 text-pink-400 rounded-full text-sm hover:bg-pink-500/30 transition-all cursor-pointer"
                          onClick={() => copyToClipboard(tag, 'Hashtag')}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                {result.usage && (
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Model:</span>
                      <span className="text-sm text-purple-400 font-mono">{result.usage.model}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Tokens:</span>
                      <span className="text-sm text-blue-400 font-mono">{result.usage.tokens_used}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Cost:</span>
                      <span className="text-sm text-green-400 font-mono">{result.usage.cost}</span>
                    </div>
                    {result.data.word_count && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Words:</span>
                        <span className="text-sm text-white font-mono">{result.data.word_count}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error State */}
            {result && !result.success && (
              <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-400 font-medium">Generation Failed</p>
                <p className="text-gray-400 text-sm mt-1">{result.error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">13 Content Types</h3>
            <p className="text-gray-400 text-sm">Blog posts, social media, emails, YouTube scripts, and more</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="p-3 bg-green-500/20 rounded-xl w-fit mb-4">
              <Globe className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Multi-Language</h3>
            <p className="text-gray-400 text-sm">Generate content in Indonesian, English, Malay, and more</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">AI Powered</h3>
            <p className="text-gray-400 text-sm">Powered by GPT-4 and Claude for high-quality content</p>
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
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            @antono4
          </a>
          {' • '}
          <a
            href="https://github.com/antono4/ai-content-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </footer>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .bg-size-200 {
          background-size: 200% 100%;
        }
        .hover\\:bg-pos-100:hover {
          background-position: 100% 0;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export default App
