/*
Copyright 2020, James J. Hayes

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

"use strict";

/* A placeholder for some generally useful utility functions. */
function QuilvynUtils() {
}

/* Returns a recursively-copied clone of #o#. */
QuilvynUtils.clone = function clone(o) {
  if(o == null || typeof o != 'object')
    return o;
  var result = new Object();
  for(var a in o) {
    result[a] = QuilvynUtils.clone(o[a]);
  }
  return result;
};

/* Returns true iff all attributes of #o1# have the same values in #o2#. */
QuilvynUtils.clones = function(o1, o2) {
  if(typeof o1 != 'object' || typeof o2 != 'object')
    return o1 == o2;
  var o1Keys = QuilvynUtils.getKeys(o1), o2Keys = QuilvynUtils.getKeys(o2);
  if(o1Keys.length != o2Keys.length)
    return false;
  for(var i = 0; i < o1Keys.length; i++) {
    var key = o1Keys[i];
    if(o2Keys[i] != key || !QuilvynUtils.clones(o1[key], o2[key]))
      return false;
  }
  return true;
};

/* Returns the first index of #element# in #array#, -1 if none. */
QuilvynUtils.findElement = function(array, element) {
  for(var i = 0; i < array.length; i++) {
    if(array[i] == element) {
      return i;
    }
  }
  return -1;
};

/* Returns the elements of #array# with any array elements expanded. */
QuilvynUtils.flatten = function(array, start, end) {
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
};

/*
 * Returns a sorted array containing keys from object #o#.  If #pattern# is not
 * null, only those keys that match it are returned.
 */
QuilvynUtils.getKeys = function(o, pattern) {
  var result = [];
  for(var a in o) {
    if(pattern == null || a.match(pattern) != null) {
      result[result.length] = a;
    }
  }
  result.sort();
  return result;
};

/*
 * Returns a sorted array containing all values from object #o#.  If #pattern#
 * is not null, only those values that match it are returned.
 */
QuilvynUtils.getValues = function(o, pattern) {
  var result = [];
  for(var a in o) {
    if(pattern == null || o[a].match(pattern) != null) {
      result[result.length] = o[a];
    }
  }
  result.sort();
  return result;
};

/* Returns a random integer in the range low .. high, inclusive. */
QuilvynUtils.random = function(low, hi) {
  return Math.floor(Math.random() * (hi - low + 1) + low);
};

/* Returns a random key of the object #o#. */
QuilvynUtils.randomKey = function(o) {
  var keys = QuilvynUtils.getKeys(o);
  return keys[QuilvynUtils.random(0, keys.length - 1)];
};

/* Returns #value# with a leading sign. */
QuilvynUtils.signed = function(value) {
  return (value >= 0 ? '+' : '') + value;
};

/* Returns the sum of all #attr# elements that match #pat#. */
QuilvynUtils.sumMatching = function(attrs, pat) {
  var result = 0;
  for(var a in attrs)
    if(a.search(pat) >= 0)
      result += attrs[a] - 0;
  return result;
};
