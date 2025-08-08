'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Bell, Check } from 'lucide-react'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [unread, setUnread] = useState<Message[]>([])
  const myId = user?.id

  async function loadUnread() {
    if (!myId) return
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', myId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
    if (!error) setUnread(data || [])
  }

  useEffect(() => {
    loadUnread()
    if (!myId) return
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${myId}` }, () => {
        loadUnread()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [myId])

  const markAllRead = async () => {
    if (!myId || unread.length === 0) return
    const ids = unread.map(m => m.id)
    await supabase.from('messages').update({ is_read: true }).in('id', ids)
    setUnread([])
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <Button variant="outline" onClick={markAllRead} disabled={unread.length === 0}>
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Unread Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unread.length === 0 ? (
              <p className="text-sm text-muted-foreground">You’re all caught up.</p>
            ) : (
              unread.map(n => (
                <div key={n.id} className="p-3 border rounded-lg">
                  <div className="text-sm">{n.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
