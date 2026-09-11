class TransactionAnalyzer:

    def __init__(self, transactions: list[tuple[str, int]]):
        self.transactions = transactions

    def total_amount_by_category(self, category_name: str):
        for category, amount in self.transactions:
            if category_name.lower() == category.lower():
                if amount > 0 and not isinstance(amount, str):
                    amount += amount
                return amount

    def total_income(self) -> int:
        income = 0
        for _, amount in self.transactions:
            if amount > 0:
                income += amount
        return income

    def total_expenses(self) -> int:
        expenses = 0
        for _, amount in self.transactions:
            if amount < 0:
                expenses += amount
        return expenses

    def __str__(self) -> str:
        try:
            balance = self.total_income(
                self.transactions) + self.total_expenses(self.transactions)
            return f"Total Balance = {balance}"
        except Exception as e:
            return f"Error Occured: {e}"

    def total_transaction_count(self) -> str:
        no_of_transactions: int = 0
        for _, amount in self.transactions:
            no_of_transactions += 1
        return no_of_transactions

        return f"Total Tranasactions is {no_of_transactions}"

    def group_by_category(self, category_name: str):
        total = []
        for category, amount in self.transactions:
            if category_name.lower() == category.lower():
                total.append(f"{category_name} : {amount}")
        return total

    def category_frequency(self, category_name: str):
        count: int = 0
        for category, _ in self.transactions:
            if category_name.lower() == category.lower():
                count += 1
        return count

    def print_by_transaction(self):
        unique_categories = set(category for category, _ in self.transactions)
        categories_list = []
        for category in unique_categories:
            total = self.category_frequency(category)
            categories_list.append(f"{category}: {total}")
        return categories_list

    def total_expenses_by_category(transactions, category_name: str,):
        total_amount = 0

        for category, amount in transactions:
            if amount < 0:
                if category_name == category:
                    total_amount += abs(amount)
        return total_amount

    def print_expenses(self):
        expenses_categories = {}

        for category, amount in self.transactions:
            if amount < 0:
                if category in expenses_categories:
                    expenses_categories[category] += abs(amount)
                else:
                    expenses_categories[category] = abs(amount)

        result = []
        for category, total in expenses_categories.items():
            result.append(f"{category}: {total}")
        return result


transactions = [
    ("Salary", 50000),
    ("Rent", -12000),
    ("Food", -2500),
    ("Travel", -1800),
    ("Food", -1200),
    ("Shopping", -4000),
    ("Travel", -900),
    ("Freelance", 15000),
    ("Utilities", -3200),
    ("Food", -1600),
]


transaction_analyzer = TransactionAnalyzer(transactions)

# print(transaction_analyzer.print_expenses())
print(transaction_analyzer.group_by_category())
