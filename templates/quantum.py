# -*- coding: utf-8 -*-
"""Untitled1.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/16qwUey1VWJWLmw4Dl-sFJsH-1t1E-JZi
"""


from flask import Blueprint, request, jsonify
import qiskit
import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit import Aer, execute
from flask import Flask, render_template

quantum_route = Blueprint("quantum_route", __name__, template_folder='templates')

@quantum_route.route('/', methods=['GET','POST'])
def index():
  print("test function getQubit")
  
  if request.json is None:
    quibitID = -1
  else:
    quibitID = request.json['params']['cell']
  
  print("cell number from python:", quibitID) 
  return render_template('index.html')    

numQubits = 6
qc = QuantumCircuit(6,1)
superpositions = {}


#@quantum_route.route('/quantum')



def allocateQubit(index):
  qc.h(index)

def hadamard(index):
  qc.h(index)

def xGate(index):
  qc.x(index)

def zGate(index):
  qc.z(index)

def cnot(control,target):
  if control in superpositions or target in superpositions:
    print("error, can only entangle 2 qubits")
  else:
    qc.cnot(control,target)
    superpositions[control] = target
    superpositions[target] = control

def measure(index):

  qc.measure(index, 0)

  backend = Aer.get_backend('qasm_simulator')
  job = execute(qc,backend, shots=1024, memory=True)
  result = job.result()
  result_string = result.get_counts()
  print(result_string)

  if index in superpositions:
    superpositions.pop(superpositions[index])
    superpositions.pop(index)

  if not '1' in result_string:
    return 0
  
  if not '0' in result_string:
    return 1

  if result_string['0']>=result_string['1']:
    return 0
  else:
    qc.x(index)
    return 1

hadamard(3)
hadamard(4)
hadamard(4)
xGate(4)
xGate(3)
cnot(3,4)

print(measure(4))

