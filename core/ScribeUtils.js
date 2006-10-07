/* $Id: ScribeUtils.js,v 1.5 2006/10/07 21:26:27 Jim Exp $ */

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

/* Returns a recursively-copied clone of #o#. */
ScribeUtils.clone = function clone(o) {
  if(typeof o != 'object' || o == null)
    return o;
  var result = new Object();
  for(var a in o) {
    result[a] = ScribeUtils.clone(o[a]);
  }
  return result;
};

/* Returns true iff all attributes of #o1# have the same values in #o2#. */
ScribeUtils.clones = function(o1, o2) {
  if(typeof o1 != "object" || typeof o2 != "object")
    return o1 == o2;
  var o1Keys = ScribeUtils.getKeys(o1), o2Keys = ScribeUtils.getKeys(o2);
  if(o1Keys.length != o2Keys.length)
    return false;
  for(var i = 0; i < o1Keys.length; i++) {
    var key = o1Keys[i];
    if(o2Keys[i] != key || !ScribeUtils.clones(o1[key], o2[key]))
      return false;
  }
  return true;
};

/* Returns the elements of #array# with any array elements expanded. */
ScribeUtils.flatten = function(array, start, end) {
  if(start == null) {
    start = 0;
  }
  if(end == null) {
    end = array.length;
  }
  var result = [];
  for(var i = start; i < end; i++) {
    result = result.concat(array[i]);
  }
  return result;
}

/*
 * Returns a sorted array containing keys from object #o#.  If #pattern# is not
 * null, only those keys that match it are returned.
 */
ScribeUtils.getKeys = function(o, pattern) {
  var result = [];
  for(var a in o) {
    if(pattern == null || a.match(pattern) != null) {
      result[result.length] = a;
    }
  }
  result.sort();
  return result;
}

/*
 * Returns a sorted array containing all values from object #o#.  If #pattern#
 * is not null, only those values that match it are returned.
 */
ScribeUtils.getValues = function(o, pattern) {
  var result = [];
  for(var a in o) {
    if(pattern == null || o[a].match(pattern) != null) {
      result[result.length] = o[a];
    }
  }
  result.sort();
  return result;
}

/* Returns a random integer in the range low .. high, inclusive. */
ScribeUtils.random = function(low, hi) {
  return Math.floor(Math.random() * (hi - low + 1) + low);
};

/* Returns a random key of the object #o#. */
ScribeUtils.randomKey = function(o) {
  var keys = ScribeUtils.getKeys(o);
  return keys[ScribeUtils.random(0, keys.length - 1)];
}

/* Returns #value# with a leading sign. */
ScribeUtils.signed = function(value) {
  return (value >= 0 ? '+' : '') + value;
};
