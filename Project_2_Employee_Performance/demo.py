import json

with open("performance_data.json") as f:
    data = json.load(f)

count = 0
for employees in data:
    count += 1
    print(count)
