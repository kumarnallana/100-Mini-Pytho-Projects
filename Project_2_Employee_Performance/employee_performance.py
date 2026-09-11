class PerformanceTracker:

    def __init__(self, performance_data: list[dict[str: str | any]]) -> None:
        self.performance_data = performance_data

    def find_emp_by_id(self, target_id: int):
        for employee in self.performance_data:
            if employee["employee_id"] == target_id:
                return f'emp_name: {employee["name"]}, Emp_id: {employee["employee_id"]}, Emp_department: {employee["department"]}'

        return None

    def find_emps_by_department(self, department: str):
        try:
            departments_list: list[dict] = []
            for employee in self.performance_data:
                if employee["department"].lower() == department.lower():
                    departments_list.append(employee)
            return departments_list

        except Exception as e:
            return f"Error Occured: {e}"

    def count_of_departments(self, department: str):
        count: int = 0
        for emp in self.performance_data:
            if emp["department"].lower() == department.lower():
                count += 1
        return count

    def print_count_of_departments(self):
        try:
            departments: list[dict[str, int]] = []

            unique_departments = set(emp["department"]
                                     for emp in self.performance_data)

            for department in unique_departments:
                total = self.count_of_departments(department)
                departments.append(f"{department} : {total}")
            return departments
        except Exception as e:
            return e

    def total_emps_count(self):
        try:
            count: int = 0
            for _ in self.performance_data:
                count += 1
            return count
        except Exception as e:
            return f"Error occured: {e}"

    def total_quality_scores(self):
        try:
            total: int = 0
            each_quality_scores = (emp["quality_score"]
                                   for emp in self.performance_data)
            total_scores = sum(each_quality_scores)
            return total_scores
        except Exception as e:
            return e

    def avg_quality_score_by_emps(self):
        if self.total_emps_count() == 0:
            return None
        avg_score: int | float = self.total_quality_scores() / self.total_emps_count()

    def emp_highest_quality_score(self):

        try:
            if not self.performance_data:
                return None
            emp_wth_high_score = max(
                self.performance_data, key=lambda emp: emp["quality_score"])

            return f"""
            Emp_Id:{emp_wth_high_score["employee_id"]},
            Employee: {emp_wth_high_score["name"]},
            Department: {emp_wth_high_score["department"]},Tasks_Completed: {emp_wth_high_score["tasks_completed"]},
            Score: {emp_wth_high_score["quality_score"]}
            """
        except Exception as e:
            return e

    def find_emp_record_by_id(self, target_id: int):
        fast_search_dict = {
            employee["employee_id"]: dict(employee)
            for employee in self.performance_data
        }
        return fast_search_dict.get(target_id, {})

    def update_task_value_by_id(self, target_id: int, new_task_value: int):
        try:
            if new_task_value <= 0:
                raise ValueError("Task value should be greater than zero")
            else:
                for employee in self.performance_data:
                    new_emp_record = {
                        **employee
                    }
                    if new_emp_record["employee_id"] == target_id:
                        new_emp_record["tasks_completed"] = new_task_value
                        return new_emp_record
            return "Employee Id Not Found"
        except Exception as e:
            return e
