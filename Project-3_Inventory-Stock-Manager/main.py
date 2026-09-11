import json
import re
from inventory_stock_manager import InventoryStockManager


def print_box_table(title: str, headers: list[str], rows: list[tuple[str, str]], align_col2: str = "right") -> None:
    """Renders a clean Unicode box-drawing table in the terminal."""
    col1_w = max(len(headers[0]), max((len(str(r[0])) for r in rows), default=10)) + 4
    col2_w = max(len(headers[1]), max((len(str(r[1])) for r in rows), default=10)) + 4
    total_w = col1_w + col2_w + 1

    print(f"┌{'─' * total_w}┐")
    print(f"│{title.center(total_w)}│")
    print(f"├{'─' * col1_w}┬{'─' * col2_w}┤")
    print(f"│ {headers[0].ljust(col1_w - 1)}│ {headers[1].ljust(col2_w - 1)}│")
    print(f"├{'─' * col1_w}┼{'─' * col2_w}┤")
    for col1, col2 in rows:
        val2 = str(col2).rjust(col2_w - 2) if align_col2 == "right" else str(col2).ljust(col2_w - 2)
        print(f"│ {str(col1).ljust(col1_w - 1)}│ {val2} │")
    print(f"└{'─' * col1_w}┴{'─' * col2_w}┘")


def display_inventory_dashboard(summary: dict, total_records: int) -> None:
    """Formats and prints executive inventory metrics and category breakdown tables."""
    # 1. Extract total valuation cleanly
    raw_val = summary.get("total_inventory_value", "")
    digits = re.findall(r"\d+", str(raw_val))
    total_val_num = int("".join(digits)) if digits else 0

    # 2. Extract highest-inventory product details
    top_prod = summary.get("highest_inventory_product", [])
    top_item = (
        top_prod[0]
        if isinstance(top_prod, list) and top_prod
        else (top_prod if isinstance(top_prod, dict) else {})
    )

    top_name = top_item.get("product_name", "N/A")
    top_id = f"#{top_item.get('product_id', 'N/A')}"
    top_price = f"${top_item.get('price', 0):,}"
    top_qty = f"{top_item.get('quantity', 0):,} units"
    top_val = f"${top_item.get('total_inventory', 0):,}"

    summary_rows = [
        ("Total Products In Catalog", f"{total_records:,}"),
        ("Total Warehouse Valuation", f"${total_val_num:,}"),
        ("Low-Stock Alerts (Qty < 10)", f"{summary.get('low_stock_count', 0):,} items"),
        ("Top Product (by Value)", f"{top_name}"),
        (" └─ Product ID", f"{top_id}"),
        (" └─ Unit Price", f"{top_price}"),
        (" └─ Stock on Hand", f"{top_qty}"),
        (" └─ Total Stock Value", f"{top_val}"),
    ]

    print()
    print_box_table("INVENTORY EXECUTIVE SUMMARY REPORT", ["Metric", "Value"], summary_rows)

    # 3. Category Breakdown Table
    cat_data = summary.get("inventory_value_by_category", {})
    sorted_cats = sorted(cat_data.items(), key=lambda x: x[1], reverse=True)
    cat_rows = [(cat, f"${val:,}") for cat, val in sorted_cats]

    print()
    print_box_table("INVENTORY VALUATION BY CATEGORY", ["Category", "Total Value ($)"], cat_rows)
    print()


with open("products_data.json") as pd_file:
    products_data = json.load(pd_file)

if __name__ == "__main__":
    try:
        inventory_stock_manager = InventoryStockManager(products_db=products_data)

        # Generate complete summary and present in a clean CLI table representation
        summary = inventory_stock_manager.inventory_summary(10)
        display_inventory_dashboard(summary, len(products_data))

    except Exception as e:
        print(f"⚠️ Error Occured: {e}")
