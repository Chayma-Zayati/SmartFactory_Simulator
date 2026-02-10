import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
interface Employee{
    emp_id: string;
    factory_id: string;
    code : string;
    role: string;
    assigned_machine : string; 
    status : string;
    full_name : string;
    phone : number;

}

interface employeePerformance{
    emp_id : string;
    factory_id : string;
    faults : number;
    breakdown_count : number;
    performance : number;
    working_hours : number;
    break_duration : number;

}
interface employeeGlobalPerformance{
    emp_id : string;
    factory_id : string;
    breaks_count: number; 
    avg_performance : number;
    total_faults : number;
    total_breakdowns : number;
    total_hours : number;
    avg_break_duration : number;
    coef : number;
}

const useEmployee = () => {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [globalPerformance, setGlobalPerformance] = useState<employeeGlobalPerformance | null>(null);
    const setStatus = async (status: string) => {
        if (employee) {
            
            try {
                const { data, error } = await supabase.from('employee').update({ status }).eq('emp_id', employee.emp_id);
            
                setEmployee({ ...employee, status });
                
            } catch (error) {
                console.error("Error updating employee status:", error);
            }
        }
    }

    const fetchEmployee = async (code: string , factory_id: string) => {
        try {
            const { data, error } = await supabase.from('employee').select('*').eq('code', code).eq('factory_id', factory_id).single();
            if (error) {
                console.error("Error fetching employee:", error);
            } else {
                setEmployee(data);
            }
        } catch (error) {
            console.error("Error fetching employee:", error);
        }
    }
    const setEmployeeDailyPerformance = async (performanceData: employeePerformance) => {
        try {
            const { data, error } = await supabase.from('employee_performance').insert(performanceData);
            if (error) {
                console.error("Error setting employee performance:", error);
            }
        }catch (error) {
            console.error("Error setting employee performance:", error);
        }
    }

    const fetchEmployeeGlobalPerformance = async (emp_id: string, factory_id: string) => {
        try {
            const { data, error } = await supabase.from('employee_global_performance').select('*').eq('emp_id', emp_id).eq('factory_id', factory_id).single();
            if (error) {
                console.error("Error fetching employee global performance:", error);
            } else {
                setGlobalPerformance(data);
            }   
        } catch (error) {
            console.error("Error fetching employee global performance:", error);
        }
    }
    const calculateNewGlobalPerformance = (dailyPerformance: employeeGlobalPerformance, currentGlobalPerformance: employeeGlobalPerformance | null): employeeGlobalPerformance => {
        if (!currentGlobalPerformance) {
            return {
                emp_id: dailyPerformance.emp_id,
                factory_id: dailyPerformance.factory_id,
                breaks_count: 0,
                avg_performance: dailyPerformance.avg_performance,
                total_faults: dailyPerformance.total_faults,
                total_breakdowns: dailyPerformance.total_breakdowns,
                total_hours: dailyPerformance.total_hours,
                avg_break_duration: dailyPerformance.avg_break_duration,
                coef: 1
            };
        }
        const new_global_performance = {
            emp_id: dailyPerformance.emp_id,
            factory_id: dailyPerformance.factory_id,
            breaks_count: currentGlobalPerformance.breaks_count + dailyPerformance.breaks_count,
            avg_performance: (currentGlobalPerformance.avg_performance * currentGlobalPerformance.coef + dailyPerformance.avg_performance) / (currentGlobalPerformance.coef +1 ), 
            total_faults: currentGlobalPerformance.total_faults + dailyPerformance.total_faults,
            total_breakdowns: currentGlobalPerformance.total_breakdowns + dailyPerformance.total_breakdowns,
            total_hours: currentGlobalPerformance.total_hours + dailyPerformance.total_hours,
            avg_break_duration: (currentGlobalPerformance.avg_break_duration * currentGlobalPerformance.coef + dailyPerformance.avg_break_duration) / (currentGlobalPerformance.coef + 1),
            coef: currentGlobalPerformance.coef +1
        };
        return new_global_performance;
    }
    const updateEmployeeGlobalPerformance = async (performanceData: employeeGlobalPerformance) => {
        
        const newGlobalPerformance = calculateNewGlobalPerformance(performanceData, globalPerformance);
        try {
            const { data, error } = await supabase.from('employee_global_performance').upsert(newGlobalPerformance, { onConflict: 'emp_id' });
            if (error) {
                console.error("Error updating employee global performance:", error);
            } else {
                setGlobalPerformance(data);
            }
        } catch (error) {
            console.error("Error updating employee global performance:", error);
        }
    }

    return { employee, setStatus, fetchEmployee, setEmployeeDailyPerformance, fetchEmployeeGlobalPerformance, updateEmployeeGlobalPerformance };

}
   

export default useEmployee;