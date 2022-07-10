import { useEffect } from 'react';
import {
  type FrameListener,
  offFrame,
  offFrameAfter,
  onFrame,
  onFrameAfter,
} from '../../Game/render/mainLoop';

export function useFrame(listener: FrameListener) {
  useEffect(() => {
    onFrame(listener);

    return () => {
      offFrame(listener);
    };
  }, [listener]);
}

export const useFrameBefore = useFrame;

export function useFrameAfter(listener: FrameListener) {
  useEffect(() => {
    onFrameAfter(listener);

    return () => {
      offFrameAfter(listener);
    };
  }, [listener]);
}
