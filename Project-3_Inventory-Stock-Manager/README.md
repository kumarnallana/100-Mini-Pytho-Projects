# Project 03: Inventory Stock Manager

> **Tier 1: Foundations & Accumulator Logic**  
> *Core Focus: Relational Inventory Modeling, Threshold Filtering, Aggregated Valuation, and Safe Record Mutation.*

---

## 🎯 Problem Statement
Managing a retail or warehouse catalog involves tracking thousands of distinct Stock Keeping Units (SKUs). Businesses must continuously monitor stock levels to prevent supply chain stockouts, quantify overall capital tied up in inventory, analyze financial distribution across departments, and maintain accurate catalog records.

This project implements an end-to-end **`InventoryStockManager`** system from first principles using pure Python, providing:
- **Low-Stock Alerting**: Instant detection of products below a minimum quantity threshold.
- **Record Retrieval by ID**: Targeted lookups for specific products with input validation.
- **Valuation Analysis**: Granular computation of individual inventory valuations ($\text{Price} \times \text{Quantity}$), total warehouse worth, and department-level allocations.
- **Peak Inventory Identification**: Pinpointing highest-valuation assets in stock.
- **Validated State Mutations**: Safe updating of stock counts and atomic product removal with strict boundary checking.
- **CLI Executive Dashboard**: Clean Unicode table rendering for executive decision-making.

---

## 🧠 Mental Model & Logical Breakdown

```text
┌─────────────────────────────────────────────────────────────┐
│               INVENTORY STOCK MANAGER PIPELINE              │
└──────────────────────────────┬──────────────────────────────┘
                               │ Ingest products_data.json
                               ▼
            ┌──────────────────────────────────────┐
            │  products_db: list[dict]             │
            │  [ {id, name, cat, price, qty} ]     │
            └──────┬────────────────────────┬──────┘
                   │                        │
       Queries & Inspections           Mutations & Analytics
                   │                        │
    ├── find_product_by_id()     ├── update_quantity_by_id()
    ├── find_low_stock()         ├── remove_product()
    ├── products_value()         ├── inventory_summary()
    ├── highest_inventory()      └── CLI Table Dashboard
    └── inventory_values_by_category()
```

1. **Defensive Invariant Validation**:
   - Thresholds, product IDs, and stock counts must obey physical constraints ($> 0$ for IDs, $\ge 0$ for quantities).
   - Differentiates between *out-of-stock* items ($\text{quantity} = 0$, a valid state) and *corrupted records* (negative quantities/prices), preventing false exceptions.

2. **Categorical Accumulation**:
   - Aggregates financial value per category in a single linear pass ($O(n)$) using dictionary accumulator patterns (`category -> sum(price * quantity)`).

3. **Safe Mutations & Error Handling**:
   - `update_quantity_by_id`: Validates non-negative quantity inputs before creating updated record projections.
   - `remove_product`: Uses defensive ID validation, locates the record, and raises explicit `KeyError` if non-existent.

4. **Executive Dashboard Presentation**:
   - Computes dynamic column padding based on longest metric labels and values.
   - Formats large valuations with currency symbols and thousand-separators.

---

## 📝 Pseudocode

```text
CLASS InventoryStockManager:

    CONSTRUCTOR(products_db):
        SET self.products_db = products_db
    END CONSTRUCTOR

    METHOD find_low_stock(threshold):
        IF threshold <= 0:
            RAISE ValueError("Threshold must be positive")
        INITIALIZE low_stock_items = EMPTY LIST
        FOR EACH product IN products_db:
            IF product["quantity"] < threshold:
                APPEND product TO low_stock_items
        RETURN low_stock_items
    END METHOD

    METHOD inventory_values_by_category():
        INITIALIZE category_totals = EMPTY DICTIONARY
        FOR EACH product IN products_db:
            SET price = product["price"]
            SET qty = product["quantity"]
            SET val = price * qty
            IF product["category"] IN category_totals:
                category_totals[product["category"]] += val
            ELSE:
                category_totals[product["category"]] = val
        RETURN category_totals
    END METHOD

    METHOD highest_inventory():
        CALCULATE max_val = MAXIMUM OF (product["price"] * product["quantity"])
        RETURN ALL PRODUCTS WHERE (price * quantity) == max_val
    END METHOD
```

---

## 💻 Implementation Highlights

