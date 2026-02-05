import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Header() {
    const { scrollY } = useScroll();
    const scale = useTransform(scrollY, [0, 100], [1, 0.95]);
    const y = useTransform(scrollY, [0, 100], [0, 10]);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-6 pointer-events-none">
            <motion.nav
                style={{ scale, y }}
                className="pointer-events-auto bg-black text-white px-8 py-4 rounded-full flex items-center gap-12 shadow-brutal border border-white/10 max-w-[90vw] md:max-w-fit transition-all"
            >
                <motion.a
                    href="/#hero"
                    className="flex items-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 200 200"
                        className="text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="100" cy="100" r="95" />
                        <path d="M 60 140 L 60 60 L 90 60 Q 110 60 110 75 Q 110 90 90 90 L 60 90" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M 130 65 Q 145 65 145 85 L 145 115 Q 145 135 130 135 Q 115 135 115 120 L 130 120" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.a>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8 font-mono text-sm tracking-wide">
                    <a
                        href="/#hero"
                        className="uppercase transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    >
                        ГЛАВНАЯ
                    </a>
                    <a
                        href="/map"
                        className="uppercase transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    >
                        КАРТА
                    </a>
                    <a
                        href="/#method"
                        className="uppercase transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    >
                        МЕТОД
                    </a>
                    <a
                        href="/about"
                        className="uppercase transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    >
                        О НАС
                    </a>
                    <a
                        href="/protocol"
                        className="uppercase transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    >
                        ПРОТОКОЛ
                    </a>
                </div>



                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="pointer-events-auto absolute top-24 left-0 w-full bg-black text-white p-8 flex flex-col items-center gap-8 border-b-2 border-white md:hidden">
                    <a
                        href="/#hero"
                        className="font-display text-4xl uppercase"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        ГЛАВНАЯ
                    </a>
                    <a
                        href="/map"
                        className="font-display text-4xl uppercase"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        КАРТА
                    </a>
                    <a
                        href="/#method"
                        className="font-display text-4xl uppercase"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        МЕТОД
                    </a>
                    <a
                        href="/about"
                        className="font-display text-4xl uppercase"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        О НАС
                    </a>
                    <a
                        href="/protocol"
                        className="font-display text-4xl uppercase"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        ПРОТОКОЛ
                    </a>
                </div>
            )}
        </div>
    );
}
