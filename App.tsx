
import React, { useState, useRef } from 'react';
import { AnalysisItem, AnalysisItemType } from './types';
import { analyzeLogFile } from './services/geminiService';

const defaultLogContent = `=====================================================================
== C:\\SERVICES\\ni8975478_1_SHARE\\ftproot\\dayzstandalone\\DayZServer_x64.exe
== "C:\\SERVICES\\ni8975478_1_SHARE\\ftproot\\dayzstandalone\\DayZServer_x64.exe" -ip=95.156.238.211 -port=11100 -cpuCount=4 -limitFPS=100 -config=serverDZ.cfg "-mod=@CF;@Dabs Framework;@DayZ-Expansion-Licensed;@DayZ-Expansion-Bundle;@ZomBerry Admin Tools;@VPPAdminTools;@Trader;@MuchCarKey;@PC_Bitcoin;@Tarkov-Expansion-AI;@Volkswagen Passat TSI [FREE];@CannabisPlus;@SNAFU Weapons;@Towing Service;@Unlimited Stamina;@WasteLandZ Survival Clothing;@Trader Sell All;@No Vehicle Damage Complete;@RaG_BaseItems;@QuickMoveItemsByCategory;@Ninjins-PvP-PvE;@Epic_Zombies_Inventory;@HealthStick" -profiles=C:\\SERVICES\\ni8975478_1_SHARE\\ftproot\\dayzstandalone/config -BEPath=C:\\SERVICES\\ni8975478_1_SHARE\\ftproot\\dayzstandalone\\battleye -noFilePatching -nologs -adminlog -freezecheck
=====================================================================
Exe timestamp: 2025/08/07 05:00:14
Current time:  2025/11/06 07:14:58
Version 1.28.160123
=====================================================================

 7:16:35.05 !!! [ERROR][XML] :: load [$CurrentDir:mpmissions\\dayzOffline.chernarusplus\\cfgeconomycore.xml] failed
 7:16:35.05 !!! [ERROR][XML] :: Error: empty tag. line 48
 7:16:35.05 !!! [CE][CoreData] :: ZERO root classes - SPAWN WILL NOT WORK
 7:16:40.460 !!! [CE][DE] (AmbientFox) :: Unable to create child (Animal_VulpesVulpes) as the type does not exist.
 7:16:40.497 !!! [CE][offlineDB] :: Type 'ACOGOptic' will be ignored. (Type does not exist. (Typo?))
 7:16:40.522 !!! [CE][DE][GROUPS] (Train_Abandoned_Cherno) :: [WARNING] :: Skipping pos(x: 0.000000, z: 0.000000) with invalid type 'StaticObj_Wreck_Train_742_Red_DE'.
 7:16:40.539 !!! [CE][DE][SPAWNS] :: [WARNING] :: Unable to assign invalid or non-existing group 'Train_Abandoned_Cherno' to pos (x: 5587.465820, z: 2063.353027) defined for event 'StaticTrain'.
 7:16:40.577 !!! [CE][Storage] Failed to read [Storage] data file "C:\\SERVICES\\ni8975478_1_SHARE\\ftproot\\dayzstandalone\\mpmissions\\dayzOffline.chernarusplus\\storage_1\\data\\dynamic_003.001".
 7:16:40.670 !!!!!! [CE][DE] DynamicEvent "AmbientFox" setup is invalid, event will be disabled.
`;


// --- UI Components ---

const Header: React.FC = () => (
  <header className="mb-6">
    <h1 className="text-4xl font-bold text-white tracking-tight">DayZ Log Analyzer AI</h1>
    <p className="text-slate-400 mt-2">Powered by Gemini. Paste your log, or upload a file to get an expert analysis of your server issues.</p>
  </header>
);

