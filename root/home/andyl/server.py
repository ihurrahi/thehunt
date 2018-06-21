#!/usr/bin/python
from flask import Flask, jsonify, request
from string import ascii_lowercase

app = Flask(__name__)

# Table Number => Stage they are on
game_state = {}
ANSWERS = {
  1: 'diamond',
  2: 'icecream',
}

num_tables = 27
visited_state = dict((table, False) for table in range(1, num_tables + 1))

@app.route("/api/admin/visit/<int:table>", methods=["POST"])
def edit_visit(table):
  visited_state[table] = request.args.get('visit', 'false') == 'true'
  return jsonify()

@app.route("/api/admin/visited")
def visited():
  v = sorted(visited_state.items())
  return jsonify(v)

@app.route("/api/admin/state")
def state():
  s = sorted(game_state.items())
  return jsonify(s)


@app.route("/api/table/<int:number>")
def table_state(number):
  if number not in game_state:
    game_state[number] = 1
  level = game_state[number]
  print "Table %s is at level %s" % (number, level)
  return jsonify({ 'stage': level })

@app.route("/api/submit", methods=["POST"])
def submit():
  try:
    answer = request.args.get('answer', '').replace(' ', '').lower()
    table = int(request.args.get('table', ''))
    stage = int(request.args.get('stage', ''))
  except ValueError:
    return jsonify({'message': 'An error occurred.'}), 404

  response = {'stage': stage, 'correct': False, 'message': 'incorrect'}
  if stage in ANSWERS and ANSWERS[stage] == answer:
    response = {'stage': stage + 1, 'correct': True}
    game_state[table] = max(game_state[table], stage + 1)

  return jsonify(response)

@app.route("/api/stageOneCode")
def stageOneCode():
  table = int(request.args.get('table', ''))

  code = ''
  for char in ANSWERS[1]:
    index = (ascii_lowercase.find(char) + table) % 26
    code += ascii_lowercase[index]

  return jsonify({ 'code': code })
