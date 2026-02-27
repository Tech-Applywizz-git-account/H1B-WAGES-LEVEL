import { useState, useEffect, useCallback } from 'react';
import { runFullSync, isSyncNeeded, getLastSyncStatus } from '../dataSyncService';
import useAuth from './useAuth';

/**
 * Custom hook for automatic data synchronization
 * 
 * This hook:
 * 1. Checks if sync is needed on mount (24-hour interval)
 * 2. Runs sync automatically for authenticated users
 * 3. Provides manual sync trigger for admins
 * 4. Reports sync status and errors
 */
const useDataSync = () => {
    const { user, isAdmin } = useAuth();
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [syncError, setSyncError] = useState(null);
    const [lastSyncLogs, setLastSyncLogs] = useState([]);

    // Auto-sync on mount if needed
    useEffect(() => {
        if (user && isAdmin && isSyncNeeded()) {
            performSync();
        }
    }, [user, isAdmin]);

    // Fetch last sync logs for admin dashboard
    useEffect(() => {
        if (isAdmin) {
            fetchSyncLogs();
        }
    }, [isAdmin]);

    const performSync = useCallback(async (force = false) => {
        if (syncing) return; // Prevent concurrent syncs

        setSyncing(true);
        setSyncError(null);

        try {
            const result = await runFullSync(force);
            setSyncResult(result);

            if (isAdmin) {
                await fetchSyncLogs(); // Refresh logs after sync
            }
        } catch (error) {
            console.error('Sync error:', error);
            setSyncError(error.message || 'Sync failed');
        } finally {
            setSyncing(false);
        }
    }, [syncing, isAdmin]);

    const fetchSyncLogs = async () => {
        try {
            const logs = await getLastSyncStatus();
            setLastSyncLogs(logs);
        } catch (error) {
            console.error('Error fetching sync logs:', error);
        }
    };

    return {
        syncing,
        syncResult,
        syncError,
        lastSyncLogs,
        triggerSync: () => performSync(true),
        isSyncNeeded: isSyncNeeded()
    };
};

export default useDataSync;
