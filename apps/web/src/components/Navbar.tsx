'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton } from './WalletButton';
import { Badge } from './ui/badge';
import { isDemo } from '@/lib/demoFlags';
import { gaslessService } from '@/lib/gasless';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const demo = isDemo();
  const gaslessAvailable = gaslessService.isGaslessAvailable();
  const providerName = gaslessService.getProviderName();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/markets', label: 'Markets' },
    { href: '/events', label: 'Events' },
    { href: '/copytrading', label: 'Copy Trading' },
    { href: '/governance', label: 'Governance' },
  ];

  return (
    <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold gradient-text">
              SeerHive
            </Link>
            <div className="hidden md:flex gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-green-500/20 text-green-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {demo && <Badge variant="warning">DEMO MODE</Badge>}
            {gaslessAvailable && !demo && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Gas: Sponsored ({providerName})
              </span>
            )}
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
}