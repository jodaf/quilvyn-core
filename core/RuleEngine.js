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
/* globals QuilvynUtils */
"use strict";

/*
 * The RuleEngine class applies a set of client-defined rules that generate a
 * set of attributes from an initial set.
 */
function RuleEngine() {
  this.sources = { };
  this.targets = { };
  this.seq = 0;
  this.patterns = [ ];
  this.needToExpandPattern = false;
}

/*
 * Adds a rule to the RuleSet.  #target# is the attribute affected by the rule,
 * and each #source# an attribute whose value affects #target#.  The latter may
 * be null, indicating a rule with no source attribute, e.g., a rule that sets
 * an initial or default value that other rules modify.  #expr# is an
 * expression that computes the value used to modify #target#.  In most cases
 * this will be a string containing a JavaScript expression; within this
 * expression the variable 'source' can be used to reference the current value
 * of the source attribute.  For complex rules, #expr# can be a function that
 * takes the value of the source attribute as its sole parameter.  A null
 * #expr# is assumed to return the current value of the source attribute.  Six
 * types of rules are supported.  Assignment rules (type '=') set the target to
 * the #expr# value.  Addition rules (type '+') add the #expr# value to the
 * target.  Multiplication rules (type '*') multiply the target by the #expr#
 * value.  Maximum rules (type 'v') lower the value of the target to the #expr#
 * value if it is greater.  Minimum rules (type '^') raise the value of the
 * target to the #expr# value if it is less.  Prerequisite rules (type '?') set
 * the value of the target to null and suppress application of other rules if
 * #expr# is false.
 */
RuleEngine.prototype.addRules =
  function(target, source, type, expr /*, source, type, expr ... */) {
  // Reset the member variables the first time addRules is called.  This
  // supports inheritance, since the reset variables will be placed in the
  // inheriting object, rather than the RuleEngine used in the class prototype.
  // (Since addRules is the only method that modifies the member variables,
  // it's the only one that needs to include this code.)
  if(this.seq == 0) {
    this.sources = { };
    this.targets = { };
    this.seq = 0;
    this.patterns = [ ];
    this.needToExpandPatterns = false;
  }
  for(var i = 3; i < arguments.length; i += 3) {
    source = arguments[i - 2];
    type = arguments[i - 1];
    expr = arguments[i];
    if(source == null)
      source = '';
    if(expr != null && typeof(expr) != 'object' && typeof(expr) != 'function')
      expr = new Function('source,dict', 'return ' + expr + ';');
    if(typeof source != 'string' || typeof target != 'string') {
      this.patterns[this.patterns.length] =
        {source:source, target:target, type:type, fn:expr, seq:0};
      continue;
    }
    if(this.sources[target] == null)
      this.sources[target] = { };
    if(this.targets[source] == null)
      this.targets[source] = { };
    this.sources[target][source] = this.targets[source][target] =
      {source:source, target:target, type:type, fn:expr, seq:this.seq++};
  }
  this.needToExpandPatterns = true;
};

/* Returns a sorted array containing all attributes that are rule sources. */
RuleEngine.prototype.allSources = function(target) {
  var result = [];
  for(var attr in this.targets)
    if(target == null || this.targets[attr][target] != null)
      result[result.length] = attr;
  result.sort();
  return result;
};

/* Returns a sorted array containing all attributes that are rule targets. */
RuleEngine.prototype.allTargets = function(source) {
  var result = [];
  for(var attr in this.sources)
    if(source == null || this.sources[attr][source] != null)
      result[result.length] = attr;
  result.sort();
  return result;
};

/*
 * Invokes the rules that are affected directly or indirectly by the attributes
 * in the object #initial#.  Returns an object that contains the attributes in
 * #initial# plus any computed attributes.
 */
RuleEngine.prototype.applyRules = function(initial) {
  var computed = { };
  var allAttrs = QuilvynUtils.getKeys(initial);
  if(this.needToExpandPatterns) {
    allAttrs = allAttrs.concat(this.allTargets()).concat(this.allSources());
  }
  for(var i = 0; i < this.patterns.length; i++) {
    var sources = { };
    var targets = { };
    var source = this.patterns[i].source;
    var target = this.patterns[i].target;
    if(typeof source == 'string') {
      sources[source] = '';
    } else {
      for(var j = 0; j < allAttrs.length; j++) {
        if(allAttrs[j].match(source))
          sources[allAttrs[j]] = '';
      }
    }
    if(typeof target == 'string') {
      targets[target] = '';
    } else {
      for(var j = 0; j < allAttrs.length; j++) {
        if(allAttrs[j].match(target))
          targets[allAttrs[j]] = '';
      }
    }
    for(var a in sources) {
      for(var b in targets) {
        this.addRules(b, a, this.patterns[i].type, this.patterns[i].fn);
      }
    }
  }
  this.needToExpandPatterns = false;
  for(var a in initial)
    this._recompute(initial, computed, a);
  /* Compute attributes that require no initial attribute value. */
  for(var a in this.targets['']) {
    if(computed[a] == null)
      this._recompute(initial, computed, a);
  }
  return computed;
};

