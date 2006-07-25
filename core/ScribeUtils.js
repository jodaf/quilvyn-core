/* $Id: ScribeUtils.js,v 1.2 2006/07/25 20:43:02 Jim Exp $ */

/*
Copyright 2005, James J. Hayes

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation; either version 2 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 59 Temple
Place, Suite 330, Boston, MA 02111-1307 USA.
*/

/* A placeholder for some generally useful utility functions. */
function ScribeUtils() {
}

/* Returns a sorted array containing all keys from object #o#. */
ScribeUtils.GetKeys = function(o) {
  var result = [];
  for(var a in o) {
    result[result.length] = a;
  }
  result.sort();
  return result;
}

/* Returns a sorted array containing all values from object #o#. */
ScribeUtils.GetValues = function(o) {
  var result = [];
  for(var a in o) {
    result[result.length] = o[a];
  }
  result.sort();
  return result;
}

/* Returns a random integer in the range low .. high, inclusive. */
ScribeUtils.Random = function(low, hi) {
  return Math.floor(Math.random() * (hi - low + 1) + low);
};

/* Returns a random key of the object #o#. */
ScribeUtils.RandomKey = function(o) {
  var keys = ScribeUtils.GetKeys(o);
  return keys[ScribeUtils.Random(0, keys.length - 1)];
}
