#!/usr/bin/python
import re
import sys

writing = False
for line in sys.stdin:
  if writing:
    sys.stdout.write(line)
  if line.startswith('};'):
    writing = False
  elif line.startswith('var attributes'):
    writing = True
    sys.stdout.write(line)