interface LogInputProps {
  logContent: string;
  setLogContent: (content: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const LogInput: React.FC<LogInputProps> = ({ logContent, setLogContent, onAnalyze, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setLogContent(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <textarea
        value={logContent}
        onChange={(e) => setLogContent(e.target.value)}
        placeholder="Paste your DayZ server log file content here..."
        className="flex-grow w-full p-4 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 font-mono text-sm resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow"
      />
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={onAnalyze}
          disabled={isLoading || !logContent}
          className="flex-grow bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Log File'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".log, .txt, .rpt"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-700 disabled:bg-slate-500 transition-colors shadow-lg"
        >
          Upload File
        </button>
      </div>
    </div>
  );
};

const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-white">Analyzing Log File...</h3>
        <p className="text-slate-400">Gemini is scanning for issues. This may take a moment.</p>
    </div>
);

const Icons: { [key in AnalysisItemType]: React.ReactNode } = {
  ERROR: (
    <div className="bg-red-500/20 text-red-400 rounded-full p-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    </div>
  ),
  WARNING: (
    <div className="bg-yellow-500/20 text-yellow-400 rounded-full p-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    </div>
  ),
  INFO: (
    <div className="bg-blue-500/20 text-blue-400 rounded-full p-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    </div>
  ),
};

const cardStyles: { [key in AnalysisItemType]: { border: string; title: string } } = {
  ERROR: { border: 'border-red-500/50', title: 'text-red-400' },
  WARNING: { border: 'border-yellow-500/50', title: 'text-yellow-400' },
  INFO: { border: 'border-blue-500/50', title: 'text-blue-400' },
};


const ErrorCard: React.FC<{ item: AnalysisItem }> = ({ item }) => (
  <div className={`bg-slate-800/50 border ${cardStyles[item.type].border} rounded-lg shadow-md overflow-hidden`}>
    <div className="p-4 md:p-5">
      <div className="flex items-center gap-4 mb-4">
        {Icons[item.type]}
        <h2 className={`text-xl font-bold ${cardStyles[item.type].title}`}>{item.title}</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-slate-300">Description</h3>
          <p className="text-slate-400 text-sm mt-1">{item.description}</p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-300">Relevant Log Lines</h3>
          <pre className="mt-1 bg-black/50 p-3 rounded-md text-xs text-slate-300 font-mono overflow-x-auto"><code>
            {item.logLines.join('\n')}
          </code></pre>
        </div>

        <div>
          <h3 className="font-semibold text-slate-300">Solution</h3>
          <p className="text-slate-400 text-sm mt-1 whitespace-pre-wrap">{item.solution}</p>
        </div>
      </div>
    </div>
  </div>
);

interface AnalysisResultProps {
  results: AnalysisItem[] | null;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <h3 className="mt-4 text-lg font-semibold text-white">Awaiting Analysis</h3>
        <p className="text-slate-400">Your analysis results will appear here.</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <h3 className="mt-4 text-lg font-semibold text-white">No Issues Found</h3>
        <p className="text-slate-400">Gemini analyzed your log file and found no critical errors or warnings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">Analysis Results</h2>
        {results.sort((a, b) => {
            const order = { ERROR: 0, WARNING: 1, INFO: 2 };
            return order[a.type] - order[b.type];
        }).map((item, index) => (
            <ErrorCard key={index} item={item} />
        ))}
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [logContent, setLogContent] = useState<string>(defaultLogContent);
  const [analysisResult, setAnalysisResult] = useState<AnalysisItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeClick = async () => {
    if (!logContent) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeLogFile(logContent);
      setAnalysisResult(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <main className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Left Column */}
        <div className="flex flex-col lg:h-[calc(100vh-4rem)]">
          <Header />
          <div className="flex-grow">
            <LogInput 
              logContent={logContent}
              setLogContent={setLogContent}
              onAnalyze={handleAnalyzeClick}
              isLoading={isLoading}
            />
          </div>
        </div>
        
        {/* Right Column */}
        <div className="bg-slate-800/40 rounded-lg p-6 lg:h-[calc(100vh-4rem)] overflow-y-auto">
          {isLoading ? (
            <Loader />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-red-500/20 text-red-400 rounded-full p-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-red-400">Analysis Failed</h3>
              <p className="text-slate-400 max-w-md">{error}</p>
            </div>
          ) : (
            <AnalysisResult results={analysisResult} />
          )}
        </div>
      </main>
    </div>
  );
}
