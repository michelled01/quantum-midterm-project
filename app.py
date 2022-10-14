#!/usr/bin/env python

import os
from numbers import Number
from flask import Flask, request, jsonify, abort, send_file, render_template

app = Flask(__name__, static_folder=os.environ.get('STATIC', "static"))

@app.route('/')
def index():
    return render_template('index.html');

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=os.environ.get('PORT', 3000), debug=True)
