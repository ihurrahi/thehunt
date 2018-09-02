. thinkingalaud/bin/activate
pid=`ps aux | grep "python -m flask" | grep -v grep | awk '{print $2}'`
echo "killing PID ${pid}"
kill ${pid}
FLASK_APP=server.py nohup python -m flask run &
