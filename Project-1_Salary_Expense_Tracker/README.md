# Project 01: Salary Expense Tracker

> **Tier 1: Foundations & Accumulator Logic**  
> *Core Focus: Manual Iteration, State Accumulation, Filtering, and Object-Oriented Modeling.*

---

## 🎯 Problem Statement
Organizations need to analyze employee compensation structures across thousands of records to determine total financial outlay, workforce size, average compensation, salary boundaries (minimum and maximum), and demographic counts above a given threshold.

Instead of delegating this analysis to high-level data packages like Pandas or NumPy, this project builds every calculation **from first principles using raw Python control flow and accumulator patterns**.

---

## 🧠 Mental Model & Logical Breakdown
1. **Data Ingestion**: Safely resolve the relative path of `salaries.json` using `pathlib.Path` and load the raw salary integers.
2. **First-Principles Accumulation**:
   - `emp_count`: Manually iterate through the collection with a counter variable rather than hiding the traversal.
   - `total_salary`: Accumulate running sums across iterations.
   - `above_threshold_count`: Build a filtered collection based on condition (`salary >= threshold`).
   - `avg_emp_salary`: Combine manual sum and manual count using integer floor division (`//`).
   - `highest_emp_salary` / `lowest_emp_salary`: Identify extreme values across the dataset.
3. **Separation of Concerns (OOP)**:
   - `SalaryExpenseTracker`: Responsible purely for business logic and mathematical analysis.
   - `Table`: Inherits from `SalaryExpenseTracker` to handle report formatting and clean terminal presentation.

---

## 🖼️ Visual Logic & Pseudocode Card
The logic was designed and visualized prior to coding:

![Salary Expense Tracker Pseudocode](./DAY-3_-SALARY-EXPENSE-TRACKER.png)

---

## 📝 Pseudocode

```text
METHOD HIGHEST_EMP_SALARY(SELF, EMP_DATA):
    SET HIGHEST_SALARY = MAXIMUM VALUE IN EMP_DATA
    RETURN HIGHEST_SALARY
END METHOD

METHOD AVG_EMP_SALARY(SELF, EMP_DATA):
    SET AVERAGE_SALARY = TOTAL_SALARY(EMP_DATA) / EMP_COUNT(EMP_DATA)
    RETURN AVERAGE_SALARY
END METHOD

METHOD LOWEST_EMP_SALARY(SELF, EMP_DATA):
    SET LOWEST_SALARY = MINIMUM VALUE IN EMP_DATA
    RETURN LOWEST_SALARY
END METHOD

METHOD ABOVE_THRESHOLD_COUNT(SELF, EMP_SALARY, THRESHOLD = 50000):
    INITIALIZE FINAL_RESULT AS EMPTY LIST
    FOR EACH SALARY IN EMP_SALARY:
        IF SALARY >= THRESHOLD:
            APPEND SALARY TO FINAL_RESULT
    RETURN FINAL_RESULT
END METHOD
```

---

## 💻 Implementation Highlights

```python
# Pure accumulator loop pattern
def total_salary(self, data: list[int]) -> int:
    total = 0
    for i in data:
        total += i
    return total

# Filtering without external dependencies
def above_threshold_count(self, emp_salary: list[int]) -> list[int]:
    estimated_threshold = 50000
    final_result = []
    for salary in emp_salary:
        if salary >= estimated_threshold:
            final_result.append(salary)
    return final_result
```

---

## ⏱️ Complexity Analysis

| Operation | Time Complexity | Space Complexity | Notes |
| :--- | :--- | :--- | :--- |
| `emp_count()` | $O(n)$ | $O(1)$ | Single linear pass across records |
| `total_salary()` | $O(n)$ | $O(1)$ | Accumulates values in scalar memory |
| `above_threshold_count()` | $O(n)$ | $O(k)$ | Linear scan; $k$ is count of qualifying salaries |
| `avg_emp_salary()` | $O(n)$ | $O(1)$ | Computed from sum and count |
| **Total Pipeline** | **$O(n)$** | **$O(k)$** | Highly efficient linear processing |

---

## 🚀 How to Run

Navigate to the project directory and run the analyzer script:

```bash
python salary_analyzer.py
```

### Expected Output:
```text
SALARY EXPENSE ANALYSIS REPORT
--------------------------------
Total Employees: 5000
Total Salary Expense: 374858000
Average Salary: 74971
Highest Salary: 220000
Lowest Salary: 25000
Salaries >= 50000: 3548
--------------------------------
```

---

## 💡 Key Takeaways
- Building accumulator patterns manually solidifies understanding of how built-ins like `sum()` and `len()` function behind the scenes.
- Decoupling data calculation (`SalaryExpenseTracker`) from presentation (`Table`) improves code modularity and maintainability.
