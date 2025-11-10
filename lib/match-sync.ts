import { supabase } from './supabase-client';

let syncInterval: NodeJS.Timeout | null = null;
let lastSyncTime: Date | null = null;

export interface SyncStats {
  competitions: number;
  synced: number;
  updated: number;
  skipped: number;
  errors: number;
}

export interface SyncResponse {
  success: boolean;
  message?: string;
  stats?: SyncStats;
  error?: string;
}

export async function syncMatches(): Promise<SyncResponse> {
  try {
    console.log('🌀 Synchronisation Odds API...');

    const { data: functionData, error: functionError } = await supabase.functions.invoke('sync-matches', {
      method: 'POST',
    });

    if (functionError) {
      console.error('⚠️ Erreur lors de la synchronisation:', functionError);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('matches-synced', { detail: null }));
      }

      return {
        success: false,
        error: functionError.message,
      };
    }

    const response = functionData as SyncResponse;

    if (response.success) {
      lastSyncTime = new Date();
      console.log('✅ Matchs mis à jour', response.stats);

      if (response.stats && (response.stats.synced === 0 && response.stats.updated === 0)) {
        console.log('⚠️ Aucun match trouvé');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('matches-synced', { detail: response.stats }));
      }
    } else {
      console.error('⚠️ Échec de la synchronisation:', response.error);
    }

    return response;
  } catch (error) {
    console.error('⚠️ Erreur lors de la synchronisation:', error);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('matches-synced', { detail: null }));
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function startAutoSync(intervalMs: number = 60 * 60 * 1000) {
  if (syncInterval) {
    console.log('Auto-sync already running');
    return;
  }

  console.log(`Starting auto-sync every ${intervalMs / 1000 / 60} minutes`);

  syncMatches();

  syncInterval = setInterval(() => {
    syncMatches();
  }, intervalMs);
}

export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('Auto-sync stopped');
  }
}

export function getLastSyncTime(): Date | null {
  return lastSyncTime;
}

export function isAutoSyncRunning(): boolean {
  return syncInterval !== null;
}
