import Footer from './Footer';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
            <main className="px-4 md:px-8 max-w-[1600px] mx-auto">
                {children}
            </main>

            <Footer />

            {/* Status Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-black text-white py-2 px-4 font-mono text-[10px] uppercase flex justify-between items-center z-40 border-t border-white/20">
                <div>Система: Онлайн</div>
                <div className="animate-pulse">v1.0.0</div>
                <div>Память: 290 Модулей</div>
            </div>
        </div>
    );
}
