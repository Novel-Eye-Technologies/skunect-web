'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  MessageSquare,
  Plus,
  Send,
  Loader2,
  Paperclip,
  Search,
  X,
  FileIcon,
  ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/api/files';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { NewConversationDialog } from '@/components/features/messaging/new-conversation-dialog';
import {
  useConversations,
  useSendMessage,
  useMessages,
  messagingKeys,
} from '@/lib/hooks/use-messaging';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  connectStomp,
  disconnectStomp,
  subscribeToMessages,
} from '@/lib/websocket/stomp-client';

import { formatRelativeTime } from '@/lib/utils/format-relative-time';
import { cn } from '@/lib/utils';
import type { Conversation, Message } from '@/lib/types/messaging';
import { queryClient } from '@/lib/query-client';

export default function MessagesPage() {
  const userId = useAuthStore((s) => s.user?.id);
  const accessToken = useAuthStore((s) => s.accessToken);
const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<
    { url: string; name: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: conversationsResponse, isLoading: conversationsLoading } =
    useConversations({ size: 50 });
  const conversations = conversationsResponse?.data ?? [];

  // Sort conversations by updatedAt descending
  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const { data: messagesResponse, isLoading: messagesLoading } = useMessages(
    activeConversationId ?? '',
    { size: 100 },
  );
  const messages = messagesResponse?.data ?? [];

  const sendMessageMutation = useSendMessage();

  // ---------------------------------------------------------------------------
  // Active conversation
  // ---------------------------------------------------------------------------
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  function getOtherParticipant(conversation: Conversation) {
    return (
      conversation.participants.find((p) => p.userId !== userId) ??
      conversation.participants[0]
    );
  }

  // Filter conversations by search query (participant name)
  const filteredConversations = sortedConversations.filter((c) => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(c);
    const fullName = `${other.firstName ?? other.name ?? ''} ${other.lastName ?? ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // ---------------------------------------------------------------------------
  // Auto-scroll to bottom on new messages
  // ---------------------------------------------------------------------------
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ---------------------------------------------------------------------------
  // WebSocket connection
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!accessToken) return;

    connectStomp(accessToken);
    const unsubscribe = subscribeToMessages((incomingMessage: Message | null) => {
      // Invalidate queries to refresh conversation list + messages
      queryClient.invalidateQueries({ queryKey: messagingKeys.all });

      // If the incoming message is for the active conversation, scroll to bottom
      if (incomingMessage && incomingMessage.conversationId === activeConversationId) {
        setTimeout(() => scrollToBottom(), 100);
      }
    });

    return () => {
      unsubscribe();
      disconnectStomp();
    };
  }, [accessToken, activeConversationId, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  // ---------------------------------------------------------------------------
  // Send message
  // ---------------------------------------------------------------------------
  function handleSendMessage() {
    const content = messageInput.trim();
    if (!content || !activeConversationId) return;

    const attachmentUrls = pendingAttachments.map((a) => a.url);

    sendMessageMutation.mutate(
      {
        conversationId: activeConversationId,
        data: {
          content,
          ...(attachmentUrls.length > 0 ? { attachmentUrls } : {}),
        },
      },
      {
        onSuccess: () => {
          setMessageInput('');
          setPendingAttachments([]);
          setTimeout(() => scrollToBottom(), 100);
          textareaRef.current?.focus();
        },
      },
    );
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again
    e.target.value = '';

    setIsUploading(true);
    try {
      const url = await uploadFile(file, 'messages');
      setPendingAttachments((prev) => [...prev, { url, name: file.name }]);
    } catch {
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  function removeAttachment(index: number) {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  function handleConversationCreated(conversationId: string) {
    setActiveConversationId(conversationId);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Send and receive messages with staff and parents."
      />

      <div className="flex h-[calc(100vh-220px)] overflow-hidden rounded-lg border bg-background">
        {/* ---------------------------------------------------------------- */}
        {/* Conversation List (Left Panel)                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex w-[350px] shrink-0 flex-col border-r">
          {/* Header & Search */}
          <div className="border-b px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Conversations</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setNewDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">New conversation</span>
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-8 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1">
            {conversationsLoading ? (
              <div className="space-y-1 p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery ? 'No conversations match your search.' : 'No conversations yet.'}
                </p>
                {!searchQuery && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-1"
                    onClick={() => setNewDialogOpen(true)}
                  >
                    Start a conversation
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-1">
                {filteredConversations.map((conversation) => {
                  const other = getOtherParticipant(conversation);
                  const isActive = conversation.id === activeConversationId;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() =>
                        setActiveConversationId(conversation.id)
                      }
                      className={cn(
                        'flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition-colors hover:bg-accent',
                        isActive && 'bg-accent',
                      )}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={other.avatar ?? ''} />
                        <AvatarFallback className="text-xs">
                          {(other.firstName ?? other.name)?.[0]}
                          {(other.lastName ?? '')?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">
                            {other.firstName ?? other.name} {other.lastName ?? ''}
                          </p>
                          {conversation.lastMessage && (
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {formatRelativeTime(
                                conversation.lastMessage.sentAt,
                              )}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-muted-foreground">
                            {conversation.lastMessage?.content ??
                              'No messages yet'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge
                              variant="default"
                              className="h-5 min-w-5 shrink-0 justify-center rounded-full px-1.5 text-[10px]"
                            >
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Message Thread (Right Panel)                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex flex-1 flex-col">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b px-4 py-3">
                {(() => {
                  const other = getOtherParticipant(activeConversation);
                  return (
                    <>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={other.avatar ?? ''} />
                        <AvatarFallback className="text-xs">
                          {(other.firstName ?? other.name)?.[0]}
                          {(other.lastName ?? '')?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">
                          {other.firstName ?? other.name} {other.lastName ?? ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {other.role}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Messages area */}
              <ScrollArea className="flex-1 px-4 py-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No messages yet. Send the first message!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isSent = msg.senderId === userId;
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex',
                            isSent ? 'justify-end' : 'justify-start',
                          )}
                        >
                          <div className="flex max-w-[70%] items-end gap-2">
                            {!isSent && (
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarImage src={msg.senderAvatar ?? ''} />
                                <AvatarFallback className="text-[10px]">
                                  {msg.senderName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={cn(
                                'rounded-2xl px-3.5 py-2',
                                isSent
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted',
                              )}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                              {/* Attachments */}
                              {msg.attachmentUrls && msg.attachmentUrls.length > 0 && (
                                <div className="mt-2 space-y-1.5">
                                  {msg.attachmentUrls.map((url, idx) => {
                                    const fileName = url.split('/').pop() ?? 'attachment';
                                    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(url);
                                    return isImage ? (
                                      <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                      >
                                        <Image
                                          src={url}
                                          alt={fileName}
                                          width={200}
                                          height={160}
                                          className="max-w-[200px] max-h-[160px] rounded-lg object-cover"
                                        />
                                      </a>
                                    ) : (
                                      <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                          'flex items-center gap-1.5 text-xs underline',
                                          isSent
                                            ? 'text-primary-foreground/90'
                                            : 'text-foreground/80',
                                        )}
                                      >
                                        <FileIcon className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate max-w-[180px]">
                                          {decodeURIComponent(fileName)}
                                        </span>
                                      </a>
                                    );
                                  })}
                                </div>
                              )}
                              <p
                                className={cn(
                                  'mt-1 text-[10px]',
                                  isSent
                                    ? 'text-primary-foreground/70'
                                    : 'text-muted-foreground',
                                )}
                              >
                                {formatRelativeTime(msg.sentAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message input */}
              <Separator />
              <div className="p-4 space-y-2">
                {/* Pending attachments */}
                {pendingAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pendingAttachments.map((attachment, idx) => {
                      const isImage = /\.(png|jpe?g|gif|webp)$/i.test(attachment.url);
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1.5 text-xs"
                        >
                          {isImage ? (
                            <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          ) : (
                            <FileIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          )}
                          <span className="max-w-[120px] truncate">
                            {attachment.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="ml-0.5 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-end gap-2">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {/* Attachment button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title="Attach a file"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                    <span className="sr-only">Attach file</span>
                  </Button>
                  <Textarea
                    ref={textareaRef}
                    placeholder="Type a message..."
                    className="min-h-[40px] max-h-[120px] resize-none"
                    rows={1}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={handleSendMessage}
                    disabled={
                      !messageInput.trim() || sendMessageMutation.isPending
                    }
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="Select a conversation"
                description="Choose a conversation from the list or start a new one to begin messaging."
                action={
                  <Button onClick={() => setNewDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Conversation
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Dialog */}
      <NewConversationDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}
