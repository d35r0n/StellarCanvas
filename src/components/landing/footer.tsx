import Link from 'next/link';
import { Palette } from 'lucide-react';

const currentYear = new Date().getFullYear();

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Canvas', href: '#' },
      { label: 'Leaderboard', href: '#' },
      { label: 'Achievements', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Stellar', href: 'https://stellar.org' },
      { label: 'Soroban', href: 'https://soroban.stellar.org' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Twitter', href: '#' },
      { label: 'Discord', href: '#' },
      { label: 'GitHub', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-4">
      <div className="mx-auto max-w-6xl py-12 md:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Palette className="text-primary h-5 w-5" />
              <span className="font-semibold">StellarCanvas</span>
            </div>
            <p className="text-muted-foreground text-sm">
              A permanent on-chain pixel canvas on Stellar Soroban.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="mb-3 text-sm font-semibold">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-muted-foreground mt-12 border-t border-white/5 pt-6 text-center text-xs">
          &copy; {currentYear} StellarCanvas. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
