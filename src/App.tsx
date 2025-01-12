import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { useDropzone } from 'react-dropzone';
import { HexColorPicker } from 'react-colorful';
import { Download, Share2, Image as ImageIcon, Palette, QrCode, Settings, X } from 'lucide-react';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

function App() {
  const [text, setText] = useState('https://google.com');
  const [logo, setLogo] = useState<string>('');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('H');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'settings'>('content');
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.color-picker-container')) {
        setShowColorPicker(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 300;
          
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setLogo(canvas.toDataURL(file.type, 0.8));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 5242880
  });

  useEffect(() => {
    const options = {
      width: 300,
      height: 300,
      data: text,
      dotsOptions: {
        color: foregroundColor,
        type: 'rounded'
      },
      backgroundOptions: {
        color: backgroundColor
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.3,
        margin: 10,
        crossOrigin: 'anonymous',
      },
      qrOptions: {
        errorCorrectionLevel: errorLevel
      }
    };

    if (logo) {
      options.image = logo;
    }

    qrCode.current = new QRCodeStyling(options);

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
  }, [text, logo, foregroundColor, backgroundColor, errorLevel]);

  const downloadQR = (format: 'png' | 'jpeg' | 'svg') => {
    qrCode.current?.download({
      extension: format
    });
  };

  const shareQR = async () => {
    try {
      const blob = await qrCode.current?.getBlob();
      if (!blob) throw new Error('Failed to generate QR code image');
      
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'QR Code',
          text: 'Check out my custom QR code!'
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'qr-code.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Sharing is not supported on this device or browser');
    }
  };

  const clearLogo = () => setLogo('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            QR Code Studio
          </h1>
          <p className="text-gray-600">Create beautiful, customized QR codes instantly</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Preview Section */}
            <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
              <div ref={qrRef} className="mb-6" />
              <div className="flex gap-3">
                <button
                  onClick={() => downloadQR('png')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download size={20} /> PNG
                </button>
                <button
                  onClick={() => downloadQR('svg')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download size={20} /> SVG
                </button>
                <button
                  onClick={shareQR}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Share2 size={20} /> Share
                </button>
              </div>
            </div>

            {/* Controls Section */}
            <div className="p-6">
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === 'content' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <QrCode size={20} /> Content
                </button>
                <button
                  onClick={() => setActiveTab('style')}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === 'style' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Palette size={20} /> Style
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings size={20} /> Settings
                </button>
              </div>

              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code Content
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Enter URL or text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo (optional)
                    </label>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input {...getInputProps()} />
                      {logo ? (
                        <div className="relative inline-block">
                          <img src={logo} alt="Logo preview" className="h-20 mx-auto" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearLogo();
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-600">Drop your logo here or click to select</p>
                          <p className="text-sm text-gray-500 mt-1">Max size: 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'style' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foreground Color
                      </label>
                      <div className="relative color-picker-container">
                        <button
                          onClick={() => setShowColorPicker(showColorPicker === 'fore' ? null : 'fore')}
                          className="w-full h-10 rounded-lg border border-gray-300"
                          style={{ backgroundColor: foregroundColor }}
                        />
                        {showColorPicker === 'fore' && (
                          <div className="absolute z-10 mt-2">
                            <HexColorPicker color={foregroundColor} onChange={setForegroundColor} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                      </label>
                      <div className="relative color-picker-container">
                        <button
                          onClick={() => setShowColorPicker(showColorPicker === 'back' ? null : 'back')}
                          className="w-full h-10 rounded-lg border border-gray-300"
                          style={{ backgroundColor: backgroundColor }}
                        />
                        {showColorPicker === 'back' && (
                          <div className="absolute z-10 mt-2">
                            <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Error Correction Level
                    </label>
                    <select
                      value={errorLevel}
                      onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30%)</option>
                    </select>
                    <p className="mt-2 text-sm text-gray-500">
                      Higher levels allow for more damage to the QR code while remaining scannable
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-xl text-white">
            <h3 className="text-lg font-semibold mb-2">Fast & Easy</h3>
            <p className="opacity-90">Generate QR codes instantly with our intuitive interface</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl text-white">
            <h3 className="text-lg font-semibold mb-2">Customizable</h3>
            <p className="opacity-90">Add your logo and choose from unlimited color combinations</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 rounded-xl text-white">
            <h3 className="text-lg font-semibold mb-2">Professional</h3>
            <p className="opacity-90">Create QR codes that match your brand identity</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;