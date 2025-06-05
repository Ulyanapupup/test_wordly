# game_logic/mode_2_1.py

class Game2_1:
    def __init__(self):
        self.pending_check = None  # {'type': '>', 'value': 50}
        self.last_guess = None     # {'guess': 42}
        self.secret = None
        self.min_range = 0
        self.max_range = 1000

    def set_secret(self, number):
        self.secret = number

    def handle_question(self, message):
        import re
        msg = message.lower()
        self.pending_check = None
        self.last_guess = None
        
        # Обрабатываем только разрешенные типы вопросов
        if m := re.search(r"(число\s*)?больше\s*(\d+)", msg):
            self.pending_check = {'type': '>', 'value': int(m.group(2))}
        elif m := re.search(r"(число\s*)?меньше\s*(\d+)", msg):
            self.pending_check = {'type': '<', 'value': int(m.group(2))}
        elif m := re.search(r"(это\s*число\s*|число\s*это\s*|равно\s*)?(\d+)", msg):
            self.last_guess = int(m.group(2))
        elif re.search(r"число\s*является\s*степенью\s*другого\s*числа", msg):
            self.pending_check = {'type': 'is_power'}
        else:
            # Для других вопросов не устанавливаем pending_check
            return False
            
        return True

    def apply_answer(self, answer):
        answer = answer.lower()
        if self.pending_check:
            t = self.pending_check.get('type')
            v = self.pending_check.get('value')
            
            if t == '>' and answer == 'да':
                return {'dim': list(range(self.min_range, v + 1))}
            elif t == '>' and answer == 'нет':
                return {'dim': list(range(v + 1, self.max_range + 1))}
            elif t == '<' and answer == 'да':
                return {'dim': list(range(v, self.max_range + 1))}
            elif t == '<' and answer == 'нет':
                return {'dim': list(range(self.min_range, v))}
            elif t == 'is_power':
                def is_power_number(x):
                    if x in (0, 1): return True
                    for base in range(2, int(x ** 0.5) + 2):
                        power = base
                        while power < x:
                            power *= base
                        if power == x:
                            return True
                    return False
                if answer == 'да':
                    return {'dim': [n for n in range(self.min_range, self.max_range + 1) if not is_power_number(n)]}
                else:
                    return {'dim': [n for n in range(self.min_range, self.max_range + 1) if is_power_number(n)]}
                    
        elif self.last_guess is not None:
            correct = self.last_guess == self.secret
            return {'guess': self.last_guess, 'correct': correct}
        return {}