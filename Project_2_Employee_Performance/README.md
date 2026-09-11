# Project 02: Employee Performance Tracker

> **Tier 1: Foundations & Accumulator Logic**  
> *Core Focus: Nested Data Structures (List of Dictionaries), Hashing, Metric Aggregation, and Safe Record Updates.*

---

## 🎯 Problem Statement
Managing and evaluating human capital across modern enterprises requires processing rich, semi-structured records. In this project, an enterprise dataset (`performance_data.json`) containing employee identifiers, departmental affiliations, task completions, and quality ratings must be ingested and analyzed.

Rather than relying on database engines or high-level tabular libraries (like Pandas), this project implements an end-to-end **PerformanceTracker** class from first principles using pure Python, focusing on:
- Fast record retrieval by `employee_id`.
- Department-level grouping and census calculation.
- Workforce quality metrics (sum, average, and peak performer detection).
- Safe, validated record updates (ensuring task values strictly exceed zero).

---

## 🧠 Mental Model & Logical Breakdown

```text
┌─────────────────────────────────────────────────────────────┐
│                 PERFORMANCETRACKER PIPELINE                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ Ingest JSON List
                               ▼
            ┌──────────────────────────────────────┐
            │  performance_data: list[dict]        │
            │  [ {id, name, dept, tasks, score} ]  │
            └──────┬────────────────────────┬──────┘
                   │                        │
       Lookup & Grouping               Aggregations & Updates
                   │                        │
    ├── find_emp_by_id()         ├── total_emps_count()
    ├── find_emp_record_by_id()  ├── total_quality_scores()
    ├── find_emps_by_department()├── avg_quality_score_by_emps()
    └── print_count_of_departments()├── emp_highest_quality_score()
                                 └── update_task_value_by_id()
```

1. **Ingestion & Data Structure Invariants**:
   - The primary data source is loaded as a `list[dict[str, Any]]`.
   - The outer layer is an ordered sequence requiring positional index access or iteration.
   - The inner layer comprises key-value mappings requiring string key lookups.

2. **Lookup Strategies**:
   - **Linear Scan ($O(n)$)**: `find_emp_by_id` loops through the collection until the matching `employee_id` is found.
   - **Indexed Hash Map ($O(1)$ amortized lookup)**: `find_emp_record_by_id` constructs an in-memory dictionary comprehension indexed by `employee_id`, enabling instant retrieval via `.get()`.

3. **Unique Department Extraction & Grouping**:
   - Department values are extracted from each record and fed into a `set` comprehension to deduplicate keys without third-party tools.
   - Iterates through the deduplicated set to compute individual department tallies.

4. **Statistical Accumulation**:
   - Generator expressions feed values to `sum()` for memory-efficient score accumulation.
   - Average score combines total scores and total headcount with zero-division safeguards.
   - Peak performer identification uses `max()` equipped with a custom `key=lambda emp: emp["quality_score"]`.

5. **Safe Record Updating & Mutation Safety**:
   - Validates business rules (`new_task_value > 0`).
   - Employs shallow dictionary copying (`{**employee}`) to construct updated records safely without corrupting original state unintentionally.

---

## 📝 Pseudocode

```text
CLASS PerformanceTracker:

    CONSTRUCTOR(performance_data):
        SET self.performance_data = performance_data
    END CONSTRUCTOR

    METHOD find_emp_record_by_id(target_id):
        INITIALIZE fast_search_dict = {emp["employee_id"]: emp FOR emp IN performance_data}
        RETURN fast_search_dict.GET(target_id, EMPTY_DICT)
    END METHOD

    METHOD print_count_of_departments():
        EXTRACT unique_departments = SET(emp["department"] FOR emp IN performance_data)
        INITIALIZE department_counts = EMPTY LIST
        FOR EACH dept IN unique_departments:
            SET count = COUNT OF EMPLOYEES WHERE emp["department"] EQUALS dept
            APPEND (dept + " : " + count) TO department_counts
        RETURN department_counts
    END METHOD

    METHOD avg_quality_score_by_emps():
        IF total_emps_count() == 0:
            RETURN None
        RETURN total_quality_scores() / total_emps_count()
    END METHOD

    METHOD update_task_value_by_id(target_id, new_task_value):
        IF new_task_value <= 0:
            RAISE ValueError("Task value should be greater than zero")
        FOR EACH emp IN performance_data:
            IF emp["employee_id"] == target_id:
                CLONE emp AS updated_emp
                SET updated_emp["tasks_completed"] = new_task_value
                RETURN updated_emp
        RETURN "Employee Id Not Found"
    END METHOD
```

