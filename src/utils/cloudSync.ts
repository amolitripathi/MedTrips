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
    },
    finishHydration() {
      hydrated = true;
      applyingRemote = false;
    },
    beginRemoteApply() {
      applyingRemote = true;
    },
    endRemoteApply() {
      applyingRemote = false;
    },
    canPersist() {
      return hydrated && !applyingRemote;
    },
    reset() {
      hydrated = false;
      applyingRemote = false;
    },
  };
}
