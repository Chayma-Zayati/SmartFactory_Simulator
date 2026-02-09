import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function useSupabaseRealtime({
  onEmployeePerformance,
  onMachinePerformance,
  onProductionLog
}) {
  useEffect(() => {
    const channel = supabase
      .channel('factory-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employee_performance' },
        (payload) => onEmployeePerformance?.(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'machine_performance' },
        (payload) => onMachinePerformance?.(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'production_logs' },
        (payload) => onProductionLog?.(payload)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onEmployeePerformance, onMachinePerformance, onProductionLog])
}