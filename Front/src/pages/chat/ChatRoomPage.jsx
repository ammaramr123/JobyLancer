import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatApi } from '@/api/chatApi';
import { useAuthStore } from '@/store/authStore';
import { buildImageUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft, MoreVertical, User, Clock } from 'lucide-react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { format } from 'date-fns';

const ChatRoomPage = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const userId = user?.profileImageUrl?.split('/')[4];
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [otherParty, setOtherParty] = useState(null);
    const [connection, setConnection] = useState(null);

    const messagesEndRef = useRef(null);
    const connectionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const initPage = async () => {
            setLoading(true);
            try {
                // 1. markAsRead مش هيوقف الصفحة لو فشل
                await chatApi.markAsRead(requestId).catch(() => { });
                // 2. getChatHistory بترجع data مختلفة - لازم تتحقق
                const response = await chatApi.getChatHistory(requestId);
                const historyData = response?.data?.data?.data || [];
                console.log('current user:', user)

                setMessages(Array.isArray(historyData) ? historyData : []);
                console.log('userId:', userId);
                console.log('user.fullName:', user?.fullName);
                console.log('historyData senders:', historyData.map(m => ({ senderId: m.senderId, senderName: m.senderName })));
                const otherName = historyData.find(m => m.senderName !== user?.fullName)?.senderName || 'User';
                setOtherParty({ name: otherName }); 
                // Setup SignalR
                const socketUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5186'}/chatHub`;
                const newConnection = new HubConnectionBuilder()
                    .withUrl(socketUrl, {
                        accessTokenFactory: () => localStorage.getItem('token')
                    })
                    .configureLogging(LogLevel.Information)
                    .withAutomaticReconnect()
                    .build();

                newConnection.on('ReceiveMessage', async (data) => {
                    if (data.requestId === requestId) {
                        setMessages(prev => {

                            // تأكد إن الـ message مش موجودة خالص
                            const exists = prev.some(m => m.id === data.id);
                            if (exists) return prev;
                            return [...prev, data];
                        });
                        await chatApi.markAsRead(requestId).catch(() => { });
                    }
                });

                await newConnection.start();
                // 3. لازم تعمل JoinChat بعد الـ start
                await newConnection.invoke('JoinChat', requestId);
                setConnection(newConnection);
                connectionRef.current = newConnection;

            } catch (error) {
                console.error('Error initializing chat room:', error);
            } finally {
                setLoading(false);
            }
        };

        initPage();

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
            }
        };
    }, [requestId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !connection) return;

        try {
            await connection.invoke('SendMessage', requestId, newMessage.trim());
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-dark-bg">
            {/* Header */}
            <div className="bg-dark-card border-b border-gray-800 p-4 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            
                            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                                {otherParty?.imageUrl ? (
                                    <img
                                        src={buildImageUrl(otherParty.imageUrl)}
                                        alt={otherParty.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="text-gray-500 w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-white font-semibold leading-tight">{otherParty?.name || 'User'}</h3>
                                <span className="text-xs text-green-500">Online</span>
                            </div>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="max-w-5xl mx-auto flex flex-col min-h-full justify-end">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => {
                            const isMe = msg.senderId === userId;
                            return (
                                <motion.div
                                    key={msg.id || idx}
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full mb-4`}
                                >
                                    <div className={`max-w-[80%] md:max-w-[70%] ${isMe ? 'order-1' : 'order-2'}`}>
                                        <div className={`p-3 rounded-2xl ${isMe
                                            ? 'bg-primary text-white rounded-br-none'
                                            : 'bg-dark-card text-gray-200 rounded-bl-none border border-gray-800'
                                            }`}>
                                            <p className="text-sm md:text-base break-words whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        <div className={`flex items-center gap-1 mt-1 text-[10px] text-gray-500 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(msg.sentAt || Date.now()), 'hh:mm a')}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="bg-dark-card border-t border-gray-800 p-4">
                <div className="max-w-5xl mx-auto">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <div className="flex-1 bg-dark-bg rounded-2xl border border-gray-700 focus-within:border-primary transition-colors flex items-center px-4 py-1">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-transparent text-white border-none focus:ring-0 resize-none py-2 max-h-32 min-h-[40px] text-sm"
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className={`p-3 rounded-2xl transition-all ${newMessage.trim()
                                ? 'bg-primary text-white hover:scale-105 active:scale-95'
                                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                }`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatRoomPage;
