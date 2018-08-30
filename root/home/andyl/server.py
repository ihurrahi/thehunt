#!/usr/bin/python
from flask import Flask, jsonify, request
from random import choice
from string import ascii_lowercase
from uuid import uuid4

app = Flask(__name__)

# user_id => table number
user_to_table = {}
# user_id => stage they are on
game_state = {}
ANSWERS = {
  1: 'diamond',
  2: 'icecream',
  3: 'chanyoufeelthelauvtonight',
  4: 'honeymoon',
  5: 'bouquet',
  6: '0923',
  7: 'file_uploaded',
  8: 'toast',
  9: 'birthdays',
  10: '',
}
WRONG_ANSWER_RESPONSES = [
  'Not quite...',
  'Incorrect, try again!',
  'Sorry, that\'s not right',
]

num_tables = 23
visited_state = dict((table, False) for table in range(1, num_tables + 1))

@app.route('/api/admin/visit/<int:table>', methods=['POST'])
def edit_visit(table):
  visited_state[table] = request.args.get('visit', 'false') == 'true'
  return jsonify()

@app.route('/api/admin/visited')
def visited():
  v = sorted(visited_state.items())
  return jsonify(v)

@app.route('/api/admin/state')
def state():
  s = []
  for (user_id, stage) in game_state.items():
    s.append([user_to_table.get(user_id), user_id, stage])
  return jsonify(sorted(s))


@app.route('/api/game_state')
def get_game_state():
  user_id = request.cookies.get('user_id')
  table = user_to_table.get(user_id)

  if user_id in game_state:
    level = game_state[user_id]
    return jsonify({ 'stage': level, 'table': table })
  else:
    response = jsonify({ 'table': table })
    new_user_id = str(uuid4())
    game_state[new_user_id] = 0
    response.set_cookie('user_id', new_user_id)
    return response

# TODO: actually use POST data instead of request args
@app.route('/api/table', methods=['POST'])
def set_table():
  user_id = request.cookies.get('user_id')
  table = int(request.args.get('table', '')) 
  user_to_table[user_id] = table
  game_state[user_id] = 1
  return jsonify({ 'stage': 1 })

# TODO: actually use POST data instead of request args
@app.route('/api/submit', methods=['POST'])
def submit():
  try:
    user_id = request.cookies.get('user_id')
    stage = int(request.args.get('stage', ''))
    answer = request.args.get('answer', '').replace(' ', '').lower()
    if stage == 3:
      answer = answer.replace('#', '')
    if stage == 7:
      fname = "user_" + user_id + "_" + str(uuid4())
      with open(fname, "wb") as f:
        f.write(request.files.get('file').read())
      answer = 'file_uploaded'
  except ValueError:
    return jsonify({'message': 'An error occurred.'}), 404

  response = {'stage': stage, 'correct': False, 'message': choice(WRONG_ANSWER_RESPONSES)}
  if stage in ANSWERS and ANSWERS[stage] == answer:
    response = {'stage': stage + 1, 'correct': True}
    game_state[user_id] = max(game_state[user_id], stage + 1)

  return jsonify(response)

@app.route('/api/stageOneCode')
def stageOneCode():
  user_id = request.cookies.get('user_id')
  table = user_to_table.get(user_id)

  code = ''
  for char in ANSWERS[1]:
    index = (ascii_lowercase.find(char) + table) % 26
    code += ascii_lowercase[index]

  return jsonify({ 'code': code })

@app.route('/api/notification')
def notification():
  user_id = request.cookies.get('user_id')
  table = user_to_table.get(user_id)

  upcoming_table = False
  if table and table - 2 > 0 and visited_state[table - 2] and not visited_state[table]:
    upcoming_table = True
  return jsonify({ 'upcoming_table': upcoming_table })

