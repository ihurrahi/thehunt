#!/usr/bin/python
from flask import Flask, jsonify, request
app = Flask(__name__)

state = {}

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
    answer = ''
    if request.args.get('answer', '') == answer:
      response = {'stage': 2}
  else:
    print 'Unknown stage number %s' % number

  return jsonify(response)
