import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="w-full py-12 px-4 border-t border-white/5 bg-black text-center text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
            <div className="max-w-7xl mx-auto">
                <p>&copy; {new Date().getFullYear()} Scene Me — THE ACTOR'S STORE CONCEPT</p>
            </div>
        </footer>
    );
}
