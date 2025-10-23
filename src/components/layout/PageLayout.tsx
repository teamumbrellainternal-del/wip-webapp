/**
 * Page Layout Component
 * Max-width wrapper for page content
 */

import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return <div className="max-w-6xl mx-auto space-y-8 p-6">{children}</div>;
}
