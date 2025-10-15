/*
Copyright 2021, James J. Hayes

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

/*jshint esversion: 6 */
/* jshint forin: false */
"use strict";

/* A placeholder for some generally useful utility functions. */
function QuilvynUtils() {
}
QuilvynUtils.ATTR_VALUE_PAT =
//  '-quote+escs    "-quote+escs    \s or , delimited
   /'(?:\\'|[^'])*'|"(?:\\"|[^"])*"|[^'"\s][^\s,]*/.source;

/*
 * Checks the values of #table# to ensure that the syntax is valid and that
 * they contain settings only for names included in the array #validNames#.
 */
QuilvynUtils.checkAttrTable = function(table, validNames) {
  var result = true;
  var valuePat = new RegExp('^(?:' + QuilvynUtils.ATTR_VALUE_PAT + ')');
  var validNamesLowered = {};
  for(var i = 0; i < validNames.length; i++)
    validNamesLowered[validNames[i].toLowerCase()] = '';
  for(var key in table) {
    var messagePrefix = 'Table entry for "' + key + '": ';
    var attrs = table[key].trim();
    while(attrs != '') {
      var matchInfo = attrs.match(/^(\w+)=/);
      if(!matchInfo) {
        console.log(messagePrefix + 'No attr name found at start of string "' + attrs + '"');
        attrs = attrs.replace(/^\S*\s*/, '');
        result = false;
        continue;
      }
      if(!(matchInfo[1].toLowerCase() in validNamesLowered)) {
        console.log(messagePrefix + 'Invalid attr name "' + matchInfo[1] + '"');
        result = false;
      }
      attrs = attrs.substring(matchInfo[0].length);
      while(attrs.match(valuePat)) {
        attrs = attrs.replace(valuePat, '');
        if(!attrs.startsWith(','))
          break;
        attrs = attrs.substring(1);
      }
      attrs = attrs.replace(/^\s*/, '');
    }
  }
  return result;
};

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

/* Returns the contents of d in JavaScript literal form. */
QuilvynUtils.dictLit = function(d) {
  var result = [];
  for(var key in d) {
    result.push('"' + key + '":' + (typeof d[key] == "string" ? '"' + d[key] + '"' : d[key]));
  }
  return '{' + result.join(', ') + '}';
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

/* Returns the final value of attribute #name# within #attrs#. */
QuilvynUtils.getAttrValue = function(attrs, name) {
  return QuilvynUtils.getAttrValueArray(attrs, name).pop();
};

/*
 * Finds text in #attrs# with the format #name#=value[,value...] and returns
 * an array of the values. Values may be surrounded by quotes; otherwise, they
 * are separated by commas and the list of values terminated by a space.
 */
QuilvynUtils.getAttrValueArray = function(attrs, name) {
  var matchInfo;
  var pat = new RegExp('\\b' + name + '=(' + QuilvynUtils.ATTR_VALUE_PAT + ')(?:,(' + QuilvynUtils.ATTR_VALUE_PAT + '))*', 'gi');
  var result = [];
  if((matchInfo = attrs.match(pat))) {
    var values = matchInfo.pop().substring(name.length + 1);
    pat = new RegExp('(' + QuilvynUtils.ATTR_VALUE_PAT + '),?');
    while((matchInfo = values.match(pat))) {
      var value = matchInfo[1];
      if(value.startsWith("'"))
        result.push
          (value.substring(1, value.length-1).replaceAll("\\'", "'"));
      else if(value.startsWith('"'))
        result.push
          (value.substring(1, value.length-1).replaceAll('\\"', '"'));
      else if(value.match(/^[-+]?\d+$/))
        result.push(value * 1); // Convert to number
      else
        result.push(value);
      values = values.substring(matchInfo[0].length);
    }
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

/* Returns a random character from the string #s#. */
QuilvynUtils.randomChar = function(s) {
  return s.charAt(QuilvynUtils.random(0, s.length - 1));
};

/* Returns a random element from the array #list#. */
QuilvynUtils.randomElement = function(list) {
  return list.length>0 ? list[QuilvynUtils.random(0, list.length - 1)] : '';
}

/* Returns a random key of the object #o#. */
QuilvynUtils.randomKey = function(o) {
  var keys = QuilvynUtils.getKeys(o);
  return keys[QuilvynUtils.random(0, keys.length - 1)];
};

/*
 * Returns a random string built using the string #format# as a guide and the
 * contents of the object #components#. #format# contains literal text, which
 * is copied verbatim to the result, interspersed with references enclosed in
 * %{}. These references name keys of #components#, whose values are arrays of
 * strings, and each reference is replaced in the result with a random element
 * of the corresponding array. These replacements can also contain references,
 * which are replaced in turn. Occurrences of the special reference %{Syllable}
 * are each replaced by a randomly-generated syllable, and four elements of
 * #components#--leading, trailing, vowels, and clusters--specify arrays of
 * characters that are used to form random syllables.
 */
QuilvynUtils.randomString = function(format, components) {
  let leading = components.leading || 'bcdfghjklmnpqrstvwxyz'.split('');
  let trailing = components.trailing || 'bcdfgklmnprstxz'.split('');
  let vowels = components.vowels || 'aeoiu'.split('');
  let clusters = components.clusters || [
    // Some common English vowel digraphs ...
    'ai', 'au', 'aw', 'ay', 'ea', 'ee', 'ei', 'eu', 'ew', 'ie', 'oa', 'oi',
    'oo', 'ou', 'ow', 'oy', 'ue', 'ui',
    // ... consonant digraphs ...
    'Ch', 'Ph', 'Sh', 'Th', 'Wh',
    'ch', 'ck', 'lf', 'll', 'ng', 'ss', 'th',
    // .. and consonant blends
    'Bl', 'Br', 'Cl', 'Cr', 'Dr', 'Fl', 'Fr', 'Gl', 'Gr', 'Pl', 'Pr', 'Scr',
    'Sl', 'Sm', 'Sp', 'St', 'Str', 'Thr', 'Tr',
    'ct', 'lk', 'lm', 'ln', 'lp', 'lt', 'mp', 'nk', 'nt', 'rf', 'sk', 'sp', 'st'
  ];
  let matchInfo;
  while((matchInfo = format.match(/%\{(\w+)\}/))) {
    let ref = matchInfo[1];
    let replacement;
    if(components[ref])
      replacement = QuilvynUtils.randomElement(components[ref]);
    else if(ref == 'Syllable')
      replacement =
        QuilvynUtils.randomSyllable(leading, trailing, vowels, clusters);
    else
      replacement = '';
    format = format.replace(matchInfo[0], replacement);
  }
  return format;
};

/*
 * Returns a random syllable built from the parameters. #leading#, #trailing#,
 * and #vowels# are arrays that contain the consonants and vowels of the
 * language, and #clusters# is an array of valid multi-character clusters of
 * vowels and consonants. Within this latter array, an element that begins with
 * an upper-case consonant marks a run that can appear at the beginning of a
 * syllable, while one that begins with a lower-case consonant can appear at
 * the end.
 */
QuilvynUtils.randomSyllable = function(leading, trailing, vowels, clusters) {
  let lead =
    QuilvynUtils.random(0, 99) < 80 ?
      QuilvynUtils.randomElement(leading).toUpperCase() : '';
  if(lead != '' && QuilvynUtils.random(0, 99) < 15) {
    let leadClusters = clusters.filter(e => e.startsWith(lead));
    if(leadClusters.length > 0)
      lead = QuilvynUtils.randomElement(leadClusters);
  }
  if(lead == 'Q')
    lead += 'u';
  let vowel = QuilvynUtils.randomElement(vowels);
  if(QuilvynUtils.random(0, 99) < 15) {
    let vowelClusters = clusters.filter(e => e.startsWith(vowel));
    if(vowelClusters.length > 0)
      vowel = QuilvynUtils.randomElement(vowelClusters);
  }
  let trail =
    QuilvynUtils.random(0, 99) < 60 ? QuilvynUtils.randomElement(trailing) : '';
  if(trail != '' && QuilvynUtils.random(0, 99) < 15) {
    let trailClusters = clusters.filter(e => e.startsWith(trail));
    if(trailClusters.length > 0)
      trail = QuilvynUtils.randomElement(trailClusters);
  }
  return lead.toLowerCase() + vowel + trail;
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
