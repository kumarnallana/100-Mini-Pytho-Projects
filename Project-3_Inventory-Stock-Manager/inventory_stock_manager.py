class InventoryStockManager:
    def __init__(self, products_db: list[dict[str: str | int]]):
        self.products_db = products_db

    def find_low_stock(self, threshold: int):
        if threshold <= 0:
            raise ValueError(
                "Entered threshold value should not be zero or negative")

        products_storage: list[dict[str: str | int]] = []

        for products in self.products_db:
            if products["quantity"] < threshold:
                products_storage.append(products)
        return products_storage

    def find_product_by_id(self, target_id: int):
        if target_id <= 0:
            raise ValueError("Entered taget id should not be zero or negative")
        products_storage: list[dict[str: str | int]] = []

        for products in self.products_db:
            if products["product_id"] == target_id:
                products_storage.append(products)
        return products_storage

    def products_value(self):

        product_value: int = 0

        for products in self.products_db:

            if products["price"] <= 0 and products["quantity"] <= 0:
                raise ValueError("Products Value either zero or negative")

            product_value += products.get("price") * products.get("quantity")

        return f"For all products total product value is: {product_value}$"

    def inventory_values_by_category(self):
        new_products_dict: dict[str: int] = {}

        for product in self.products_db:
            price = product.get("price")
            category = product.get("category")
            quantity = product.get("quantity")

            if price > 0 and quantity > 0:
                total_inventory_value = price * quantity
            else:
                raise ValueError(
                    "Price and quantities Values either zero or negative")

            if category in new_products_dict:
                new_products_dict[category] += total_inventory_value
            else:
                new_products_dict[category] = total_inventory_value
        return new_products_dict

    def highest_inventory(self):
        new_product_db: list[dict[str: str | int]] = []
        for products in self.products_db:
            price = products.get("price")
            quantity = products.get("quantity")

            if price >= 0 and quantity >= 0:
                total_inventory_value = price * quantity
            else:
                raise ValueError(
                    "Price and quantities Values either zero or negative")

            new_product_db.append({
                **products,
                "total_inventory": total_inventory_value
            })

        highest_inventory_value = max(
            new_product_db,
            key=lambda product: product["total_inventory"]
        )
        return highest_inventory_value
