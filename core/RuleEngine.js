/* $Id: RuleEngine.js,v 1.5 2004/08/25 21:29:12 Jim Exp $ */

/*
Copyright 2004, James J. Hayes

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
    if(typeof(expr) == 'string')
      expr = new Function('source', 'return ' + expr + ';');
    if(this.sources[target] == null)
      this.sources[target] = { };
    if(this.targets[source] == null)
      this.targets[source] = { };
    this.sources[target][source] = this.targets[source][target] =
      {type: type, fn: expr};
  }
};


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


/* Returns true iff the value of #attribute# affects other attributes. */
RuleEngine.prototype.IsSource = function(attribute) {
  return this.targets[attribute] != null;
}


/* Returns true iff the value of #attribute# is affected by other attributes. */
RuleEngine.prototype.IsTarget = function(attribute) {
  return this.sources[attribute] != null;
}


/*
 * A "private" function.  Invokes the rules that have #attribute# as their
 * target, drawing the initial value for #attribute# from #initial# and storing
 * the computed result in #computed#.  If the computed value changes,
 * recursively recomputes other attributes that #attribute# affects.
 */
RuleEngine.prototype._Recompute = function(initial, computed, attribute) {

  var addition = 0;
  var max = null;
  var min = null;
  var multiplier = 1;
  var value = initial[attribute];

  var sources = this.sources[attribute];
  if(sources != null) {
    for(var source in sources) {
      var attr = computed[source];
      if(attr == null)
        attr = initial[source];
      if(typeof(attr) == 'string' && attr.length > 0 && !isNaN(attr - 0))
        attr -= 0; /* Convert string to number. */
      var fn = sources[source].fn;
      var type = sources[source].type;
      var amount = fn != null && (attr!=null || source=='') ? fn(attr) : attr;
      if(type == '?') {
        if(!amount) {
          value = null;
          break;
        }
      }
      else if(amount == null)
        continue;
      else if(type == '=')
        value = amount;
      else if(type == '+')
        addition += amount - 0;
      else if(type == '*')
        multiplier *= amount;
      else if(type == 'v' && (max == null || max > amount))
        max = amount;
      else if(type == '^' && (min == null || min < amount))
        min = amount;
    }
  }

  if(value != null) {
    if(addition != 0)
      value = (value - 0) + addition;
    if(multiplier != 1)
      value *= multiplier;
    if(max != null && value > max)
      value = max;
    if(min != null && value < min)
      value = min;
  }

  if(value != computed[attribute]) {
    if(value == null)
      delete computed[attribute];
    else
      computed[attribute] = value;
    if(this.targets[attribute] != null) {
      for(var target in this.targets[attribute])
        this._Recompute(initial, computed, target);
    }
  }

};
