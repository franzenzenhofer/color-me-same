import React from 'react';
import { displayVersion, displayDate, displayCommit } from '../version';

export function VersionInfo() {
  return (
    <div className="fixed bottom-2 left-2 text-xs text-gray-500 dark:text-gray-600 opacity-50 hover:opacity-100 transition-opacity">
      <div className="font-mono">
        {displayVersion} | {displayDate} | {displayCommit}
      </div>
    </div>
  );
}