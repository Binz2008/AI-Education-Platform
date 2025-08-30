'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/state/auth-store'
import { apiClient } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Star, 
  Trophy,
  Clock,
  BookOpen,
  ArrowLeft,
  Play,
  Pause
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'child' | 'agent'
  content: string
  contentType: 'text' | 'audio'
  timestamp: string
  audioUrl?: string
}

interface SessionData {
  id: string
  childId: string
  lessonId: string
  subject: string
  agentId: string
  status: 'active' | 'paused' | 'completed'
  startTime: string
  score: number
  timeSpent: number
  currentActivity?: string
  hintsUsed: number
}

interface Child {
  id: string
  firstName: string
  ageGroup: string
  preferredLanguage: string
  voiceEnabled: boolean
  chatEnabled: boolean
}

export default function SessionInterface() {
  const [session, setSession] = useState<SessionData | null>(null)
  const [child, setChild] = useState<Child | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sessionProgress, setSessionProgress] = useState(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuthStore()

  const sessionId = searchParams.get('sessionId')
  const childId = searchParams.get('childId')

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId)
      loadMessages(sessionId)
    } else if (childId) {
      startNewSession()
    }
  }, [sessionId, childId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      if (session && session.status === 'active') {
        updateSessionProgress()
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [session])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadSession = async (sessionId: string) => {
    try {
      const sessionData = await apiClient.getSession(sessionId)
      setSession(sessionData)
      
      const childData = await apiClient.getChild(sessionData.childId)
      setChild(childData)
    } catch (error) {
      console.error('Failed to load session:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await apiClient.getSessionMessages(sessionId)
      setMessages(response.messages || [])
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const startNewSession = async () => {
    try {
      const response = await apiClient.startSession({
        childId: childId!,
        lessonId: 'default-lesson-id', // This should come from lesson selection
        agentId: 'fasih', // Default Arabic teacher agent
        subject: 'arabic'
      })
      
      setSession(response)
      const childData = await apiClient.getChild(childId!)
      setChild(childData)
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'agent',
        content: `مرحباً ${childData.firstName}! أنا الأستاذ فصيح، معلم اللغة العربية. سأساعدك اليوم في تعلم أشياء جديدة ومثيرة. هل أنت مستعد للبدء؟`,
        contentType: 'text',
        timestamp: new Date().toISOString()
      }
      
      setMessages([welcomeMessage])
    } catch (error) {
      console.error('Failed to start session:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSessionProgress = () => {
    if (session) {
      const elapsed = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000 / 60)
      const progress = Math.min((elapsed / 30) * 100, 100) // 30 minutes session
      setSessionProgress(progress)
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || !session || sending) return

    setSending(true)
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'child',
      content: currentMessage,
      contentType: 'text',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')

    try {
      const response = await apiClient.sendMessage(session.id, {
        content: currentMessage,
        contentType: 'text'
      })

      const agentMessage: ChatMessage = {
        id: response.agentResponse.id,
        role: 'agent',
        content: response.agentResponse.content,
        contentType: 'text',
        timestamp: response.agentResponse.timestamp
      }

      setMessages(prev => [...prev, agentMessage])
      
      // Update session score
      setSession(prev => prev ? {...prev, score: prev.score + 5} : null)
      
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await sendAudioMessage(audioBlob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const sendAudioMessage = async (audioBlob: Blob) => {
    if (!session) return

    setSending(true)
    try {
      // In a real implementation, you would upload the audio file
      // and get a transcription from the backend
      const mockTranscription = "رسالة صوتية من الطفل"
      
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'child',
        content: mockTranscription,
        contentType: 'audio',
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, userMessage])

      const response = await apiClient.sendMessage(session.id, {
        content: mockTranscription,
        contentType: 'audio'
      })

      const agentMessage: ChatMessage = {
        id: response.agentResponse.id,
        role: 'agent',
        content: response.agentResponse.content,
        contentType: 'text',
        timestamp: response.agentResponse.timestamp
      }

      setMessages(prev => [...prev, agentMessage])
    } catch (error) {
      console.error('Failed to send audio message:', error)
    } finally {
      setSending(false)
    }
  }

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = child?.preferredLanguage === 'ar' ? 'ar-SA' : 'en-US'
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
    }
  }

  const endSession = async () => {
    if (!session) return

    try {
      await apiClient.endSession(session.id)
      router.push(`/dashboard?child=${session.childId}`)
    } catch (error) {
      console.error('Failed to end session:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الجلسة...</p>
        </div>
      </div>
    )
  }

  if (!session || !child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">جلسة غير موجودة</h2>
          <Button onClick={() => router.push('/dashboard')}>العودة للوحة القيادة</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {child.firstName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="font-semibold">{child.firstName}</h1>
                  <p className="text-sm text-gray-600">جلسة تعلم - {session.subject}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{session.timeSpent} دقيقة</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">{session.score} نقطة</span>
              </div>
              
              <Button variant="outline" onClick={endSession}>
                إنهاء الجلسة
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">تقدم الجلسة</span>
              <span className="text-sm font-medium">{Math.round(sessionProgress)}%</span>
            </div>
            <Progress value={sessionProgress} className="w-full" />
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'child' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'child'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <p className="text-sm">{message.content}</p>
                      
                      {message.role === 'agent' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => speakMessage(message.content)}
                        >
                          {isSpeaking ? (
                            <VolumeX className="h-3 w-3" />
                          ) : (
                            <Volume2 className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {message.contentType === 'audio' && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        رسالة صوتية
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse flex space-x-1">
                        <div className="rounded-full bg-gray-400 h-2 w-2"></div>
                        <div className="rounded-full bg-gray-400 h-2 w-2"></div>
                        <div className="rounded-full bg-gray-400 h-2 w-2"></div>
                      </div>
                      <span className="text-xs text-gray-500">الأستاذ فصيح يكتب...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              {child.voiceEnabled && (
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={sending}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              
              {child.chatEnabled && (
                <>
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={sending}
                    className="flex-1"
                  />
                  
                  <Button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || sending}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {isRecording && (
              <div className="mt-2 text-center">
                <Badge variant="destructive" className="animate-pulse">
                  🎤 جاري التسجيل... اترك الزر للإرسال
                </Badge>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
