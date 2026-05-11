import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '@/api/chatApi';
import { buildImageUrl } from '@/lib/utils';
import { motion } from 'motion/react';
import { MessageSquare, Clock, User, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ChatInboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    try {
      const response = await chatApi.getInbox();
      setConversations(response.data || []);
    } catch (error) {
      console.error('Error fetching inbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (requestId) => {
    navigate(`/chat/${requestId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/20 p-3 rounded-2xl">
            <MessageSquare className="text-primary w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Your Conversations</h1>
        </div>

        <div className="space-y-4">
          {conversations.length === 0 ? (
            <div className="bento-card p-12 text-center flex flex-col items-center">
              <div className="bg-dark-card/50 p-6 rounded-full mb-4">
                <MessageSquare className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No conversations yet</h3>
              <p className="text-gray-400">Start a conversation to see it here.</p>
            </div>
          ) : (
            conversations.map((chat, index) => (
              <motion.div
                key={chat.requestId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleConversationClick(chat.requestId)}
                className="bento-card p-4 hover:bg-dark-card/80 cursor-pointer transition-all border border-transparent hover:border-primary/30 group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-dark-card border border-gray-700">
                      {chat.otherPartyImageUrl ? (
                        <img 
                          src={buildImageUrl(chat.otherPartyImageUrl)} 
                          alt={chat.otherPartyName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="text-gray-500 w-6 h-6" />
                        </div>
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-dark-bg">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-semibold text-white truncate">
                        {chat.otherPartyName}
                      </h4>
                      {chat.lastMessageTime && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-gray-200 font-medium' : 'text-gray-500'}`}>
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                  </div>

                  <div className="text-gray-600 group-hover:text-primary transition-colors">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
                
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInboxPage;
