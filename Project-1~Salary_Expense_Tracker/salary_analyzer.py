import json
from pathlib import Path


def load_salaries(file_name: str = "salaries.json") -> list[int]:
    file_path = Path(__file__).parent / file_name
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)
    return data["emp_salaries"]


class SalaryExpenseTracker:
    def emp_count(self, emp_data: list[int]) -> int:
        count = 0
        for _ in emp_data:
            count += 1
        return count

    def total_salary(self, data: list[int]) -> int:
        total = 0
        for i in data:
            total += i
        return total

    def above_threshold_count(self, emp_salary: list[int]) -> list[int]:
        estimated_threshold = 50000

        final_result = []

        for salary in emp_salary:
            if salary >= estimated_threshold:
                final_result.append(salary)

        return final_result

    def highest_emp_salary(self, emp_data: list[int]) -> int:
        highest_salary: int = max(emp_data)

        return highest_salary

    def avg_emp_salary(self, emp_data: list[int]) -> int:

        avg_salary: int = self.total_salary(
            emp_data) // self.emp_count(emp_data)

        return avg_salary

    def lowest_emp_salary(self, emp_data: list[int]) -> int:
        return min(emp_data)


class Table(SalaryExpenseTracker):

    def display(self, emp_data: list[int], threshold: int = 50000) -> None:

        total_count = self.emp_count(emp_data)
        total_salary = self.total_salary(emp_data)
        average_salary = self.avg_emp_salary(emp_data)
        highest_salary = self.highest_emp_salary(emp_data)
        lowest_salary = self.lowest_emp_salary(emp_data)

        above_threshold = self.above_threshold_count(emp_data)

        print("\nSALARY EXPENSE ANALYSIS REPORT")
        print("--------------------------------")

        print("Total Employees:", total_count)
        print("Total Salary Expense:", total_salary)
        print("Average Salary:", average_salary)
        print("Highest Salary:", highest_salary)
        print("Lowest Salary:", lowest_salary)
        print(f"Salaries >= {threshold}:", len(above_threshold))

        print("--------------------------------\n")


if __name__ == "__main__":
    emp_salaries = load_salaries()
    report_table = Table()
    report_table.display(emp_salaries)
