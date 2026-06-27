import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { MiniPlayer } from '@/components/MiniPlayer';
import { usePlayer, type Song } from '@/contexts/PlayerContext';
import { api } from '@/utils/api';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  songs?: Song[];
  isLoading?: boolean;
}

const SUGGESTIONS = [
  '推荐几首适合下雨天听的歌',
  '我今天有点丧，来点治愈的',
  '帮我做一个露营歌单',
  '推荐和周杰伦风格类似的歌手',
];

function parseSongs(text: string): { cleanText: string; songs: { name: string; artist: string }[] } {
  const songs: { name: string; artist: string }[] = [];
  const regex = /\[SONG:(.+?)\s*-\s*(.+?)\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    songs.push({ name: match[1].trim(), artist: match[2].trim() });
  }
  const cleanText = text.replace(regex, '').replace(/\n{3,}/g, '\n\n').trim();
  return { cleanText, songs };
}

function MessageBubble({ message, onPlaySong }: { message: Message; onPlaySong: (song: Song) => void }) {
  const isUser = message.role === 'user';

  return (
    <View style={[chatStyles.bubbleRow, isUser && chatStyles.userRow]}>
      {!isUser && (
        <View style={chatStyles.aiAvatar}>
          <FontAwesome6 name="seedling" size={16} color="#7D8B6E" />
        </View>
      )}
      <View style={[chatStyles.bubble, isUser ? chatStyles.userBubble : chatStyles.aiBubble]}>
        {message.isLoading ? (
          <View style={chatStyles.typingRow}>
            <Text style={chatStyles.typingText}>正在为你挑选音乐...</Text>
          </View>
        ) : (
          <>
            <Text style={[chatStyles.bubbleText, isUser && chatStyles.userText]}>
              {message.content}
            </Text>
            {message.songs && message.songs.length > 0 && (
              <View style={chatStyles.songList}>
                {message.songs.map((song, idx) => (
                  <TouchableOpacity
                    key={`${song.id}-${idx}`}
                    style={chatStyles.songChip}
                    onPress={() => onPlaySong(song)}
                  >
                    <FontAwesome6 name="music" size={10} color="#7D8B6E" />
                    <Text style={chatStyles.songChipText} numberOfLines={1}>
                      {song.title} - {song.artist}
                    </Text>
                    <FontAwesome6 name="play" size={8} color="#7D8B6E" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const { playSong } = usePlayer();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const resolveSongs = useCallback(async (songHints: { name: string; artist: string }[]): Promise<Song[]> => {
    const resolved: Song[] = [];
    for (const hint of songHints.slice(0, 8)) {
      try {
        const res = await api.search(`${hint.name} ${hint.artist}`, 'songs', 1);
        const songs = res.data?.songs || [];
        if (songs.length > 0) {
          resolved.push(songs[0]);
        }
      } catch {
        // skip
      }
    }
    return resolved;
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);
    scrollToBottom();

    const chatHistory = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch(`${BASE_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await response.json();
      const fullContent = data.content || data.message || '抱歉，暂时无法回复~';

      // Parse songs from response and resolve them
      const { cleanText, songs: songHints } = parseSongs(fullContent);
      let resolvedSongs: Song[] = [];
      if (songHints.length > 0) {
        resolvedSongs = await resolveSongs(songHints);
      }

      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: cleanText || fullContent, songs: resolvedSongs, isLoading: false }
          : m
      ));
    } catch (error: any) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: '抱歉，我暂时无法回答。请稍后再试~', isLoading: false }
          : m
      ));
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isStreaming, resolveSongs, scrollToBottom]);

  const handlePlaySong = useCallback((song: Song) => {
    playSong(song);
  }, [playSong]);

  return (
    <Screen safeAreaEdges={['left', 'right']} backgroundColor="#FAF7F2">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[chatStyles.header, { paddingTop: insets.top + 8 }]}>
          <View style={chatStyles.headerLeft}>
            <View style={chatStyles.headerAvatar}>
              <FontAwesome6 name="seedling" size={18} color="#7D8B6E" />
            </View>
            <View>
              <Text style={chatStyles.headerTitle}>花语小助手</Text>
              <Text style={chatStyles.headerSub}>你的AI音乐伙伴</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        {messages.length === 0 ? (
          <View style={chatStyles.emptyContainer}>
            <View style={chatStyles.emptyIcon}>
              <FontAwesome6 name="seedling" size={32} color="#7D8B6E" />
            </View>
            <Text style={chatStyles.emptyTitle}>嗨，我是花语小助手</Text>
            <Text style={chatStyles.emptySub}>告诉我你的心情或场景，我来为你推荐音乐</Text>
            <View style={chatStyles.suggestions}>
              {SUGGESTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={chatStyles.suggestionChip}
                  onPress={() => sendMessage(s)}
                >
                  <Text style={chatStyles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={chatStyles.messageList}
            contentContainerStyle={chatStyles.messageContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} onPlaySong={handlePlaySong} />
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View style={[chatStyles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={chatStyles.input}
            value={input}
            onChangeText={setInput}
            placeholder="说说你的心情，我来推荐音乐..."
            placeholderTextColor="#8B7D6B"
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[chatStyles.sendBtn, (!input.trim() || isStreaming) && chatStyles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
          >
            <FontAwesome6
              name="paper-plane"
              size={16}
              color={(!input.trim() || isStreaming) ? '#C4B8A8' : '#7D8B6E'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <MiniPlayer />
    </Screen>
  );
}

const chatStyles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(125,139,110,0.1)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(125,139,110,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#3A3530' },
  headerSub: { fontSize: 11, color: '#8B7D6B' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(125,139,110,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#3A3530', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#8B7D6B', textAlign: 'center', marginBottom: 24 },
  suggestions: { gap: 8, width: '100%' },
  suggestionChip: {
    backgroundColor: 'rgba(125,139,110,0.08)',
    borderRadius: 16, paddingVertical: 10, paddingHorizontal: 16,
  },
  suggestionText: { fontSize: 13, color: '#5A5349' },
  messageList: { flex: 1 },
  messageContent: { padding: 16, gap: 16 },
  bubbleRow: { flexDirection: 'row', gap: 8, maxWidth: '85%' },
  userRow: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(125,139,110,0.12)',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },
  bubble: {
    borderRadius: 18, padding: 12, maxWidth: '100%',
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
    shadowColor: '#7D8B6E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#7D8B6E',
    borderTopRightRadius: 4,
  },
  bubbleText: { fontSize: 14, color: '#3A3530', lineHeight: 20 },
  userText: { color: '#fff' },
  typingRow: { flexDirection: 'row', gap: 4, padding: 4 },
  typingText: { fontSize: 13, color: '#8B7D6B', fontStyle: 'italic' },
  songList: { marginTop: 8, gap: 6 },
  songChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(125,139,110,0.08)',
    borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10,
  },
  songChipText: { flex: 1, fontSize: 12, color: '#3A3530' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 16, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(125,139,110,0.1)',
    backgroundColor: '#FAF7F2',
  },
  input: {
    flex: 1, minHeight: 36, maxHeight: 100,
    backgroundColor: 'rgba(125,139,110,0.08)',
    borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 14, color: '#3A3530',
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(125,139,110,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});