/* Removes the rule specifying how #source# affects #target#. */
RuleEngine.prototype.deleteRule = function(target, source) {
  delete this.targets[source][target];
  delete this.sources[target][source];
};

/* Returns an array of sources that affect #target#. */
RuleEngine.prototype.getSources = function(target) {
  return this.sources[target];
};

/* Returns an array of targets that #source# affects. */
RuleEngine.prototype.getTargets = function(source) {
  return this.targets[source];
};

/* Returns true iff the value of #attr# affects other attributes. */
RuleEngine.prototype.isSource = function(attr) {
  return this.targets[attr] != null;
};

/* Returns true iff the value of #attr# is affected by other attributes. */
RuleEngine.prototype.isTarget = function(attr) {
  return this.sources[attr] != null;
};

/* A debugging function that returns an HTML representation of the rules. */
RuleEngine.prototype.toHtml = function() {
  var result = '';
  var sources = QuilvynUtils.getKeys(this.sources);
  for(var i = 0; i < sources.length; i++) {
    var a = sources[i];
    result += '<b>' + a + '</b>\n';
    for(var b in this.sources[a]) {
      var source = this.sources[a][b];
      var fnText = (source.fn + '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      result += ' "' + b + '" "' + source.type + '" "' + fnText + '"\n';
    }
  }
  return result;
};

/*
 * A "private" function.  Invokes the rules that have #attr# as their target,
 * drawing the initial value for #attr# from #initial# and storing the computed
 * result in #computed#.  If the computed value changes, recursively recomputes
 * other attributes that #attr# affects.
 */
RuleEngine.prototype._recompute = function(initial, computed, attr) {
  var computedValue = initial[attr];
  if(this.sources[attr] != null) {
    var addition = 0;
    var max = null;
    var min = null;
    var multiplier = 1;
    var sources = [];
    for(var a in this.sources[attr])
      sources[sources.length] = this.sources[attr][a];
    var sortfn = function(a, b) {return a.seq - b.seq;};
    sources.sort(sortfn);
    for(var i = 0; i < sources.length; i++) {
      var assign = false;
      var fn = sources[i].fn;
      var source = sources[i].source;
      var sourceValue =
        computed[source] != null ? computed[source] : initial[source];
      var type = sources[i].type;
      if(type.substring(1, 2) == '=') {
        assign = true;
        type = type.substring(0, 1);
      }
      if(typeof(sourceValue) == 'string' &&
         sourceValue != '' &&
         !isNaN(sourceValue - 0))
        sourceValue -= 0; /* Convert string to number. */
      var amount = fn != null &&
                   (type == '?' || source == '' || sourceValue != null) ?
        fn(sourceValue, computed) : sourceValue;
      if(type == '?') {
        if(!amount) {
          computedValue = null;
          break;
        }
      } else if(amount == null)
        continue;
      else if(type == '=') {
        // Apply default assignments only if no other has been applied.
        if(computedValue == null || source != '')
          computedValue = amount;
      } else if(assign && computedValue == null)
        computedValue = amount;
      else if(type == '+')
        addition += amount - 0;
      else if(type == '*')
        multiplier *= amount;
      else if(type == 'v' && (max == null || max > amount))
        max = amount;
      else if(type == '^' && (min == null || min < amount))
        min = amount;
    }
    if(computedValue != null) {
      if(multiplier != 1)
        computedValue *= multiplier;
      if(addition != 0)
        computedValue = (computedValue - 0) + addition;
      if(max != null && computedValue > max)
        computedValue = max;
      if(min != null && computedValue < min)
        computedValue = min;
    }
  }
  if(computedValue != computed[attr]) {
    if(computedValue == null)
      delete computed[attr];
    else
      computed[attr] = computedValue;
    if(this.targets[attr] != null) {
      for(var target in this.targets[attr])
        this._recompute(initial, computed, target);
    }
  }
};
