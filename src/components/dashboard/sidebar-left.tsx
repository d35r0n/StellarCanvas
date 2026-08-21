'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Palette, Trophy, User, Menu, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { icon: Palette, label: 'Canvas', href: '/dashboard' },
  { icon: Trophy, label: 'Leaderboard', href: '/dashboard/leaderboard' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
];

export function DashboardSidebarLeft() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
        className="fixed top-20 left-4 z-40 transition-transform hover:scale-105 active:scale-95 lg:hidden"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
            onKeyDown={handleKeyDown}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'bg-background/95 fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-56 border-r border-white/5 backdrop-blur-xl transition-transform duration-300',
          '-translate-x-full lg:translate-x-0',
          open && 'translate-x-0',
        )}
      >
        <nav
          className="flex flex-col gap-1 p-3 pt-6"
          role="navigation"
          aria-label="Dashboard"
        >
          {navItems.map((item) => {
            const isActive =
              item.href !== '#' && pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'group focus-visible:ring-ring focus-visible:ring-offset-background relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
                )}
              >
                <item.icon
                  className={cn(
                    'h-4 w-4 transition-transform group-hover:scale-110',
                    isActive && 'text-primary',
                  )}
                />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="bg-primary absolute top-1/2 right-2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
