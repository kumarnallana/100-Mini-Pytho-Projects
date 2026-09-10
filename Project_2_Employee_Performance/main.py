import employee_performance
import json

with open("performance_data.json") as f:
    data = json.load(f)


emp_performance_tracker = employee_performance.PerformanceTracker(data)

if __name__ == "__main__":

    # EMPLOYEES BY ID
    # print(emp_performance_tracker.find_emp_by_id(104))

    # EMPLOYEES BY DEPARTMENT
    # result = emp_performance_tracker.find_emps_by_department("engineering")
    # print(json.dumps(result, indent=2))

    # TOTAL COUNT OF EACH DEPARTMENTS IN DATA
    # total_count = emp_performance_tracker.print_count_of_departments()
    # print(json.dumps(total_count, indent=2))

    # RETURN EMPLOYEE RECORD BY ID
    # result_by_id = emp_performance_tracker.find_emp_record_by_id(9821)
    # print(json.dumps(result_by_id, indent=4))

    print(emp_performance_tracker.update_task_value_by_id(101, 15))
