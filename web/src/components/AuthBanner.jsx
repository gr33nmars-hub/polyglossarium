import { motion } from 'framer-motion';
import { useState } from 'react';
import { Lock, X } from 'lucide-react';

export default function AuthBanner() {
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Введите имя');
            return;
        }

        if (code.length !== 4 || !/^\d{4}$/.test(code)) {
            setError('Код должен содержать 4 цифры');
            return;
        }

        // Simple auth logic - store in localStorage
        localStorage.setItem('polyglossarium_user', JSON.stringify({ name, code }));
        setShowModal(false);
        setName('');
        setCode('');
        alert(`Добро пожаловать, ${name}!`);
    };

    return (
        <>
            <section className="mt-[100px] mb-20 px-4 md:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ 
                        scale: 1.04,
                        boxShadow: "0 0 30px rgba(0,0,0,0.15)"
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="border-2 border-black bg-white relative overflow-hidden cursor-pointer"
                >
                    {/* Fine square grid pattern */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}></div>

                    <div className="relative z-10 py-16 px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Left side - Text */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <Lock className="w-8 h-8" />
                                <h2 className="font-display text-4xl md:text-5xl uppercase tracking-tight">
                                    Доступ к системе
                                </h2>
                            </div>
                            <p className="font-mono text-sm md:text-base uppercase tracking-wide opacity-70 max-w-xl">
                                Получите персональный доступ к полной базе знаний и инструментам обучения
                            </p>
                        </div>

                        {/* Right side - CTA */}
                        <motion.button
                            onClick={() => setShowModal(true)}
                            className="bg-black text-white px-8 py-4 font-mono text-sm uppercase tracking-widest border-2 border-black transition-all duration-300 hover:bg-transparent hover:text-black"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Войти в систему
                        </motion.button>
                    </div>
                </motion.div>
            </section>

            {/* Auth Modal */}
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white border-2 border-black max-w-md w-full relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-black hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Modal content */}
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Lock className="w-6 h-6" />
                                <h3 className="font-display text-3xl uppercase tracking-tight">
                                    Авторизация
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name input */}
                                <div>
                                    <label className="block font-mono text-xs uppercase tracking-widest mb-2">
                                        Имя
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full border-2 border-black px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="Введите ваше имя"
                                    />
                                </div>

                                {/* Code input */}
                                <div>
                                    <label className="block font-mono text-xs uppercase tracking-widest mb-2">
                                        Код доступа (4 цифры)
                                    </label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            setCode(value);
                                        }}
                                        className="w-full border-2 border-black px-4 py-3 font-mono text-2xl tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="••••"
                                        maxLength="4"
                                    />
                                </div>

                                {/* Error message */}
                                {error && (
                                    <div className="bg-black text-white px-4 py-2 font-mono text-xs uppercase">
                                        {error}
                                    </div>
                                )}

                                {/* Submit button */}
                                <motion.button
                                    type="submit"
                                    className="w-full bg-black text-white py-4 font-mono text-sm uppercase tracking-widest border-2 border-black"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Войти
                                </motion.button>
                            </form>

                            <p className="mt-6 font-mono text-xs uppercase tracking-wide text-center opacity-60">
                                Система v1.0 // Защищенный доступ
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
}
