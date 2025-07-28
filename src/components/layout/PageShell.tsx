import React, { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({ children }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="w-full flex-1 flex flex-col min-h-0">
        <div className="flex-1 p-2 sm:p-4 min-h-0">
          <div className="w-full max-w-6xl mx-auto h-full flex flex-col gap-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageShell;