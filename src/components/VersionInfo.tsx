import { useGame } from '../context/GameContext';
import { displayVersion, displayDate, displayCommit } from '../version';

export function VersionInfo() {
  const { state } = useGame();
  
  // Only show on start screen
  if (state.started) return null;
  
  return (
    <div className="text-center mt-8">
      <div className="text-white/40 hover:text-white/60 text-xs transition-colors mb-2">
        Code Directed by <a href="https://www.franzai.com" target="_blank" rel="noopener noreferrer" className="underline">Franz Enzenhofer</a> with contributions by Mistral AI, ChatGPT o3 pro and Claude Code.
      </div>
      <div className="text-white/40 text-sm font-mono">
        <div className="bg-black/20 rounded-lg px-4 py-2 inline-block">
          {displayVersion} | {displayDate} | {displayCommit}
        </div>
      </div>
    </div>
  );
}