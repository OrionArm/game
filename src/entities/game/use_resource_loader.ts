import { useCallback, useEffect, useState } from 'react';
import { preload } from 'react-dom';

type ResourcePriority = 'high' | 'low' | 'auto';
type ResourceType = 'character' | 'enemy' | 'interactive' | 'currency' | 'background' | 'npc';

export interface ResourceConfig {
  src: string;
  priority: ResourcePriority;
  type: ResourceType;
}

interface UseResourceLoaderOptions {
  resources: ResourceConfig[];
  onProgress?: (progress: number, text: string) => void;
  onComplete?: () => void;
}

interface UseResourceLoaderReturn {
  loading: boolean;
  progress: number;
  loadingText: string;
  loadedResources: Set<string>;
  isComplete: boolean;
}

export function useResourceLoader({
  resources,
  onProgress,
  onComplete,
}: UseResourceLoaderOptions): UseResourceLoaderReturn {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Инициализация...');
  const [loadedResources, setLoadedResources] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  const updateProgress = useCallback(() => {
    const currentLoaded = loadedResources.size;
    const totalResources = resources.length;
    const newProgress = Math.round((currentLoaded / totalResources) * 100);

    setProgress(newProgress);

    const highPriorityResources = resources.filter((r) => r.priority === 'high');
    const loadedHighPriority = highPriorityResources.filter((r) =>
      loadedResources.has(r.src),
    ).length;

    let newLoadingText: string;
    if (loadedHighPriority < highPriorityResources.length) {
      newLoadingText = `Загрузка критических ресурсов... ${loadedHighPriority}/${highPriorityResources.length}`;
    } else if (currentLoaded < totalResources) {
      newLoadingText = `Загрузка дополнительных ресурсов... ${currentLoaded}/${totalResources}`;
    } else {
      newLoadingText = 'Все ресурсы загружены';
    }

    setLoadingText(newLoadingText);

    if (onProgress) {
      onProgress(newProgress, newLoadingText);
    }

    if (currentLoaded === totalResources && !isComplete) {
      setIsComplete(true);
      setLoading(false);
      if (onComplete) {
        onComplete();
      }
    }
  }, [loadedResources, resources, onProgress, onComplete, isComplete]);

  useEffect(() => {
    if (resources.length === 0) {
      setLoading(false);
      setIsComplete(true);
      return;
    }

    resources.forEach((resource) => {
      preload(resource.src, {
        as: 'image',
        fetchPriority: resource.priority,
      });
    });

    const preloadPromises = resources.map((resource) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          setLoadedResources((prev) => new Set([...prev, resource.src]));
          resolve();
        };
        img.onerror = () => {
          setLoadedResources((prev) => new Set([...prev, resource.src]));
          resolve();
        };
        img.src = resource.src;
      });
    });

    const progressInterval = setInterval(() => {
      if (!isComplete) {
        updateProgress();
      }
    }, 200);

    Promise.all(preloadPromises)
      .then(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setLoadingText('Все ресурсы загружены');
        setLoading(false);
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
      })
      .catch((error) => {
        clearInterval(progressInterval);
        console.warn('Некоторые ресурсы не удалось загрузить:', error);
        setProgress(100);
        setLoadingText('Ресурсы загружены');
        setLoading(false);
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
      });

    return () => clearInterval(progressInterval);
  }, [resources, updateProgress, onComplete, isComplete]);

  return {
    loading,
    progress,
    loadingText,
    loadedResources,
    isComplete,
  };
}
