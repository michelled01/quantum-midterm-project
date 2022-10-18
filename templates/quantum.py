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
from qiskit.quantum_info import partial_trace, Statevector
from qiskit import Aer, execute
from matplotlib import pyplot as plt
from flask import Flask, render_template

quantum_route = Blueprint("quantum_route", __name__, template_folder='templates')

@quantum_route.route('/', methods=['GET','POST'])
def homepage():
  return render_template('start.html')    

@quantum_route.route('/index', methods=['GET','POST'])
def index():  
  q = QuantumRegister(6)
  c = ClassicalRegister(6)
  qc = QuantumCircuit(q,c)
  qc.draw(output="mpl")
  plt.savefig("static/images/circuit.png")
  return render_template('index.html')  

numQubits = 6
q = QuantumRegister(6)
c = ClassicalRegister(6)
qc = QuantumCircuit(q,c)
superpositions = {}
use = [0,0,0,0,0,0]


@quantum_route.route('/initializeQubit', methods=['GET','POST'])
def start():

  ind = -1
  if not request.json is None:
    ind = request.json['params']['qubitIndex']
    if(use[ind]==0):
      qc.h(ind)
    use[ind] = 1
    qc.draw(output="mpl")
    plt.savefig("static/images/circuit.png")

  return "qubit initialized "+str(ind)

@quantum_route.route('/measureQubit', methods=['GET','POST'])
def measure():
  ind = -1
  if not request.json is None:
    ind = request.json['params']['qubitIndex']
    res = measure(ind)

    qc.draw(output="mpl")
    plt.savefig("static/images/circuit.png")

    return res

  return "no measurement"

@quantum_route.route('/applyGate', methods=['GET','POST'])
def applyGate():
  ind = -1
  if not request.json is None:
    ind = request.json['params']['qubitIndex']
    gateID = request.json['params']['gateID']

    if(gateID==0):
      qc.x(ind)
    elif(gateID==1):
      qc.z(ind)
    elif(gateID==2):
      qc.h(ind)
    
    qc.draw(output="mpl")
    plt.savefig("static/images/circuit.png")
    return "applied gate"

  return "no input"

@quantum_route.route('/cnot', methods=['GET','POST'])
def cnot():
  if not request.json is None:

    control = request.json['params']['controlIndex']
    target = request.json['params']['targetIndex']

    cnot(control,target) #custom method (see below)
    
    qc.draw(output="mpl")
    plt.savefig("static/images/circuit.png")
    return "applied cnot gate"

  return "no input"

#@quantum_route.route('/quantumReturn', methods=['GET','POST'])
#def value():
  #print("cell number from python:", quibitID)
  #return "qubit received"


def cnot(control,target):
  if control in superpositions or target in superpositions:
    print("error, can only entangle 2 qubits")
  else:
    qc.cnot(control,target)
    superpositions[control] = target
    superpositions[target] = control

def measure(index):

  val = {}

  qc.measure(q[index], c[index])

  backend = Aer.get_backend('qasm_simulator')
  job = execute(qc,backend, shots=1024, memory=True)
  result = job.result()
  result_string = result.get_counts()
  print(result_string)

  other_string = ""
  super = -1

  if index in superpositions:
    super = superpositions[index]
    qc.measure(q[super], c[super])

    backend = Aer.get_backend('qasm_simulator')
    job = execute(qc,backend, shots=1024, memory=True)
    result = job.result()
    other_string = result.get_counts()
    print(other_string)

    #superpositions.pop(superpositions[index])
    #superpositions.pop(index)

  if(super==-1):
    zero = 0
    one = 1
    for str in result_string.keys():
      if(str[5-index]=="0"):
        zero += result_string[str]
      elif(str[5-index]=="1"):
        one += result_string[str]
    if(zero>one):
      val[index] = 0
    else:
      val[index] = 1
    return val

  states = [0,0,0,0]
  for str in other_string.keys():
    if(str[5-index]+str[5-super]=="00"):
      states[0] += other_string[str]
    elif(str[5-index]+str[5-super]=="01"):
      states[1] += other_string[str]
    elif(str[5-index]+str[5-super]=="10"):
      states[2] += other_string[str]
    elif(str[5-index]+str[5-super]=="11"):
      states[3] += other_string[str]

  max = -1
  maxInd = -1
  for i in range(4):
    if(states[i]>max):
      maxInd = i
      max = states[i]
  
  if(maxInd==0):
    val[index] = 0
    val[super] = 0
  elif(maxInd==1):
    val[index] = 0
    val[super] = 1
  if(maxInd==2):
    val[index] = 1
    val[super] = 0
  elif(maxInd==3):
    val[index] = 1
    val[super] = 1

  return val

