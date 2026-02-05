import { useState } from 'react';
import { motion } from 'framer-motion';
import { protocolSteps } from '../data/protocol';
import { Terminal, ChevronRight } from 'lucide-react';

export default function Methodology() {
    const [activeStep, setActiveStep] = useState(protocolSteps[0]);

    return (
        <section id="method" className="py-20 min-h-screen flex flex-col">
            <div className="mb-12 border-b-2 border-black pb-8">
                <h2 className="text-5xl md:text-8xl font-display uppercase">The Protocol</h2>
                <p className="font-mono text-xs max-w-xl mt-4">
                    АЛГОРИТМ ГЛУБОКОГО ОБУЧЕНИЯ v2.0. <br />
                    НЕ ЗАПОМИНАЙ. ПОНИМАЙ.
                </p>

                {/* Манифест */}
                <blockquote className="max-w-2xl border-l-2 border-black pl-6 py-2 mt-8">
                    <p className="font-display text-lg md:text-xl uppercase tracking-wide leading-relaxed">
                        ВСЕЛЕННАЯ НЕ ОБЯЗАНА БЫТЬ ПОНЯТНОЙ. НО МЫ ОБЯЗАНЫ ЕЁ ПОНЯТЬ.
                        ЭТО НЕ ВЫБОР — ЭТО ИМПЕРАТИВ КОГНИТИВНОЙ СИСТЕМЫ, ОСОЗНАВШЕЙ СЕБЯ.
                    </p>
                </blockquote>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
                {/* Helper/Navigation Column */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {protocolSteps.map((step) => (
                        <motion.div
                            key={step.id}
                            className={`p-6 border-2 border-black cursor-pointer transition-all ${activeStep.id === step.id
                                ? 'bg-black text-white shadow-brutal translate-x-2'
                                : 'bg-white hover:bg-gray-100'
                                }`}
                            onClick={() => setActiveStep(step)}
                            whileHover={{ x: 5 }}
                        >
                            <div className="flex justify-between mb-2">
                                <span className="font-mono text-xs">STEP 0{step.id}</span>
                                {activeStep.id === step.id && <Terminal className="w-4 h-4" />}
                            </div>
                            <h3 className="font-display text-2xl uppercase">{step.title}</h3>
                            <p className="font-mono text-xs mt-2 opacity-70">{step.subtitle}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Terminal/Output Column */}
                <div className="lg:col-span-8 h-full min-h-[500px]">
                    <div className="h-full border-2 border-black bg-[#1a1a1a] text-green-500 font-mono p-4 md:p-8 flex flex-col shadow-brutal-lg relative overflow-hidden">
                        {/* Terminal Header */}
                        <div className="flex justify-between items-center border-b border-green-500/30 pb-4 mb-4 opacity-70 text-xs">
                            <span>ТЕРМИНАЛ // ЯДРО_ПОЛИМАТА</span>
                            <span>СТАТУС: ПОДКЛЮЧЕНО</span>
                        </div>

                        {/* Terminal Content */}
                        <div className="flex-1 overflow-y-auto space-y-6">
                            <motion.div
                                key={activeStep.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {/* Target Description */}
                                <div className="mb-6">
                                    <span className="text-white bg-green-900/50 px-2 py-1 text-xs uppercase tracking-wider">
                                        Цель: {activeStep.description}
                                    </span>
                                </div>

                                {/* Prompt Section */}
                                <div className="flex gap-4">
                                    <ChevronRight className="shrink-0 mt-1" />
                                    <div className="space-y-2">
                                        <p className="text-white font-bold opacity-80">ВНЕДРЕНИЕ ПРОМПТА:</p>
                                        <p className="typing-effect text-green-400 text-lg md:text-xl leading-relaxed">
                                            "{activeStep.prompt}"
                                        </p>
                                    </div>
                                </div>

                                {/* Sciences Section */}
                                {activeStep.sciences && activeStep.sciences.length > 0 && (
                                    <div className="border-t border-green-500/20 pt-4">
                                        <p className="text-white/60 text-xs uppercase tracking-wider mb-3">
                                            &gt; СВЯЗАННЫЕ ДИСЦИПЛИНЫ:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {activeStep.sciences.map((science, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs uppercase"
                                                >
                                                    {science}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Examples Section */}
                                {activeStep.examples && activeStep.examples.length > 0 && (
                                    <div className="border-t border-green-500/20 pt-4">
                                        <p className="text-white/60 text-xs uppercase tracking-wider mb-3">
                                            &gt; ПРИМЕРЫ ПРОМПТОВ:
                                        </p>
                                        <div className="space-y-2">
                                            {activeStep.examples.map((example, idx) => (
                                                <div key={idx} className="flex gap-2 items-start">
                                                    <span className="text-green-600 text-xs mt-0.5">$</span>
                                                    <p className="text-green-300/80 text-sm leading-relaxed">
                                                        {example}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Scanline Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

                    </div>
                </div>
            </div>
        </section>
    );
}
