'use client';

import { DashboardTopBar } from '@/components/dashboard/top-bar';
import { DashboardSidebarLeft } from '@/components/dashboard/sidebar-left';
import { DashboardSidebarRight } from '@/components/dashboard/sidebar-right';
import { ConnectedCanvas } from '@/components/dashboard/connected-canvas';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  return (
    <div className="bg-background min-h-screen">
      <DashboardTopBar />
      <DashboardSidebarLeft />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="pt-16 lg:pr-80 lg:pl-56"
      >
        <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-2 py-4 sm:p-4">
          <ConnectedCanvas />
        </main>
      </motion.div>

      <div className="lg:bg-background/95 lg:fixed lg:top-16 lg:right-0 lg:h-[calc(100vh-4rem)] lg:w-80 lg:overflow-y-auto lg:border-l lg:border-white/5 lg:backdrop-blur-xl">
        <DashboardSidebarRight />
      </div>
    </div>
  );
}
