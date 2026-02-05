import { motion } from 'framer-motion';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t-2 border-black bg-white mt-20">
            <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
                {/* Main Footer Content */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                    {/* Logo and Name */}
                    <motion.div 
                        className="flex items-center gap-4"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                    >
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 200 200"
                            className="text-black"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="100" cy="100" r="95" />
                            <path d="M 60 140 L 60 60 L 90 60 Q 110 60 110 75 Q 110 90 90 90 L 60 90" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M 130 65 Q 145 65 145 85 L 145 115 Q 145 135 130 135 Q 115 135 115 120 L 130 120" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex flex-col">
                            <span className="font-display text-2xl md:text-3xl uppercase tracking-tight">
                                Polyglossarium
                            </span>
                            <span className="font-mono text-xs uppercase tracking-widest opacity-60">
                                Knowledge System v1.0
                            </span>
                        </div>
                    </motion.div>

                    {/* Navigation Links */}
                    <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-8 font-mono text-xs uppercase tracking-wide">
                        <a
                            href="/#hero"
                            className="transition-all duration-300 hover:scale-110 hover:opacity-60"
                        >
                            Главная
                        </a>
                        <a
                            href="/map"
                            className="transition-all duration-300 hover:scale-110 hover:opacity-60"
                        >
                            Карта
                        </a>
                        <a
                            href="/#method"
                            className="transition-all duration-300 hover:scale-110 hover:opacity-60"
                        >
                            Метод
                        </a>
                        <a
                            href="/about"
                            className="transition-all duration-300 hover:scale-110 hover:opacity-60"
                        >
                            О нас
                        </a>
                        <a
                            href="/protocol"
                            className="transition-all duration-300 hover:scale-110 hover:opacity-60"
                        >
                            Протокол
                        </a>
                    </nav>
                </div>

                {/* Divider */}
                <div className="border-t border-black/10 mb-6"></div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs uppercase tracking-wide opacity-60">
                    <p>© {currentYear} Polyglossarium. All rights reserved.</p>
                    <p className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-black rounded-full animate-pulse"></span>
                        System Online
                    </p>
                </div>
            </div>
        </footer>
    );
}
