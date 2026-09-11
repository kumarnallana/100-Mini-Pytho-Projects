import json
from inventory_stock_manager import InventoryStockManager
from pprint import pprint


with open("products_data.json") as pd_file:
    products_data = json.load(pd_file)

if __name__ == "__main__":
    try:
        inventory_stock_manager = InventoryStockManager(
            products_db=products_data)
        low_stock_products = inventory_stock_manager.find_low_stock(2)
        pprint(low_stock_products, indent=4)
    except Exception as e:
        print(f"⚠️ Error Occured: {e}")
