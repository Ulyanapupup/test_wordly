# game_logic/mode_2_2.py
class WordlyGame:
    def __init__(self):
        self.players = {}
        self.words = {}
        self.guesses = []
        self.current_turn = 0
        self.game_over = False

    def add_player(self, player_id):
        if player_id not in self.players:
            self.players[player_id] = len(self.players)

    def submit_word(self, player_id, word):
        self.words[player_id] = word.lower()
        return len(self.words) == 2

    def make_guess(self, player_id, guess):
        opponent_id = [pid for pid in self.players if pid != player_id][0]
        guessed_word = guess.lower()
        opponent_word = self.words.get(opponent_id, "")
        
        if guessed_word == opponent_word:
            self.game_over = True
            return {'winner': player_id, 'words': self.words}
        
        return {'guess': guessed_word, 'opponent_id': opponent_id}

    def evaluate_guess(self, evaluation):
        if not self.game_over:
            self.current_turn = (self.current_turn + 1) % 2
            return {'next_turn': list(self.players.keys())[self.current_turn]}
        return None