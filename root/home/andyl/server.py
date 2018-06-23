#!/usr/bin/python
from flask import Flask, jsonify, request
from string import ascii_lowercase

app = Flask(__name__)

# Table Number => Stage they are on
game_state = {}
ANSWERS = {
  1: 'diamond',
  2: 'icecream',
  3: 'chanigetsomelauvtonight',
  4: '',
  5: '',
  6: '',
  7: '',
  8: '',
  9: '',
  10: '',
}

num_tables = 27
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
  s = sorted(game_state.items())
  return jsonify(s)


@app.route('/api/table/<int:table>')
def table_state(table):
  if table not in game_state:
    game_state[table] = 1
  level = game_state[table]
  return jsonify({ 'stage': level })

@app.route('/api/submit', methods=['POST'])
def submit():
  try:
    table = int(request.args.get('table', ''))
    stage = int(request.args.get('stage', ''))
    answer = request.args.get('answer', '').replace(' ', '').lower()
    if stage == 3:
      answer = answer.replace('#', '')
  except ValueError:
    return jsonify({'message': 'An error occurred.'}), 404

  response = {'stage': stage, 'correct': False, 'message': 'incorrect'}
  if stage in ANSWERS and ANSWERS[stage] == answer:
    response = {'stage': stage + 1, 'correct': True}
    game_state[table] = max(game_state[table], stage + 1)

  return jsonify(response)

@app.route('/api/stageOneCode')
def stageOneCode():
  table = int(request.args.get('table', ''))

  code = ''
  for char in ANSWERS[1]:
    index = (ascii_lowercase.find(char) + table) % 26
    code += ascii_lowercase[index]

  return jsonify({ 'code': code })

@app.route('/api/notification/<int:table>')
def notification(table):
  upcoming_table = False
  if table - 2 > 0 and visited_state[table - 2] and not visited_state[table]:
    upcoming_table = True
  return jsonify({ 'upcoming_table': upcoming_table })

