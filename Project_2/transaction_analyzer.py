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


class TransactionAnalyzer:

    def __init__(self, transactions):
        self.transactions = transactions

    def total_income(self, transactions_data: list[tuple[str, int]]):
        income = 0
        for _, amount in transactions_data:
            if amount > 0:
                income += amount
        return income

    def total_expenses(self, transactions_data: list[tuple[str, int]]):
        expenses = 0
        for _, amount in transactions_data:
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


trasaction_analyzer = TransactionAnalyzer(transactions)
print(trasaction_analyzer)
