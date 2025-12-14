import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  duration?: number; // Duration in milliseconds (used as safety timeout)
  isReady?: boolean; // Allows parent to end loading based on real readiness
}

export const LoadingScreen = ({ onLoadingComplete, duration = 4000, isReady = false }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isReady) {
      setProgress(100);
      const finish = setTimeout(onLoadingComplete, 200);
      return () => clearTimeout(finish);
    }
  }, [isReady, onLoadingComplete]);

  useEffect(() => {
    if (isReady) return;

    const steps = 50;
    const intervalTime = duration / steps;
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 100 / steps, 95));
    }, intervalTime);

    // Safety timeout so loading never hangs forever
    const safetyTimer = setTimeout(() => {
      setProgress(100);
      onLoadingComplete();
    }, duration + 2000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(safetyTimer);
    };
  }, [duration, isReady, onLoadingComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Animated Heart Container */}
        <div className="relative">
          {/* Pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-teal-400 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center animation-delay-1000">
            <div className="w-40 h-40 border-4 border-blue-400 rounded-full animate-ping opacity-15"></div>
          </div>

          {/* Heart Icon */}
          <div className="relative bg-white rounded-full p-8 shadow-2xl">
            <Heart
              className="w-20 h-20 text-red-500 animate-heartbeat"
              fill="currentColor"
            />
            {/* ECG line overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg
                className="w-24 h-24 animate-ecg"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 0,50 L 20,50 L 25,30 L 30,70 L 35,50 L 100,50"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  className="ecg-line"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Logo/Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            GNN-HF
          </h1>
          <p className="text-sm text-gray-500 animate-pulse">
            Preparing your health assistant...
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Loading text */}
        <p className="text-xs text-gray-400 font-medium">
          {progress < 33 && "Initializing AI models..."}
          {progress >= 33 && progress < 66 && "Loading ECG analyzer..."}
          {progress >= 66 && progress < 100 && "Almost ready..."}
          {progress === 100 && "Ready!"}
        </p>

        {/* Tagline */}
        <p className="text-sm text-teal-600 font-medium mt-4">
          Advanced Heart Failure Detection with AI
        </p>
      </div>

      <style>{`
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          10%, 30% {
            transform: scale(0.9);
          }
          20%, 40% {
            transform: scale(1.1);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes ecg {
          0% {
            opacity: 0;
            transform: translateX(-100%);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(100%);
          }
        }

        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animate-ecg {
          animation: ecg 2s linear infinite;
        }

        .ecg-line {
          filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
        }
      `}</style>
    </div>
  );
};
