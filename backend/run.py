#!/usr/bin/env python

from backend import app

if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=8888)
    # app.run(host='172.31.42.103', port=8000)
