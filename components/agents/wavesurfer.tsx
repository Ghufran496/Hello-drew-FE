'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Pause, Play } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

function Wavesurfer({ audioUrl }: { audioUrl: string }) {
  //wavesurfer for voice preview
  const containerRef = useRef(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Play/Pause handler
  const onPlayPause = useCallback(() => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
    }
  }, []);

  // initializing wavesurfer
  useEffect(() => {
    if (!audioUrl) return;

    if (!containerRef.current) return;

    // Destroy any existing instance before creating a new one
    if (waveSurferRef.current) {
      waveSurferRef.current.destroy();
      waveSurferRef.current = null;
    }

    waveSurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      height: 40,
      barWidth: 3,
      waveColor: '#0357F8',
      progressColor: '#0357F8',
      url: audioUrl,
    });

    waveSurferRef.current.on('play', () => setIsPlaying(true));
    waveSurferRef.current.on('pause', () => setIsPlaying(false));
  }, [audioUrl]);

  return (
    <div className="flex items-center justify-end gap-x-1">
      {audioUrl && (
        <>
          <Button
            onClick={onPlayPause}
            className="rounded-full w-[40px] h-[40px]"
          >
            {isPlaying ? (
              <Pause className="text-3xl" />
            ) : (
              <Play className="text-3xl" />
            )}
          </Button>
          <div className="w-[200px] ml-2">
            <div ref={containerRef} />
          </div>
        </>
      )}
    </div>
  );
}

export default Wavesurfer;
