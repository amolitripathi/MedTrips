export interface CloudSyncGuard {
  beginHydration(): void;
  finishHydration(): void;
  beginRemoteApply(): void;
  endRemoteApply(): void;
  canPersist(): boolean;
  reset(): void;
}

export function createCloudSyncGuard(): CloudSyncGuard {
  let hydrated = false;
  let applyingRemote = false;

  return {
    beginHydration() {
      hydrated = false;
      applyingRemote = false;
      console.log('[cloudSync] beginHydration');
    },
    finishHydration() {
      hydrated = true;
      applyingRemote = false;
      console.log('[cloudSync] finishHydration');
    },
    beginRemoteApply() {
      applyingRemote = true;
      console.log('[cloudSync] beginRemoteApply');
    },
    endRemoteApply() {
      applyingRemote = false;
      console.log('[cloudSync] endRemoteApply');
    },
    canPersist() {
      const ok = hydrated && !applyingRemote;
      console.log('[cloudSync] canPersist', { ok, hydrated, applyingRemote });
      return ok;
    },
    reset() {
      hydrated = false;
      applyingRemote = false;
      console.log('[cloudSync] reset');
    },
  };
}
