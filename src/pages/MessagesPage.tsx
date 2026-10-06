import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'

type MessageRow = { id: string; senderId: string; senderName: string; recipientId: string; body: string; createdAt?: { seconds?: number } }

export default function MessagesPage() {
  const { user, configured } = useAuth()
  const [params] = useSearchParams()
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!db || !user) return
    const q = query(collection(db, 'messages'), where('participantIds', 'array-contains', user.uid))
    return onSnapshot(q, (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MessageRow, 'id'>) })).sort((a,b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))), (e) => setError(e.message))
  }, [user])

  const contactId = useMemo(() => params.get('with') || messages.find((m) => m.senderId !== user?.uid)?.senderId || 'support', [messages, params, user])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    if (!db || !user) { setError('Sign in with Firebase configured before sending messages.'); return }
    const form = event.currentTarget; const body = String(new FormData(form).get('body') ?? '').trim(); if (!body) return
    await addDoc(collection(db, 'messages'), { senderId: user.uid, senderName: user.displayName || 'WorkShake user', recipientId: contactId, participantIds: [user.uid, contactId], body, createdAt: serverTimestamp() })
    form.reset()
  }

  return <div className="page-shell"><SEO title="Messages | WorkShake" description="Keep job conversations organized in one place." path="/messages"  noindex/><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.2em] text-olive">Inbox</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-5xl">Keep job conversations together.</h1></div>{!configured || !user ? <div className="mt-8"><EmptyState title="Sign in to use messages" copy="Firebase Authentication connects messages to the correct WorkShake account." action="Sign in" to="/sign-in" /></div> : <div className="mt-8 grid gap-5 lg:grid-cols-[18rem_1fr]"><aside className="rounded-[2rem] bg-sage/55 p-4"><p className="px-2 text-xs font-black uppercase tracking-[.18em] text-forest">Conversations</p><button className="mt-3 w-full rounded-2xl bg-mist p-4 text-left shadow-soft"><span className="block font-black text-ink">Current conversation</span><span className="mt-1 block text-xs text-forest/65">Job messages</span></button></aside><section className="flex min-h-[32rem] flex-col rounded-[2rem] border border-forest/10 bg-mist p-5 shadow-soft"><div className="flex-1 space-y-3 overflow-y-auto" aria-live="polite">{messages.length ? messages.map((m) => <div key={m.id} className={`max-w-[80%] rounded-2xl p-3 text-sm leading-6 ${m.senderId === user.uid ? 'ml-auto bg-forest text-mist' : 'bg-sage text-ink'}`}><strong className="block text-xs opacity-70">{m.senderId === user.uid ? 'You' : m.senderName}</strong>{m.body}</div>) : <p className="text-sm text-forest/65">No messages yet. When you start a conversation with a provider, it will appear here.</p>}</div><form className="mt-5 flex gap-2 border-t border-forest/10 pt-4" onSubmit={submit}><input name="body" aria-label="Message" className="form-input" placeholder="Write a message" /><button className="btn-primary shrink-0">Send</button></form>{error && <p className="mt-3 text-sm font-bold text-ink" role="alert">{error}</p>}</section></div>}</div>
}
