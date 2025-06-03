# game_logic/mode_1_1.py
import json, re, string
import os
from flask import request  # Добавляем импорт request

# Определяем абсолютный путь к json (от корня проекта)
json_path = os.path.join('game_logic', 'questions_1_1.json')

with open(json_path, 'r', encoding='utf-8') as f:
    question_map = json.load(f)

def is_greater(x, secret_number): return secret_number > x
def is_less(x, secret_number): return secret_number < x
def is_equal(x, secret_number): return secret_number == x
def is_prime(x, secret_number):
    if secret_number < 2: return False
    for i in range(2, int(secret_number ** 0.5) + 1):
        if secret_number % i == 0: return False
    return True

question_functions = {
    "is_greater": is_greater,
    "is_less": is_less,
    "is_equal": is_equal,
    "is_prime": is_prime
}

def process_question(q):
    q = q.lower().translate(str.maketrans('', '', string.punctuation))
    
    # Получаем параметры из запроса
    secret_number = int(request.json.get("secret_number", 17))
    min_range = int(request.json.get("min_range", 1))
    max_range = int(request.json.get("max_range", 100))
    
    for keyword, func_name in question_map.items():
        if keyword in q:
            func = question_functions[func_name]
            if func_name == "is_prime":
                return "Да" if func(None, secret_number) else "Нет"
            nums = re.findall(r'\d+', q)
            if not nums: return "Пожалуйста, укажите число"
            num = int(nums[0])
            if num < min_range or num > max_range:
                return f"Число должно быть в диапазоне от {min_range} до {max_range}"
            return "Да" if func(num, secret_number) else "Нет"
    return "Неизвестный вопрос"