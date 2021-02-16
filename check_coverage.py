#!/bin/python3
from plumbum import local,FG
from plumbum.cmd import ls,yarn

import os
os.system('cls||clear')

packageFolder = "packages"

def run_coverage(name):
  with(local.cwd(local.cwd / packageFolder / name)):
    print(f"Running coverage for {name}")
    yarn["coverage"] & FG

for name in [name for name in ls(packageFolder).split("\n") if name !=""]:
  run_coverage(name)
