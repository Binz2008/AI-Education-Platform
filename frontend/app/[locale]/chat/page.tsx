'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/state/auth-store'
import { apiClient } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Message {
  id: string
  role: 'child' | 'agent'
  content: string
  timestamp: string
}

interface Agent {
  id: string
  name: string
  subject: string
  avatar: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const { currentChild } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadAgents()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadAgents = async () => {
    try {
      const agentsData = await apiClient.getAgents() as Agent[]
      setAgents(agentsData)
      if (agentsData.length > 0) {
        setSelectedAgent(agentsData[0])
      }
    } catch (error) {
      console.error('Failed to load agents:', error)
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || !selectedAgent || !currentChild) return
    
    setIsLoading(true)

    try {
      const childMessage: Message = {
        id: Date.now().toString(),
        role: 'child',
        content: currentMessage,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, childMessage])
      setCurrentMessage('')

      const response = await apiClient.chatWithAgent(selectedAgent.id, {
        content: currentMessage,
        childName: currentChild.firstName
      }) as { response: string }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: response.response,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, agentMessage])

    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!currentChild) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">يرجى اختيار طفل أولاً</h2>
          <a href="/dashboard" className="text-primary-600 hover:underline">
            العودة للوحة التحكم
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">محادثة مع {selectedAgent?.name}</h1>
            <p className="text-gray-600 text-sm">الطفل: {currentChild.firstName}</p>
          </div>
          
          {/* Agent Selector */}
          <select
            value={selectedAgent?.id || ''}
            onChange={(e) => {
              const agent = agents.find(a => a.id === e.target.value)
              if (agent) setSelectedAgent(agent)
            }}
            className="px-3 py-2 border rounded-lg"
            title="اختيار المعلم"
            aria-label="اختيار المعلم"
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg h-96 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-lg mb-2">مرحباً {currentChild.firstName}! 👋</p>
                <p>ابدأ محادثتك مع {selectedAgent?.name}</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'child' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg message-slide-in ${
                    message.role === 'child'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'child' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">💭</div>
                    <span className="text-sm">{selectedAgent?.name} يكتب...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !currentMessage.trim()}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
