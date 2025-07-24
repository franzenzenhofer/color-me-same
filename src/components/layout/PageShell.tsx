import React, { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen h-screen flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default PageShell;