import { useState, memo, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { curriculum } from '../data/curriculum';
import { X, ArrowRight, CornerDownRight, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

// Memoized Card Component for Categories
const GridCard = memo(({ cat, index, onClick }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.02, duration: 0.4 }}
        viewport={{ once: true }}
        className="group bg-white p-6 md:p-8 border shadow-none cursor-pointer relative overflow-hidden w-[300px] h-[350px] flex flex-col justify-between transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-black hover:text-white border-black/10 md:border-black/5 hover:border-white/20 hover:z-10 bg-clip-border"
        onClick={() => onClick(cat)}
    >
        <div className="flex justify-between items-start z-10 relative">
            <span className="font-mono text-xs opacity-50 bg-black/5 group-hover:bg-white/10 px-2 py-1 rounded">
                MOD {cat.id < 10 ? `0${cat.id}` : cat.id}
            </span>
            <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </div>

        <div className="z-10 relative">
            <h3
                className="text-3xl md:text-4xl font-display uppercase mb-3 leading-none group-hover:translate-x-1 transition-transform duration-300"
            >
                {cat.category}
            </h3>
            <p className="font-mono text-xs opacity-60 leading-tight border-l-2 border-current pl-3 group-hover:opacity-80">
                {cat.topics.length} TOPICS INSIDE
            </p>
        </div>

        {/* Hover Glitch/Decoration */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-current opacity-5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
    </motion.div>
));

export default function GridSystem() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const containerRef = useRef(null);
    const isDragging = useRef(false);
    const [constraints, setConstraints] = useState({ left: 0, right: 0 });

    useEffect(() => {
        const updateConstraints = () => {
            if (!containerRef.current) return;
            const viewportWidth = containerRef.current.offsetWidth;
            const totalItems = curriculum.length;
            const columns = Math.ceil(totalItems / 2); // 2 rows
            // 300px card width
            const contentWidth = columns * 300;

            // Allow scrolling if content is wider than viewport
            const minLeft = Math.min(0, viewportWidth - contentWidth);

            setConstraints({ left: minLeft, right: 0 });
        };

        updateConstraints();
        window.addEventListener('resize', updateConstraints);
        return () => window.removeEventListener('resize', updateConstraints);
    }, []);

    const handleCardClick = (cat) => {
        if (!isDragging.current) {
            setSelectedCategory(cat);
            setSelectedTopic(null); // Reset detail view
        }
    };

    const handleTopicClick = (topic) => {
        setSelectedTopic(topic);
    };

    const handleBackToTopics = () => {
        setSelectedTopic(null);
    };

    return (
        <section id="map" className="pt-32 px-4 md:px-8 max-w-[100vw] mx-auto min-h-screen overflow-hidden">
            <div className="relative flex items-end mb-8 px-4 max-w-[1600px] mx-auto w-full">
                <h2 className="text-5xl md:text-8xl font-display uppercase leading-[0.8] text-center w-full">
                    POLYGLOSSARIUM
                </h2>
                <div className="absolute right-4 bottom-0 text-right font-mono text-xs md:text-sm hidden md:block">
                    МОДУЛЕЙ: {curriculum.length}<br />
                    СТАТУС: АКТИВЕН
                </div>
            </div>

            {/* Draggable Viewport Container */}
            <div
                ref={containerRef}
                className="relative h-[700px] w-full border-y md:border-2 border-black bg-[#E5E5E5] group/viewport overflow-hidden"
            >
                {/* Left Blur Edge */}
                <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 z-20 pointer-events-none backdrop-blur-xl mask-linear-fade-left"
                    style={{ maskImage: 'linear-gradient(to right, black, transparent)' }} />

                {/* Draggable Track */}
                <motion.div
                    drag="x"
                    dragConstraints={constraints}
                    dragElastic={0.1}
                    onDragStart={() => { isDragging.current = true; }}
                    onDragEnd={() => {
                        setTimeout(() => { isDragging.current = false; }, 50);
                    }}
                    className="grid grid-rows-2 grid-flow-col gap-0 cursor-grab active:cursor-grabbing w-fit"
                >
                    {curriculum.map((cat, index) => (
                        <GridCard
                            key={cat.id}
                            cat={cat}
                            index={index}
                            onClick={handleCardClick}
                        />
                    ))}
                </motion.div>

                {/* Right Blur Edge */}
                <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 z-20 pointer-events-none backdrop-blur-xl"
                    style={{ maskImage: 'linear-gradient(to left, black, transparent)' }} />
            </div>

            {/* Main Drawer */}
            <AnimatePresence>
                {selectedCategory && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCategory(null)}
                            className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
                        />

                        {/* Drawer Container */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-white border-l-2 border-black z-[70] shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Drawer Header */}
                            <div className="p-8 pb-4 border-b border-black/10 flex justify-between items-start bg-white z-20 relative">
                                <div>
                                    <span className="font-mono text-xs uppercase bg-black text-white px-2 py-1 rounded mb-2 inline-block">
                                        MOD {selectedCategory.id < 10 ? `0${selectedCategory.id}` : selectedCategory.id}
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-display uppercase leading-none">
                                        {selectedCategory.category}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="p-2 hover:bg-black hover:text-white border border-black transition-colors rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Drawer Content Area - Relative for sliding views */}
                            <div className="flex-1 relative overflow-hidden bg-gray-50">

                                <AnimatePresence initial={false} mode="popLayout">
                                    {/* View 1: List of Topics */}
                                    {!selectedTopic ? (
                                        <motion.div
                                            key="list"
                                            initial={{ x: -100, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -100, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="absolute inset-0 overflow-y-auto p-8"
                                        >
                                            <div className="flex flex-col gap-3">
                                                {selectedCategory.topics.map((topic, i) => (
                                                    <motion.button
                                                        key={topic.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        onClick={() => handleTopicClick(topic)}
                                                        className="group w-full text-left bg-white border border-black/10 p-6 rounded-xl hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center justify-between"
                                                    >
                                                        <div>
                                                            <div className="font-mono text-[10px] opacity-40 mb-1">#{topic.id}</div>
                                                            <h4 className="font-display text-lg uppercase leading-tight group-hover:underline decoration-2 underline-offset-4">
                                                                {topic.title.replace(/\*\*/g, '')}
                                                            </h4>
                                                        </div>
                                                        <ChevronRight className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-black" />
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        // View 2: Topic Details
                                        <motion.div
                                            key="detail"
                                            initial={{ x: 100, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 100, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="absolute inset-0 overflow-y-auto bg-white flex flex-col h-full"
                                        >
                                            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-black/5 p-4 z-10 flex items-center gap-2">
                                                <button
                                                    onClick={handleBackToTopics}
                                                    className="flex items-center gap-2 text-sm font-mono hover:bg-black hover:text-white px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-black"
                                                >
                                                    <ArrowLeft size={14} />
                                                    BACK TO LIST
                                                </button>
                                            </div>

                                            <div className="p-8 md:p-10 flex-1">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <span className="font-mono text-sm uppercase bg-black text-white px-3 py-1 rounded-full">
                                                        #{selectedTopic.id}
                                                    </span>
                                                </div>

                                                <h2 className="text-3xl md:text-5xl font-display uppercase mb-8 leading-[1.1]">
                                                    {selectedTopic.title.replace(/\*\*/g, '')}
                                                </h2>

                                                <div className="text-base md:text-lg mb-8 font-sans leading-relaxed opacity-90 max-w-prose">
                                                    <p>{selectedTopic.description.replace(/\[.*?\]\(.*?\)/g, '').trim()}</p>
                                                </div>

                                                {selectedTopic.description.match(/\[(.*?)\]\((.*?)\)/) && (
                                                    <div className="mt-8 p-6 bg-gray-50 border border-black/10 rounded-xl">
                                                        <h4 className="font-mono text-xs uppercase opacity-50 mb-3 flex items-center gap-2">
                                                            <BookOpen size={14} /> Источники
                                                        </h4>
                                                        <div className="flex flex-col gap-2">
                                                            {(() => {
                                                                const links = [];
                                                                const regex = /\[(.*?)\]\((.*?)\)/g;
                                                                let match;
                                                                while ((match = regex.exec(selectedTopic.description)) !== null) {
                                                                    links.push({ text: match[1], url: match[2] });
                                                                }
                                                                return links.map((link, i) => (
                                                                    <a
                                                                        key={i}
                                                                        href={link.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-black/60 hover:text-black hover:underline font-mono text-sm break-all transition-colors"
                                                                    >
                                                                        {link.text || 'Ссылка'}
                                                                    </a>
                                                                ));
                                                            })()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-6 border-t border-black/10 bg-gray-50">
                                                <div className="p-4 bg-black text-white font-mono text-xs rounded-lg text-center">
                                                    ID ДЛЯ ПРОТОКОЛА: {selectedTopic.id}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </section >
    );
}
