'use client'

import { useState } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FiCode,
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiArrowRight,
  FiLoader
} from 'react-icons/fi'

// Agent configuration
const AGENT_ID = '6986efc5e31e7bbb7ef459fd'

// Supported languages
const LANGUAGES = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C++',
  'C#',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'Dart',
  'SQL',
  'HTML/CSS',
]

// TypeScript interfaces based on actual response schema
interface ConversionResult {
  convertedCode: string
  explanation: string
  sourceLanguage: string
  targetLanguage: string
  conversionNotes: string[]
}

interface AgentResponse {
  status: 'success' | 'error'
  result: ConversionResult
  metadata?: {
    agent_name?: string
    timestamp?: string
  }
}

export default function Home() {
  // Form state
  const [sourceCode, setSourceCode] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('JavaScript')
  const [targetLanguage, setTargetLanguage] = useState('Python')

  // UI state
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showNotes, setShowNotes] = useState(true)

  // Handle conversion
  const handleConvert = async () => {
    if (!sourceCode.trim()) {
      setError('Please enter some code to convert')
      setTimeout(() => setError(null), 3000)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)
    setResult(null)

    try {
      // Create conversion message
      const message = `Convert the following code from ${sourceLanguage} to ${targetLanguage}:\n\n${sourceCode}`

      // Call AI agent
      const response = await callAIAgent(message, AGENT_ID)

      if (response.success && response.response.status === 'success') {
        setResult(response.response.result as ConversionResult)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 5000)
      } else {
        setError(response.error || 'Conversion failed. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle swap languages
  const handleSwap = () => {
    const temp = sourceLanguage
    setSourceLanguage(targetLanguage)
    setTargetLanguage(temp)
  }

  // Handle clear
  const handleClear = () => {
    setSourceCode('')
    setResult(null)
    setError(null)
    setSuccess(false)
  }

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (result?.convertedCode) {
      const success = await copyToClipboard(result.convertedCode)
      if (success) {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      }
    }
  }

  // Calculate stats
  const lineCount = sourceCode.split('\n').length
  const charCount = sourceCode.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <FiCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                CodeShift - AI Code Converter
              </h1>
              <p className="text-purple-200 text-sm mt-1">
                Transform code between languages with AI
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Status Messages */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center gap-3">
            <FiLoader className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-blue-200">Converting your code...</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-3">
            <FiCheck className="w-5 h-5 text-green-400" />
            <span className="text-green-200">Code converted successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
            <FiX className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Conversion Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6">
          {/* Input Section */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Source Code</CardTitle>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang} className="bg-slate-800">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                placeholder={`// Paste your ${sourceLanguage} code here...\n\nfunction greetUser(name, age) {\n  const greeting = \`Hello \${name}, you are \${age} years old!\`;\n  return greeting;\n}`}
                className="w-full h-[400px] p-4 bg-black/30 border border-white/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span>{lineCount} lines</span>
                <span>{charCount} characters</span>
              </div>
            </CardContent>
          </Card>

          {/* Control Section */}
          <div className="flex lg:flex-col items-center justify-center gap-4">
            <Button
              onClick={handleConvert}
              disabled={loading || !sourceCode.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-6 lg:px-4 lg:py-6"
            >
              {loading ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="hidden lg:block">Convert</span>
                  <FiArrowRight className="w-5 h-5 lg:hidden" />
                </>
              )}
            </Button>

            <Button
              onClick={handleSwap}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <FiRefreshCw className="w-5 h-5" />
            </Button>

            <Button
              onClick={handleClear}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <FiX className="w-5 h-5" />
            </Button>
          </div>

          {/* Output Section */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Converted Code</CardTitle>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang} className="bg-slate-800">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="w-full h-[400px] p-4 bg-black/30 border border-white/20 rounded-lg text-white font-mono text-sm overflow-auto">
                  {result ? result.convertedCode : '// Converted code will appear here...'}
                </pre>
                {result && (
                  <Button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white"
                    size="sm"
                  >
                    {copiedCode ? (
                      <>
                        <FiCheck className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <FiCopy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Explanation and Notes */}
        {result && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Explanation */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {result.explanation}
                </p>
              </CardContent>
            </Card>

            {/* Conversion Notes */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <CardTitle className="text-white text-lg">
                    Conversion Notes ({result.conversionNotes?.length || 0})
                  </CardTitle>
                  {showNotes ? (
                    <FiChevronUp className="w-5 h-5 text-white" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-white" />
                  )}
                </button>
              </CardHeader>
              {showNotes && (
                <CardContent>
                  {result.conversionNotes && result.conversionNotes.length > 0 ? (
                    <ul className="space-y-2">
                      {result.conversionNotes.map((note, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-gray-300 text-sm"
                        >
                          <span className="text-purple-400 mt-1">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">No conversion notes available.</p>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
