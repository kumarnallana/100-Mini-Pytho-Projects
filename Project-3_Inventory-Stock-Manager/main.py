import json
from inventory_stock_manager import InventoryStockManager
from pprint import pprint


with open("products_data.json") as pd_file:
    products_data = json.load(pd_file)

if __name__ == "__main__":
try:
    inventory_stock_manager = InventoryStockManager(
        products_db=products_data)

    # FINDING LOW STOCK PRODUCTS
    # low_stock_products = inventory_stock_manager.find_low_stock(2)
    # pprint(low_stock_products, indent=4)

    # FIND PRODUCT BY id
    # products_by_id = inventory_stock_manager.find_product_by_id(10028)
    # pprint(products_by_id, indent=4)

    # ALL PRODUCTS INVENTORY OR PRICE VALUE
    # all_products_value = inventory_stock_manager.products_value()
    # pprint(all_products_value, indent=4)

    # # INVENTORY VALUES BY category
    # inventory_values = inventory_stock_manager.inventory_values_by_category()
    # pprint(inventory_values, indent=4)

    # UPDATE PRODUCTS QUANTITY THROUGH id
    # updated_quantity = inventory_stock_manager.update_quantity_by_id(
    #     10000001, 50)
    # pprint(updated_quantity, indent=4)

    # DELETE PRODUCT BY ID
    # deleted_product = inventory_stock_manager.remove_product(1007)
    # pprint(deleted_product, indent=4)

    # PRINT ALL POSSIBLE CONTENT SUMMARY
    # Total number of products
    # Total inventory value
    # Number of low-stock products
    # Highest inventory-value product
    # Total inventory value by category

    def inventory_summary(self, low_stock_threshold: int = 10):
        low_stock_products = self.find_low_stock(low_stock_threshold)

        summary = {
            "total_products": self.total_products(),
            "total_inventory_value": self.products_value(),
            "low_stock_count": len(low_stock_products),
            "highest_inventory_product": self.highest_inventory(),
            "inventory_value_by_category": self.inventory_values_by_category(),
        }

        return summary
except Exception as e:
    print(f"⚠️ Error Occured: {e}")