---

## 💻 Implementation Highlights

```python
# Department extraction using a set comprehension & modular counting
def print_count_of_departments(self):
    try:
        departments: list[dict[str, int]] = []
        unique_departments = set(emp["department"] for emp in self.performance_data)

        for department in unique_departments:
            total = self.count_of_departments(department)
            departments.append(f"{department} : {total}")
        return departments
    except Exception as e:
        return e

# Dictionary hash map lookup for instant employee retrieval
def find_emp_record_by_id(self, target_id: int):
    fast_search_dict = {
        employee["employee_id"]: dict(employee)
        for employee in self.performance_data
    }
    return fast_search_dict.get(target_id, {})

# Safe task update with defensive validation
def update_task_value_by_id(self, target_id: int, new_task_value: int):
    try:
        if new_task_value <= 0:
            raise ValueError("Task value should be greater than zero")
        for employee in self.performance_data:
            new_emp_record = {**employee}
            if new_emp_record["employee_id"] == target_id:
                new_emp_record["tasks_completed"] = new_task_value
                return new_emp_record
        return "Employee Id Not Found"
    except Exception as e:
        return e
```

---

## ⏱️ Complexity Analysis

| Operation | Method | Time Complexity | Space Complexity | Rationale |
| :--- | :--- | :---: | :---: | :--- |
| **Direct Search** | `find_emp_by_id()` | $O(n)$ | $O(1)$ | Scans records sequentially until match found. |
| **Indexed Search** | `find_emp_record_by_id()` | $O(n)$ build, $O(1)$ lookup | $O(n)$ | Builds hash map of $n$ records, instant key lookup. |
| **Dept Grouping** | `print_count_of_departments()`| $O(d \times n)$ | $O(d)$ | Iterates over $d$ unique departments through $n$ records. |
| **Total Headcount**| `total_emps_count()` | $O(n)$ | $O(1)$ | Traverses dataset with scalar accumulator. |
| **Quality Sum** | `total_quality_scores()` | $O(n)$ | $O(1)$ | Stream generator sum without auxiliary lists. |
| **Average Score** | `avg_quality_score_by_emps()` | $O(n)$ | $O(1)$ | Calls sum and count methods with zero-guard. |
| **Peak Performer** | `emp_highest_quality_score()` | $O(n)$ | $O(1)$ | Single pass comparative search via `max()`. |
| **Record Update** | `update_task_value_by_id()` | $O(n)$ | $O(1)$ | Linear scan to target record with shallow copy. |

---

## 🚀 How to Run

1. Navigate to the project directory:
   ```bash
   cd Project_2_Employee_Performance
   ```

2. Execute the entry point:
   ```bash
   python main.py
   ```

---

## 💡 Key Takeaways & Mental Models

1. **Containers vs. Key Access**:
   - `self.performance_data` is a **List** requiring integer indices or iteration.
   - `employee` inside the list is a **Dictionary** requiring key-based indexing (`employee["quality_score"]`).
   - Attempting `performance_data["quality_score"]` triggers `TypeError: list indices must be integers or slices, not str`.

2. **Hashable vs. Unhashable Types in Sets**:
   - Sets require elements to be hashable (immutable strings, integers, tuples).
   - Passing entire employee dictionaries into `set()` fails with `TypeError: cannot use 'dict' as a set element (unhashable type: 'dict')`.
   - Correct approach: Extract the string attribute `emp["department"]` into the set.

3. **Method Objects vs. Function Calls**:
   - Referencing methods without parentheses (`self.total_quality_scores / self.total_emps_count`) attempts arithmetic on function references, causing `TypeError: unsupported operand type(s) for /: 'method' and 'method'`.
   - Methods must be invoked with parentheses: `self.total_quality_scores() / self.total_emps_count()`.

4. **Defensive Invariant Validation**:
   - Methods that modify state should validate boundaries before execution (e.g., rejecting non-positive task numbers).
