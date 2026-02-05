import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, MessageSquare, Trash2, Menu, X, Home } from 'lucide-react';

export default function ProtocolChat() {
    const [chats, setChats] = useState([
        {
            id: 1,
            title: 'Новый чат',
            messages: [
                {
                    role: 'assistant',
                    content: 'Привет! Я помогу тебе разобраться с протоколом Polyglossarium. Задавай любые вопросы.'
                }
            ],
            createdAt: new Date()
        }
    ]);
    const [activeChat, setActiveChat] = useState(1);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const messagesEndRef = useRef(null);

    const currentChat = chats.find(chat => chat.id === activeChat);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentChat?.messages]);

    const createNewChat = () => {
        const newChat = {
            id: Date.now(),
            title: 'Новый чат',
            messages: [
                {
                    role: 'assistant',
                    content: 'Привет! Я помогу тебе разобраться с протоколом Polyglossarium. Задавай любые вопросы.'
                }
            ],
            createdAt: new Date()
        };
        setChats(prev => [newChat, ...prev]);
        setActiveChat(newChat.id);
    };

    const deleteChat = (chatId) => {
        if (chats.length === 1) return; // Не удаляем последний чат
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (activeChat === chatId) {
            setActiveChat(chats[0].id === chatId ? chats[1].id : chats[0].id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        
        setChats(prev => prev.map(chat => 
            chat.id === activeChat 
                ? { 
                    ...chat, 
                    messages: [...chat.messages, userMessage],
                    title: chat.messages.length === 1 ? input.slice(0, 30) + (input.length > 30 ? '...' : '') : chat.title
                }
                : chat
        ));
        
        setInput('');
        setIsTyping(true);

        // Симуляция ответа бота
        setTimeout(() => {
            const botResponse = {
                role: 'assistant',
                content: 'Это демо-версия чат-бота. Здесь будет интеграция с реальным API для ответов на вопросы о протоколе.'
            };
            setChats(prev => prev.map(chat => 
                chat.id === activeChat 
                    ? { ...chat, messages: [...chat.messages, botResponse] }
                    : chat
            ));
            setIsTyping(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-white text-black flex">
            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r border-black/10 flex flex-col bg-gray-50 overflow-hidden`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-black/10">
                    <button
                        onClick={createNewChat}
                        className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors font-mono text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Новый чат
                    </button>
                </div>

                {/* Chats List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {chats.map(chat => (
                        <button
                            key={chat.id}
                            onClick={() => setActiveChat(chat.id)}
                            className={`w-full text-left p-3 rounded-lg mb-2 group hover:bg-white transition-colors ${
                                activeChat === chat.id ? 'bg-white shadow-sm' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{chat.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {chat.messages.length} сообщений
                                        </p>
                                    </div>
                                </div>
                                {chats.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteChat(chat.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-black/10">
                    <a
                        href="/"
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        На главную
                    </a>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="border-b border-black/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <h1 className="font-display text-xl font-bold">ПРОТОКОЛ</h1>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-3xl mx-auto">
                        <AnimatePresence>
                            {currentChat?.messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`mb-6 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                                >
                                    <div
                                        className={`inline-block max-w-[80%] p-4 rounded-2xl ${
                                            message.role === 'user'
                                                ? 'bg-black text-white'
                                                : 'bg-gray-100 text-black'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-6 text-left"
                            >
                                <div className="inline-block bg-gray-100 p-4 rounded-2xl">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input */}
                <div className="border-t border-black/10 p-4 md:p-6">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                        <div className="flex gap-2 items-center bg-gray-100 rounded-full p-2 pr-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Напиши сообщение..."
                                className="flex-1 bg-transparent px-4 py-2 outline-none font-mono text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="bg-black text-white p-2 rounded-full hover:scale-110 transition-transform disabled:opacity-30 disabled:hover:scale-100"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
