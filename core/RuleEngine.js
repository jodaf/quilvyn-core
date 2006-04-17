/* $Id: RuleEngine.js,v 1.11 2006/04/17 13:54:04 Jim Exp $ */

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


/*
 * The RuleEngine class applies a set of client-defined rules that generate a
 * set of attributes from an initial set.
 */
function RuleEngine() {
  this.sources = { };
  this.targets = { };
  this.seq = 0;
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
 * value if it is greater.  Minumum rules (type '^') raise the value of the
 * target to the #expr# value if it is less.  Prerequisite rules (type '?') set
 * the value of the target to null and suppress application of other rules if
 * #expr# is false.
 */
RuleEngine.prototype.AddRules =
  function(target, source, type, expr /*, source, type, expr ... */) {
  for(var i = 3; i < arguments.length; i += 3) {
    source = arguments[i - 2];
    type = arguments[i - 1];
    expr = arguments[i];
    if(source == null)
      source = '';
    if(expr != null && typeof(expr) != 'object')
      expr = new Function('source', 'return ' + expr + ';');
    if(this.sources[target] == null)
      this.sources[target] = { };
    if(this.targets[source] == null)
      this.targets[source] = { };
    this.sources[target][source] = this.targets[source][target] =
      {source:source, target: target, type: type, fn: expr, seq: this.seq++};
  }
};


/* Returns a sorted array containing all attributes that are rule sources. */
RuleEngine.prototype.AllSources = function() {
  var result = [];
  for(var attr in this.targets)
    result[result.length] = attr;
  result.sort();
  return result;
}

/* Returns a sorted array containing all attributes that are rule targets. */
RuleEngine.prototype.AllTargets = function() {
  var result = [];
  for(var attr in this.sources)
    result[result.length] = attr;
  result.sort();
  return result;
}

/*
 * Invokes the rules that are affected directly or indirectly by the attributes
 * in the object #initial#.  Returns an object that contains the attributes in
 * #initial# plus any computed attributes.
 */
RuleEngine.prototype.Apply = function(initial) {
  var computed = { };
  for(var a in initial)
    this._Recompute(initial, computed, a);
  /* Compute attributes that require no initial attribute value. */
  for(var a in this.targets['']) {
    if(computed[a] == null)
      this._Recompute(initial, computed, a);
  }
  return computed;
};


/* Removes the rule specifying how #source# affects #target#. */
RuleEngine.prototype.DeleteRule = function(target, source) {
  delete this.targets[source][target];
  delete this.sources[target][source];
};


/* Returns true iff the value of #attr# affects other attributes. */
RuleEngine.prototype.IsSource = function(attr) {
  return this.targets[attr] != null;
}


/* Returns true iff the value of #attr# is affected by other attributes. */
RuleEngine.prototype.IsTarget = function(attr) {
  return this.sources[attr] != null;
}


/*
 * A "private" function.  Invokes the rules that have #attr# as their target,
 * drawing the initial value for #attr# from #initial# and storing the computed
 * result in #computed#.  If the computed value changes, recursively recomputes
 * other attributes that #attr# affects.
 */
RuleEngine.prototype._Recompute = function(initial, computed, attr) {
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
      var amount = fn != null && (source == '' || sourceValue != null) ?
        fn(sourceValue) : sourceValue;
      if(type == '?') {
        if(!amount) {
          computedValue = null;
          break;
        }
      }
      else if(amount == null)
        continue;
      else if(type == '=') {
        // Apply default assignments only if no other has been applied.
        if(computedValue == null || source != '')
          computedValue = amount;
      }
      else if(assign && computedValue == null)
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
      if(addition != 0)
        computedValue = (computedValue - 0) + addition;
      if(multiplier != 1)
        computedValue *= multiplier;
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
        this._Recompute(initial, computed, target);
    }
  }
};