```python
# Categorical valuation aggregation (single-pass dictionary accumulator)
def inventory_values_by_category(self):
    new_products_dict: dict[str, int] = {}
    for product in self.products_db:
        price = product.get("price")
        category = product.get("category")
        quantity = product.get("quantity")

        if price >= 0 and quantity >= 0:
            total_inventory_value = price * quantity
        else:
            raise ValueError("Price and quantities values cannot be negative")

        new_products_dict[category] = new_products_dict.get(category, 0) + total_inventory_value
    return new_products_dict

# Highest inventory asset identification using max()
def highest_inventory(self):
    new_product_db = []
    for products in self.products_db:
        price = products.get("price")
        quantity = products.get("quantity")
        if price >= 0 and quantity >= 0:
            total_inventory_value = price * quantity
        else:
            raise ValueError("Price and quantities values cannot be negative")

        new_product_db.append({**products, "total_inventory": total_inventory_value})

    max_inventory = max(p["total_inventory"] for p in new_product_db)
    return [p for p in new_product_db if p["total_inventory"] == max_inventory]
```

---

## 📊 Sample Terminal Output

```text
┌────────────────────────────────────────────────────────┐
│           INVENTORY EXECUTIVE SUMMARY REPORT           │
├──────────────────────────────────────┬─────────────────┤
│ Metric                               │ Value           │
├──────────────────────────────────────┼─────────────────┤
│ Total Products In Catalog            │ 1,000           │
│ Total Warehouse Valuation            │ $146,857,690    │
│ Low-Stock Alerts (Qty < 10)          │ 29 items        │
│ Top Product (by Value)               │ Laptop 00794    │
│  └─ Product ID                       │ #1794           │
│  └─ Unit Price                       │ $104,400        │
│  └─ Stock on Hand                    │ 184 units       │
│  └─ Total Stock Value                │ $19,209,600     │
└──────────────────────────────────────┴─────────────────┘

┌────────────────────────────────────────────────────────┐
│            INVENTORY VALUATION BY CATEGORY             │
├──────────────────────────────────────┬─────────────────┤
│ Category                             │ Total Value ($) │
├──────────────────────────────────────┼─────────────────┤
│ Furniture                            │ $31,553,850     │
│ Electronics                          │ $26,591,420     │
│ Home Appliances                      │ $15,859,500     │
│ Office Supplies                      │ $12,622,610     │
│ Personal Care                        │ $10,008,210     │
│ Sports                               │ $8,738,065      │
│ Accessories                          │ $7,730,420      │
│ Kitchen                              │ $6,643,100      │
│ Books                                │ $3,872,430      │
│ Stationery                           │ $1,298,890      │
└──────────────────────────────────────┴─────────────────┘
```

---

## ⏱️ Complexity Analysis

| Operation | Method | Time Complexity | Space Complexity | Rationale |
| :--- | :--- | :---: | :---: | :--- |
| **Low-Stock Filter** | `find_low_stock()` | $O(n)$ | $O(k)$ | Single pass filtering $k$ items below threshold. |
| **ID Search** | `find_product_by_id()` | $O(n)$ | $O(1)$ | Linear scan until target ID located. |
| **Total Valuation** | `products_value()` | $O(n)$ | $O(1)$ | Accumulates running sum of (price $\times$ quantity). |
| **Category Sum** | `inventory_values_by_category()` | $O(n)$ | $O(c)$ | Hash table accumulation across $c$ categories. |
| **Max Asset Search** | `highest_inventory()` | $O(n)$ | $O(n)$ | Computes valuation map and finds maximum value. |
| **Stock Mutation** | `update_quantity_by_id()` | $O(n)$ | $O(1)$ | Scans to matching ID and mutates state. |
| **Product Removal** | `remove_product()` | $O(n)$ | $O(1)$ | Locates record and extracts for removal. |

---

## 🚀 How to Run

1. Navigate to the project directory:
   ```bash
   cd Project-3_Inventory-Stock-Manager
   ```

2. Execute the entry point:
   ```bash
   python main.py
   ```

---

## 💡 Key Takeaways & Mental Models

1. **Validating Real-World States (Zero vs Negative)**:
   - In stock systems, `quantity == 0` is a valid real-world business state (*out of stock*).
   - Raising exceptions on `quantity == 0` causes crashes on depleted items. Validation must target strictly negative values (`< 0`).

2. **Avoiding Premature Loop Returns**:
   - Indenting `return` at the loop level instead of inside the condition causes functions to terminate on iteration #1 (`UnboundLocalError`). Returns must reside inside the successful condition block.

3. **Terminal Dashboard UX**:
   - Transforming raw JSON blobs into structured box tables provides immediate clarity and professional engineering polish.
