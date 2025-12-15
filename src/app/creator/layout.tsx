import { Toaster } from "@/components/ui/toaster";

export default function CreatorLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
            <Toaster />
        </>
    );
}
