# game_logic/mode_1_1.py
import json, re, string
import os
import math
from flask import request

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
def is_positive(x, secret_number): return secret_number > 0
def is_divisible(x, secret_number): return x != 0 and secret_number % x == 0
def is_even(x, secret_number): return secret_number % 2 == 0
def is_single_digit(x, secret_number): return -10 < secret_number < 10
def is_double_digit(x, secret_number): return (-100 < secret_number <= -10) or (10 <= secret_number < 100)
def is_power(x, secret_number):
    if secret_number == 0: return False
    if x == 0: return False
    if secret_number == 1: return True
    n = abs(secret_number)
    for i in range(2, int(math.sqrt(n)) + 1):
        p = i
        while p <= n:
            p *= i
            if p == n: return True
    return False
def is_absolute_power(x, secret_number):
    n = abs(secret_number)
    if n == 0: return False
    if n == 1: return True
    for i in range(2, int(math.sqrt(n)) + 1):
        p = i
        while p <= n:
            p *= i
            if p == n: return True
    return False
def sum_of_digits_greater(x, secret_number):
    n = abs(secret_number)
    sum_digits = sum(int(d) for d in str(n))
    return sum_digits > x

question_functions = {
    "is_greater": is_greater,
    "is_less": is_less,
    "is_equal": is_equal,
    "is_prime": is_prime,
    "is_positive": is_positive,
    "is_divisible": is_divisible,
    "is_even": is_even,
    "is_single_digit": is_single_digit,
    "is_double_digit": is_double_digit,
    "is_power": is_power,
    "is_absolute_power": is_absolute_power,
    "sum_of_digits_greater": sum_of_digits_greater
}

def process_question(q):
    q = q.lower().translate(str.maketrans('', '', string.punctuation))
    
    # Получаем параметры из запроса
    secret_number = int(request.json.get("secret_number", 17))
    min_range = -100  # Фиксированный диапазон
    max_range = 100   # Фиксированный диапазон
    
    for keyword, func_name in question_map.items():
        if keyword in q:
            func = question_functions[func_name]
            if func_name in ["is_prime", "is_positive", "is_even", "is_single_digit", "is_double_digit", "is_power", "is_absolute_power"]:
                return "Да" if func(None, secret_number) else "Нет"
            nums = re.findall(r'\d+', q)
            if not nums and func_name not in ["is_positive", "is_even", "is_single_digit", "is_double_digit", "is_power", "is_absolute_power"]:
                return "Пожалуйста, укажите число"
            num = int(nums[0]) if nums else 0
            if num < min_range or num > max_range:
                return f"Число должно быть в диапазоне от {min_range} до {max_range}"
            return "Да" if func(num, secret_number) else "Нет"
    return "Неизвестный вопрос"