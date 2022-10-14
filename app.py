#!/usr/bin/env python
import os
from flask import Flask, render_template
from templates.quantum import quantum_route

app = Flask(__name__)
app.register_blueprint(quantum_route)

#@app.route('/')
#def index():
#   return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)