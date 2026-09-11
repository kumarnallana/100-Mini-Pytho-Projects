class InventoryStockManager:
    def __init__(self, products_db: list[dict[str: str | int]]):
        self.products_db = products_db

    def total_products(self):
        count: int = 0
        for products in self.products_db:
            for _ in products:
                count += 1
        return count

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

            if price >= 0 and quantity >= 0:
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

            max_inventory = max(
                product["total_inventory"]
                for product in new_product_db
            )

        highest_inventory_products = [
            product
            for product in new_product_db
            if product["total_inventory"] == max_inventory
        ]

        return highest_inventory_products

    def update_quantity_by_id(self, target_id: int, new_quantity: int):
        new_person_db: list[dict[str: str | int]] = []
        if new_quantity < 0:
            raise ValueError(
                f"{new_quantity} should not be negative value ")

        for products in self.products_db:
            if products["product_id"] == target_id:
                new_person_db.append({
                    **products,
                    "quantity": new_quantity
                })

                return new_person_db
            raise KeyError(
                f"There is no product_id:{target_id} in products database")

    def remove_product(self, target_id: int):
        if not isinstance(target_id, int):
            raise ValueError(f"{target_id} Should be a integer")
        elif target_id <= 0:
            raise ValueError(
                f"{target_id} should be a positive product ID"
            )

        for products in self.products_db:
            if products["product_id"] == target_id:
                deleted_product = {
                    **products
                }
                return deleted_product

        raise KeyError(
            f"There is no product_id:{target_id} in products database")

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
