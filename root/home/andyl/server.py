#!/usr/bin/python
from flask import Flask, jsonify, request
from string import ascii_lowercase

app = Flask(__name__)

# Table Number => Stage they are on
state = {}
ANSWERS = {
  1: 'diamond',
  2: 'icecream',
}

@app.route("/api/table/<int:number>")
def table_state(number):
  if number not in state:
    state[number] = 1
  level = state[number]
  print "Table %s is at level %s" % (number, level)
  return jsonify({ 'stage': level })

@app.route("/api/submit")
def submit():
  try:
    answer = request.args.get('answer', '').replace(' ', '')
    table = int(request.args.get('table', ''))
    stage = int(request.args.get('stage', ''))
  except ValueError:
    return jsonify({'message': 'An error occurred.'}), 404

  response = {'stage': stage, 'correct': False, 'message': 'incorrect'}
  if stage in ANSWERS and ANSWERS[stage] == answer:
    response = {'stage': stage + 1, 'correct': True}
    state[table] = max(state[table], stage + 1)

  return jsonify(response)

@app.route("/api/stageOneCode")
def stageOneCode():
  table = int(request.args.get('table', ''))

  code = ''
  for char in ANSWERS[1]:
    index = (ascii_lowercase.find(char) + table) % 26
    code += ascii_lowercase[index]

  return jsonify({ 'code': code })
