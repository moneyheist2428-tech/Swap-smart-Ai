'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { Label } from '@/components/ui/label'
import { Send, MessageSquare } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  listing_id?: string | null
  content: string
  is_read: boolean
  created_at: string
}

export default function MessagesPage() {
  const { user } = useAuth()
  const params = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [receiverId, setReceiverId] = useState(params.get('to') || '')
  const [content, setContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const myId = user?.id

  const conversation = useMemo(() => {
    if (!myId || !receiverId) return []
    return messages
      .filter(m => (m.sender_id === myId && m.receiver_id === receiverId) || (m.sender_id === receiverId && m.receiver_id === myId))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }, [messages, myId, receiverId])

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => {
    if (!myId) {
      setLoading(false)
      return
    }
    let active = true
    async function loadHistory() {
      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order('created_at', { ascending: true })
      if (!active) return
      if (!error) setMessages(data || [])
      setLoading(false)
    }
    loadHistory()

    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${myId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
        scrollToBottom()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      active = false
    }
  }, [myId])

  // Mark as read when viewing
  useEffect(() => {
    if (!myId || !receiverId) return
    const unread = conversation.filter(m => m.receiver_id === myId && !m.is_read).map(m => m.id)
    if (unread.length === 0) return
    supabase.from('messages').update({ is_read: true }).in('id', unread).then(() => {
      setMessages(prev => prev.map(m => unread.includes(m.id) ? { ...m, is_read: true } : m))
    })
  }, [conversation.length, myId, receiverId])

  const send = async () => {
    if (!receiverId || !content.trim()) return
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: receiverId, content })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send')
      setMessages(prev => [...prev, json.message])
      setContent('')
      setTimeout(scrollToBottom, 50)
    } catch (e) {
      console.error(e)
      alert('Failed to send message.')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Start a chat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiver">Receiver User ID</Label>
                <Input id="receiver" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} placeholder="Paste receiver's user id" />
                <p className="text-xs text-muted-foreground">Tip: pass ?to=USER_ID in the URL to prefill.</p>
              </div>
              <Button onClick={() => receiverId && setReceiverId(receiverId)} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Open Conversation
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              ) : receiverId ? (
                conversation.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No messages yet. Say hi!</p>
                ) : (
                  conversation.map(m => (
                    <div key={m.id} className={`flex ${m.sender_id === myId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.sender_id === myId ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {m.content}
                        <div className="text-[10px] opacity-70 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <p className="text-sm text-muted-foreground">Select or enter a receiver to start.</p>
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="border-t p-3 flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[44px] max-h-40"
              />
              <Button onClick={send} disabled={!receiverId || !content.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
