'use client';

import { DashboardTopBar } from '@/components/dashboard/top-bar';
import { DashboardSidebarLeft } from '@/components/dashboard/sidebar-left';
import { Profile } from '@/components/dashboard/profile';
import { motion } from 'framer-motion';

export default function ProfilePage() {
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
          <Profile />
        </main>
      </motion.div>
    </div>
  );
}
