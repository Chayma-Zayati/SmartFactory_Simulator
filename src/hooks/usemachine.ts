import { useState, useEffect, use } from 'react';
import { supabase } from '../lib/supabaseClient';
import  useEmployee  from './employee';
interface Machine {
    machine_id: string;
    factory_id: string;
    name: string;
    status: string;
    code : string;
    
}

interface MachinePerformance {
    machine_id: string;
    factory_id: string;
    faults: number;
    bad_pieces: number;
    good_pieces: number;
    breakdowns: number;

    performance: number;
    blocking_time: number;
    breakdown_duration: number;

    working_hours: number;
    break_duration: number;
}


interface MachineGlobalPerformance {
    machine_id: string;
    factory_id: string;
    total_bad_pieces: number;
    total_blocking_time: number;
    avg_hours: number;
    total_good_pieces: number;
    
    avg_performance: number;
    total_faults: number;
    total_breakdowns: number;
    total_hours: number;
    avg_break_duration: number;
    coef : number;
}

interface logs {
    factory_id: string;
    emp_id: string;
    machine_id: string;
    event_type: string;
    event_duration: number; // in minutes
}

const useMachine = () => {
    const [machine, setMachine] = useState<Machine | null>({
        machine_id: 'd5ebd997-aab2-4fc8-ba2b-dfbd14206523',
        factory_id: '97e90fd2-469a-471b-a824-1e6ac0d5ec93',
        name: 'Pression',
        status: 'idle',
        code: 'MACH001',
    });

    const [machinePerformance, setMachinePerformance] = useState<MachineGlobalPerformance | null>(null);
    const [exists, setExists] = useState<boolean>(false);
    const {setEmpStatus , fetchEmployee , employee} = useEmployee();

    const checkExistance = async (code: string, factory_id: string) => {
        try {
            const { data, error } = await supabase.from('machine').select('*').eq('code', code).eq('factory_id', factory_id).single();
            if (error) {
                console.error("Error fetching machine:", error);
            }
            return true; 
        } catch (error) {
            console.error("Error fetching machine:", error);
            return false; 
        }
    };

    useEffect(() => {
        checkExistance(machine?.code || '', machine?.factory_id || '').then(setExists);
    }, []);
    const parseEmployeeStatus = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'active';
            case 'paused':
                return 'paused';
            case 'idle':
                return 'idle';
            case 'breakdown':
                return 'waiting';
            case 'maintenance':
                return 'maintenance';
            default:
                return 'unknown';
        }
    }
    const setStatus = async (status: string , emp_code: string) => {
        
        try{
            await fetchEmployee(emp_code , machine?.factory_id || '');
        }
        catch(error){
            console.error("Error fetching employee:", error);
            return;
        }
        if (machine && exists) {
            try {
                const { data, error } = await supabase.from('machine').update({ status : status }).eq('machine_id', machine.machine_id).single();
                if (error) {
                    console.error("Error updating machine status:", error);
                } else {
                    setMachine({ ...machine, status });
                    const employeeStatus = parseEmployeeStatus(status);
                    await setEmpStatus(employeeStatus);
                }
            } catch (error) {
                console.error("Error updating machine status:", error);
            }
        }

    }

    const pushLog = async (log: logs) => {
        const payload ={
            factory_id : machine?.factory_id,
            machine_id : machine?.machine_id,
            emp_id : employee?.emp_id,
            event_type : log.event_type,
            event_duration : log.event_duration

        }

        try {
            const { data, error } = await supabase.from('production_logs').insert(payload);
            if (error) {
                console.error("Error inserting log:", error);
            }
        } catch (error) {
            console.error("Error inserting log:", error);
        }
    }

    const calculateGlobalPerformance = async (daily : MachinePerformance) => {
        try{
            const { data , error } = await supabase.from('machine_global_performance').select('*').eq('machine_id', machine?.machine_id);
            if (data && data.length > 0) {
                setMachinePerformance(data[0]);
            }
        }
        catch(error){
            console.error("Error fetching global performance:", error);
            return null;
        }
        if (!machine?.machine_id || !machine?.factory_id) {
            console.error("Machine ID or Factory ID is undefined");
            return null;
        }
        return {
            machine_id : machine.machine_id,
            factory_id : machine.factory_id,
            total_bad_pieces : (machinePerformance?.total_bad_pieces ?? 0) + daily.bad_pieces,
            total_blocking_time : (machinePerformance?.total_blocking_time ?? 0) + daily.blocking_time,
            avg_hours : ((machinePerformance?.avg_hours ?? 0)*(machinePerformance?.coef ?? 0) + daily.working_hours) / ((machinePerformance?.coef ?? 0) + 1),
            total_good_pieces : (machinePerformance?.total_good_pieces ?? 0) + daily.good_pieces,
            avg_performance : ((machinePerformance?.avg_performance ?? 0)*(machinePerformance?.coef ?? 0) + daily.performance) / ((machinePerformance?.coef ?? 0) + 1),
            total_faults : (machinePerformance?.total_faults ?? 0) + daily.faults,
            total_breakdowns : (machinePerformance?.total_breakdowns ?? 0) + daily.breakdowns,
            total_hours : (machinePerformance?.total_hours ?? 0) + daily.working_hours,
            avg_break_duration : ((machinePerformance?.avg_break_duration ?? 0)*(machinePerformance?.coef ?? 0) + daily.break_duration) / ((machinePerformance?.coef ?? 0) + 1),
            coef : (machinePerformance?.coef ?? 0) + 1
        }



    }
    const setPerformance = async (performanceData: MachinePerformance) => {
        const [globalPerformance, setGlobalPerformance] = useState<MachineGlobalPerformance | null>(null);
        try {
            const res = await calculateGlobalPerformance(performanceData);
            
            if (res) {
                setGlobalPerformance(res);
            }
            
        } catch (error) {
            console.error("Error calculating global performance:", error);
        }
        try {
            const { data, error } = await supabase.from('machine_performance').insert(performanceData);
            const {data : globalData, error : globalError} = await supabase.from('machine_global_performance').upsert(globalPerformance);
            if (error) {
                console.error("Error inserting machine performance:", error);
            }
        } catch (error) {
            console.error("Error inserting machine performance:", error);
        }
    }





    return { machine, setMachine, setStatus, pushLog, setPerformance };
}
export default useMachine;