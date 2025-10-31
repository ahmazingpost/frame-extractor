import React, { useState, useRef, useEffect, useCallback } from 'react';

// --- TYPE DEFINITIONS ---
type Theme = 'light' | 'dark';

// --- HELPER ICONS ---
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-purple/50 dark:text-purple-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


// --- UI COMPONENTS (Defined outside App to prevent re-renders) ---

interface ThemeToggleProps {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    aria-label="Toggle theme"
  >
    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
  </button>
);

const Header: React.FC = () => (
  <header className="text-center p-4 md:p-6 animate-fade-in">
    <h1 className="text-4xl md:text-5xl font-bold font-poppins text-gray-800 dark:text-white">
      🎬 Frame Extractor
    </h1>
    <p className="text-md md:text-lg text-gray-500 dark:text-gray-400 mt-2">
      Upload your video and extract every frame instantly.
    </p>
  </header>
);

interface UploadAreaProps {
  onFileUpload: (file: File) => void;
  isLoadingFfmpeg: boolean;
}
const UploadArea: React.FC<UploadAreaProps> = ({ onFileUpload, isLoadingFfmpeg }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file && (file.type.startsWith('video/'))) {
            onFileUpload(file);
        } else {
            alert('Please drop a valid video file.');
        }
    };
    
    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const disabled = isLoadingFfmpeg;
    
    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full max-w-2xl mx-auto my-8 p-8 text-center border-2 border-dashed rounded-2xl transition-all duration-300 ${isDragging ? 'border-brand-purple scale-105 bg-purple-50 dark:bg-purple-900/20' : 'border-purple-300 dark:border-purple-600/50'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/*"
                onChange={handleFileChange}
                disabled={disabled}
            />
            <UploadIcon />
            <p className="mt-4 text-gray-600 dark:text-gray-300">
                Drag & drop your video here, or
            </p>
            <button
                onClick={handleButtonClick}
                disabled={disabled}
                className="mt-4 px-6 py-2 bg-brand-purple text-white font-semibold rounded-lg shadow-md hover:bg-purple-800 hover:shadow-lg hover:shadow-purple-400/50 transform hover:-translate-y-0.5 transition-all duration-300 disabled:bg-gray-400 disabled:shadow-none disabled:transform-none"
            >
                {isLoadingFfmpeg ? 'Loading Engine...' : 'Browse Files'}
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Max file size: 500MB</p>
        </div>
    );
};


interface ProgressBarProps {
  progress: number;
}
const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <div className="w-full max-w-2xl mx-auto my-8 px-4">
    <p className="text-center text-gray-700 dark:text-gray-200 mb-2">Extracting frames, please wait...</p>
    <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-4">
      <div
        className="bg-gradient-to-r from-purple-500 to-brand-purple h-4 rounded-full transition-all duration-300 ease-linear"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <p className="text-center font-semibold text-brand-purple dark:text-purple-300 mt-2">{Math.round(progress)}%</p>
  </div>
);

interface FrameGalleryProps {
  frames: string[];
  onFrameClick: (frameUrl: string) => void;
  onFrameDownload: (frameUrl: string, index: number) => void;
}
const FrameGallery: React.FC<FrameGalleryProps> = ({ frames, onFrameClick, onFrameDownload }) => (
  <div className="w-full px-4 sm:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
    {frames.map((frame, index) => (
      <div 
        key={index}
        className="relative group animate-fade-in"
        style={{ animationDelay: `${index * 20}ms` }}
      >
        <img
          src={frame}
          alt={`Frame ${index + 1}`}
          onClick={() => onFrameClick(frame)}
          className="w-full aspect-video object-cover rounded-lg cursor-pointer shadow-md group-hover:shadow-xl group-hover:scale-105 transform transition-all duration-300"
        />
        <button
            onClick={(e) => {
                e.stopPropagation();
                onFrameDownload(frame, index);
            }}
            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-200 hover:bg-brand-purple hover:scale-110"
            aria-label={`Download frame ${index + 1}`}
            title={`Download frame ${index + 1}`}
        >
            <DownloadIcon className="h-4 w-4" />
        </button>
      </div>
    ))}
  </div>
);

interface FramePreviewModalProps {
  frameUrl: string | null;
  onClose: () => void;
  frameNumber: number;
}
const FramePreviewModal: React.FC<FramePreviewModalProps> = ({ frameUrl, onClose, frameNumber }) => {
  if (!frameUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 max-w-4xl w-11/12 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <img src={frameUrl} alt="Frame preview" className="w-full h-auto object-contain rounded-lg flex-shrink min-h-0" />
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-700 dark:text-gray-300 font-semibold">Frame {frameNumber}</p>
            <div>
              <button onClick={onClose} className="px-5 py-2 mr-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-300">
                Close
              </button>
              <a
                href={frameUrl}
                download={`frame-${String(frameNumber).padStart(4, '0')}.jpg`}
                className="inline-block px-5 py-2 bg-brand-purple text-white font-semibold rounded-lg shadow-md hover:bg-purple-800 hover:shadow-lg hover:shadow-purple-400/50 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Download Frame
              </a>
            </div>
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC = () => (
    <footer className="w-full text-center py-6 mt-auto">
        <p className="text-gray-500 dark:text-gray-400 opacity-80 hover:opacity-100 transition-opacity">
            From Ahmazing Tools 💜
        </p>
    </footer>
);


// --- MAIN APP COMPONENT ---

export default function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoadingFfmpeg, setIsLoadingFfmpeg] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frames, setFrames] = useState<string[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const ffmpegRef = useRef<any>(null);
  const fetchFileRef = useRef<any>(null);

  // Initialize theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Load FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
        try {
            const { FFmpeg } = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/ffmpeg.js');
            const { fetchFile } = await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/util.js');
            fetchFileRef.current = fetchFile;
            
            const ffmpeg = new FFmpeg();
            ffmpeg.on('log', ({ message }: { message: string }) => {
                console.log(message);
            });
            ffmpeg.on('progress', ({ progress: p }: { progress: number }) => {
                setProgress(p * 100);
            });
            await ffmpeg.load({
                coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js"
            });
            ffmpegRef.current = ffmpeg;
        } catch (error) {
            console.error('Failed to load FFmpeg:', error);
            alert('Failed to load video processing engine. Please try refreshing the page.');
        } finally {
            setIsLoadingFfmpeg(false);
        }
    };
    loadFFmpeg();
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!ffmpegRef.current || !fetchFileRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      setProgress(0);
      setFrames([]);

      const ffmpeg = ffmpegRef.current;
      const fetchFile = fetchFileRef.current;
      
      await ffmpeg.writeFile(file.name, await fetchFile(file));

      // Extract all frames as jpg. %04d ensures filenames are padded with zeros for sorting.
      await ffmpeg.exec(['-i', file.name, '-q:v', '2', 'frame%04d.jpg']);

      const allFiles = await ffmpeg.listDir('.');
      const frameFiles = allFiles
        .filter((f: any) => f.name.startsWith('frame') && f.name.endsWith('.jpg'))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      
      const frameUrls: string[] = [];
      for (const f of frameFiles) {
        const data = await ffmpeg.readFile(f.name);
        const url = URL.createObjectURL(new Blob([data], { type: 'image/jpeg' }));
        frameUrls.push(url);
      }
      
      setFrames(frameUrls);
      
    } catch (error) {
      console.error('Error processing video:', error);
      alert('An error occurred while extracting frames. Please check the console for details.');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const handleDownloadAll = useCallback(async () => {
    if (frames.length === 0 || isZipping) return;

    setIsZipping(true);
    try {
        const JSZip = (window as any).JSZip;
        if (!JSZip) {
            alert('Zipping library not found. Please refresh the page.');
            setIsZipping(false);
            return;
        }
        const zip = new JSZip();

        await Promise.all(frames.map(async (frameUrl, index) => {
            const response = await fetch(frameUrl);
            const blob = await response.blob();
            const fileName = `frame-${String(index + 1).padStart(4, '0')}.jpg`;
            zip.file(fileName, blob);
        }));

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'extracted-frames.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error('Error zipping frames:', error);
        alert('An error occurred while zipping the frames.');
    } finally {
        setIsZipping(false);
    }
  }, [frames, isZipping]);

  const handleFrameDownload = (frameUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = frameUrl;
    link.download = `frame-${String(index + 1).padStart(4, '0')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      frames.forEach(URL.revokeObjectURL);
    };
  }, [frames]);
  
  const selectedFrameNumber = selectedFrame ? frames.indexOf(selectedFrame) + 1 : 0;

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-[#1a0c24] text-gray-900 dark:text-gray-100 transition-colors duration-300 ${frames.length > 0 ? '' : 'justify-between'}`}>
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      
      <main className="flex-grow flex flex-col items-center justify-center w-full">
        <Header />
        
        {!isProcessing && frames.length === 0 && (
          <UploadArea onFileUpload={handleFileUpload} isLoadingFfmpeg={isLoadingFfmpeg} />
        )}
        
        {isProcessing && <ProgressBar progress={progress} />}
        
        {frames.length > 0 && !isProcessing && (
            <div className="w-full flex flex-col items-center gap-6 py-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            frames.forEach(URL.revokeObjectURL);
                            setFrames([]);
                        }}
                        className="px-6 py-2 bg-white dark:bg-gray-700 border border-purple-300 dark:border-purple-600 text-brand-purple dark:text-purple-300 font-semibold rounded-lg shadow-sm hover:bg-purple-50 dark:hover:bg-gray-600 transition-all duration-300"
                    >
                        Extract Another Video
                    </button>
                    <button
                        onClick={handleDownloadAll}
                        disabled={isZipping}
                        className="px-6 py-2 bg-brand-purple text-white font-semibold rounded-lg shadow-md hover:bg-purple-800 hover:shadow-lg hover:shadow-purple-400/50 transform hover:-translate-y-0.5 transition-all duration-300 disabled:bg-gray-400 disabled:shadow-none disabled:transform-none disabled:cursor-wait"
                    >
                        {isZipping ? 'Zipping...' : 'Download All Frames'}
                    </button>
                </div>
                <FrameGallery 
                  frames={frames} 
                  onFrameClick={setSelectedFrame} 
                  onFrameDownload={handleFrameDownload} 
                />
            </div>
        )}

      </main>

      <Footer />

      <FramePreviewModal 
        frameUrl={selectedFrame} 
        onClose={() => setSelectedFrame(null)}
        frameNumber={selectedFrameNumber}
      />
    </div>
  );
}
