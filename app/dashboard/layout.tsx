import Sidebar from "@/components/dashboard/sidebar";
import BottomTabNav from "@/components/dashboard/BottomTabNav";
import MobileHeader from "@/components/dashboard/MobileHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50/80 dark:bg-[#080b12]">
            {/* Mobile header */}
            <MobileHeader />

            {/* Desktop: centered sidebar + content */}
            <div className="hidden lg:flex justify-center min-h-screen">
                <div className="flex w-full max-w-[1200px]">
                    {/* Sidebar */}
                    <div className="w-[260px] flex-shrink-0 sticky top-0 h-screen">
                        <Sidebar variant="desktop" />
                    </div>
                    {/* Main content */}
                    <main className="flex-1 min-w-0 px-6 py-6">
                        {children}
                    </main>
                </div>
            </div>

            {/* Mobile: just content */}
            <main className="lg:hidden">
                <div className="px-4 pt-3 pb-28">
                    {children}
                </div>
            </main>

            {/* Mobile bottom tab */}
            <BottomTabNav />
        </div>
    );
}