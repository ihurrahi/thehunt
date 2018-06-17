#!/usr/bin/python
from flask import Flask, jsonify, request
from string import ascii_lowercase

app = Flask(__name__)

# Table Number => Stage they are on
state = {}
ANSWERS = [
  [1, 'diamond'],
  [2, 'icecream'],
]

@app.route("/api/table/<int:number>")
def table_state(number):
  if number in state:
    level = state[number]
  else:
    level = 1
  print "Table %s is at level %s" % (number, level)
  return jsonify({ 'stage': level })

@app.route("/api/stage/<int:number>")
def stage(number):
  response = {'stage': number, 'correct': False, 'message': 'incorrect'}
  answer = request.args.get('answer', '').replace(' ', '')
  table = int(request.args.get('table', ''))
  if [number, answer] in ANSWERS:
    response = {'stage': number + 1, 'correct': True}
    state[table] = max(state[table], number + 1)

  return jsonify(response)

@app.route("/api/stageOneCode")
def stageOneCode():
  table = int(request.args.get('table', ''))

  code = ''
  for char in STAGE_ONE_ANSWER:
    index = (ascii_lowercase.find(char) + table) % 26
    code += ascii_lowercase[index]

  return jsonify({ 'code': code })
