# game_logic/mode_2_1.py

class Game2_1:
    def __init__(self):
        self.pending_check = None  # {'type': '>', 'value': 50}
        self.last_guess = None     # {'guess': 42}
        self.secret = None

    def set_secret(self, number):
        self.secret = number

    def handle_question(self, message):
        import re
        msg = message.lower()
        self.pending_check = None
        self.last_guess = None
        
        if m := re.search(r"(число\s*)?больше\s*(-?\d+)", msg):
            self.pending_check = {'type': '>', 'value': int(m.group(2))}
        elif m := re.search(r"(число\s*)?меньше\s*(-?\d+)", msg):
            self.pending_check = {'type': '<', 'value': int(m.group(2))}
        elif m := re.search(r"(это\s*число\s*|число\s*это\s*|равно\s*)?(-?\d+)", msg):
            self.last_guess = int(m.group(2))
        elif re.search(r"число\s*положительное", msg):
            self.pending_check = {'type': 'positive'}
        elif re.search(r"число\s*отрицательное", msg):
            self.pending_check = {'type': 'negative'}
        elif re.search(r"число\s*чётное|четное", msg):
            self.pending_check = {'type': 'even'}
        elif m := re.search(r"число\s*делится\s*на\s*(-?\d+)", msg):
            self.pending_check = {'type': 'divisible', 'value': int(m.group(1))}
        elif m := re.search(r"сумма\s*цифр\s*числа\s*(больше|меньше)\s*(-?\d+)", msg):
            if m.group(1) == "больше":
                self.pending_check = {'type': 'sum_gt', 'value': int(m.group(2))}
            else:
                self.pending_check = {'type': 'sum_lt', 'value': int(m.group(2))}
        elif re.search(r"число\s*является\s*степенью\s*другого\s*числа", msg):
            self.pending_check = {'type': 'is_power'}

    def apply_answer(self, answer):
        answer = answer.lower()
        if self.pending_check:
            t = self.pending_check.get('type')
            v = self.pending_check.get('value')
            
            if t == '>' and answer == 'да':
                return {'dim': list(range(-1000, v + 1))}
            elif t == '>' and answer == 'нет':
                return {'dim': list(range(v + 1, 1001))}
            elif t == '<' and answer == 'да':
                return {'dim': list(range(v, 1001))}
            elif t == '<' and answer == 'нет':
                return {'dim': list(range(-1000, v))}
            elif t == 'positive' and answer == 'да':
                return {'dim': list(range(-1000, 0))}
            elif t == 'positive' and answer == 'нет':
                return {'dim': list(range(0, 1001))}
            elif t == 'negative' and answer == 'да':
                return {'dim': list(range(0, 1001))}
            elif t == 'negative' and answer == 'нет':
                return {'dim': list(range(-1000, 0))}
            elif t == 'even' and answer == 'да':
                return {'dim': [n for n in range(-1000, 1001) if n % 2 != 0]}
            elif t == 'even' and answer == 'нет':
                return {'dim': [n for n in range(-1000, 1001) if n % 2 == 0]}
            elif t == 'divisible':
                if answer == 'да':
                    return {'dim': [n for n in range(-1000, 1001) if v == 0 or n % v != 0]}
                else:
                    return {'dim': [n for n in range(-1000, 1001) if v != 0 and n % v == 0]}
            elif t == 'sum_gt':
                def sum_digits(x):
                    return sum(int(d) for d in str(abs(x)))
                if answer == 'да':
                    return {'dim': [n for n in range(-1000, 1001) if sum_digits(n) <= v]}
                else:
                    return {'dim': [n for n in range(-1000, 1001) if sum_digits(n) > v]}
            elif t == 'sum_lt':
                def sum_digits(x):
                    return sum(int(d) for d in str(abs(x)))
                if answer == 'да':
                    return {'dim': [n for n in range(-1000, 1001) if sum_digits(n) >= v]}
                else:
                    return {'dim': [n for n in range(-1000, 1001) if sum_digits(n) < v]}
            elif t == 'is_power':
                def is_power_number(x):
                    if x in (0, 1): return True
                    for base in range(2, int(abs(x) ** 0.5) + 2):
                        power = base
                        while abs(power) < abs(x):
                            power *= base
                        if power == x:
                            return True
                    return False
                if answer == 'да':
                    return {'dim': [n for n in range(-1000, 1001) if not is_power_number(n)]}
                else:
                    return {'dim': [n for n in range(-1000, 1001) if is_power_number(n)]}
                    
        elif self.last_guess is not None:
            correct = self.last_guess == self.secret
            return {'guess': self.last_guess, 'correct': correct}
        return {}