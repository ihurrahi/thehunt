#!/usr/bin/python
from flask import Flask, jsonify, request
from string import ascii_lowercase

app = Flask(__name__)

state = {}
STAGE_ONE_ANSWER = 'qwerty'

@app.route("/api/table/<number>")
def table_state(number):
  if number in state:
    level = state[number]
  else:
    level = 1
  print "Table %s is at level %s" % (number, level)
  return jsonify({ 'stage': level })

@app.route("/api/stage/<number>")
def stage(number):
  response = {'stage': number, 'message': 'incorrect'}
  if number == '1':
    table = request.args.get('table', '')
    if request.args.get('answer', '') == STAGE_ONE_ANSWER:
      response = {'stage': 2}
  else:
    print 'Unknown stage number %s' % number

  return jsonify(response)

@app.route("/api/stageOneCode")
def stageOneCode():
  table = int(request.args.get('table', ''))

  code = ''
  for char in STAGE_ONE_ANSWER:
    index = ascii_lowercase.find(char) + table
    code += ascii_lowercase[index]

  return jsonify({ 'code': code })
