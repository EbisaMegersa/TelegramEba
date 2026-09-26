import { useState, useEffect } from 'react';
import LoadAssets from '@/components/LoadAssets';
import { AnimatePresence } from 'framer-motion';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { TGMiniAppGameClientSDK } from '@open-yes/game-client-sdk';

declare global {
  interface Window {
    TGMiniAppGameSDKInstance: TGMiniAppGameClientSDK;
  }
}

window.TGMiniAppGameSDKInstance = new TGMiniAppGameClientSDK({
  projectId: 'yescoin',
  ui: {
    manifestUrl: 'https://www.yescoin.gold/tonconnect-manifest.json',
    actionsConfiguration: {
      twaReturnUrl: 'https://t.me/theYescoin_bot/Yescoin',
    },
  },
});

const BASE_URL = 'https://pub-3f24abf8d919470d84a07be174835a7e.r2.dev/telegram-unity-bridge';

const App = () => {
  const { unityProvider, loadingProgression, isLoaded } = useUnityContext({
    loaderUrl: `${BASE_URL}/Build/dist.loader.js`,
    dataUrl: `${BASE_URL}/Build/dist.data`,
    frameworkUrl: `${BASE_URL}/Build/dist.framework.js`,
    codeUrl: `${BASE_URL}/Build/dist.wasm`,
    companyName: 'Yescoin - Unity Game Template',
    productName: 'Yescoin',
    productVersion: '0.1',
  });

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const originalError = console.error;
    const originalLog = console.log;
    const originalWarn = console.warn;

    const addLog = (type: string, msg: string) => {
      setLogs((prev) => [...prev.slice(-49), `[${type}] ${msg}`]);
    };

    console.error = (...args) => {
      addLog('ERROR', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      addLog('WARN', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      originalWarn.apply(console, args);
    };

    console.log = (...args) => {
      addLog('LOG', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      originalLog.apply(console, args);
    };

    const handleError = (event: ErrorEvent) => {
      addLog('UNCAUGHT', `${event.message} at ${event.filename}:${event.lineno}`);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      addLog('REJECTION', String(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const progress = Math.round(loadingProgression * 100);
  return (
    <main className="w-screen h-screen of-hidden">
      <AnimatePresence>{!isLoaded && <LoadAssets progress={progress} logs={logs} />}</AnimatePresence>
      <Unity unityProvider={unityProvider} className="w-screen h-screen" />
    </main>
  );
};

export default App;
