import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        }
    }
};

const item = {
    hidden: { y: 100, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { ease: "circOut", duration: 0.8 } }
};

const images = [
    '/gendirphoto.png',
    '/54e29630-0d98-4aba-8235-3792494a866e.png',
    '/t4423we.png'
];

export default function Hero() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 4000); // Change image every 4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <section id="hero" className="min-h-[85vh] w-full flex flex-col justify-center relative overflow-hidden mb-20 border-b-2 border-black">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-6 pointer-events-none opacity-10 z-[1]">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="border-r border-black h-full" />
                ))}
            </div>
            <div className="absolute inset-0 grid grid-rows-6 pointer-events-none opacity-10 z-[1]">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="border-b border-black w-full" />
                ))}
            </div>

            {/* Animated Image Carousel - positioned at the bottom right */}
            <div className="absolute bottom-4 right-[5%] z-20 pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImageIndex}
                        src={images[currentImageIndex]}
                        alt={`Hero image ${currentImageIndex + 1}`}
                        initial={{
                            opacity: 0,
                            x: 100
                        }}
                        animate={{
                            opacity: 0.95,
                            x: 0
                        }}
                        exit={{
                            opacity: 0,
                            x: -100
                        }}
                        transition={{
                            duration: 0.8,
                            ease: [0.43, 0.13, 0.23, 0.96]
                        }}
                        className={`h-auto object-contain ${currentImageIndex === 0
                                ? 'w-[500px] md:w-[600px] lg:w-[700px]'
                                : currentImageIndex === 1
                                    ? 'w-[400px] md:w-[500px] lg:w-[600px]'
                                    : 'w-[400px] md:w-[500px] lg:w-[600px]'
                            }`}
                    />
                </AnimatePresence>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="z-10 px-4 md:px-12 flex flex-col gap-8"
            >
                <div className="overflow-hidden relative">
                    <motion.div variants={item} className="flex flex-col relative">
                        <div className="flex items-center gap-3 md:gap-4">
                            <h1 className="text-6xl md:text-9xl font-display leading-[0.85] uppercase">
                                the
                            </h1>
                            {/* Logo with drift animation */}
                            <img
                                src="/logogloss.png"
                                alt="Polyglossarium"
                                className="w-16 md:w-24 h-auto logo-drift"
                            />
                        </div>
                        <h1 className="text-6xl md:text-9xl font-display leading-[0.85] uppercase">
                            Polyglossarium
                        </h1>
                    </motion.div>
                </div>

                <motion.div variants={item} className="max-w-2xl border-l-2 border-black pl-6 py-2 mt-8">
                    <p className="font-mono text-xs md:text-sm uppercase tracking-widest mb-2">System v1.0 // Ready</p>
                    <p className="font-mono text-sm md:text-base leading-relaxed uppercase">
                        ВСЕЛЕННАЯ НЕ ОБЯЗАНА БЫТЬ ПОНЯТНОЙ. НО МЫ ОБЯЗАНЫ ЕЁ ПОНЯТЬ.
                        ЭТО НЕ ВЫБОР — ЭТО ИМПЕРАТИВ КОГНИТИВНОЙ СИСТЕМЫ, ОСОЗНАВШЕЙ СЕБЯ.
                    </p>
                </motion.div>
            </motion.div >

            {/* Marquee Tape */}
            <div className="absolute bottom-12 left-0 w-full border-y-2 border-black bg-white py-2 overflow-hidden flex whitespace-nowrap">
                <div className="animate-marquee font-display text-4xl uppercase tracking-wider flex-shrink-0 pr-8">
                    PHYSICS /// PHILOSOPHY /// CODE /// META-SKILLS /// BIOLOGY /// ECONOMICS /// HISTORY /// ART /// PHYSICS /// PHILOSOPHY /// CODE /// META-SKILLS /// BIOLOGY /// ECONOMICS /// HISTORY /// ART ///
                </div>
                <div className="animate-marquee font-display text-4xl uppercase tracking-wider flex-shrink-0 pr-8">
                    PHYSICS /// PHILOSOPHY /// CODE /// META-SKILLS /// BIOLOGY /// ECONOMICS /// HISTORY /// ART /// PHYSICS /// PHILOSOPHY /// CODE /// META-SKILLS /// BIOLOGY /// ECONOMICS /// HISTORY /// ART ///
                </div>
            </div>
        </section >
    );
}
