'use client';

import { DashboardTopBar } from '@/components/dashboard/top-bar';
import { DashboardSidebarLeft } from '@/components/dashboard/sidebar-left';
import { Leaderboard } from '@/components/dashboard/leaderboard-table';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  return (
    <div className="bg-background min-h-screen">
      <DashboardTopBar />
      <DashboardSidebarLeft />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="pt-16 lg:pl-56"
      >
        <main className="mx-auto max-w-3xl px-4 py-8">
          <Leaderboard />
        </main>
      </motion.div>
    </div>
  );
}
