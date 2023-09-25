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

/*
 * The Expr class implements an infix expression parser. The Expr function
 * parses an expression string which can afterward be evaluated by passing
 * a value dictionary to the eval method. In addition to the usual unary,
 * binary, and ternary operators, Expr supports the binary operators //
 * (integer division), >? (returns the greater operand), and <? (returns the
 * lesser operand), along with their corresponding assignment ops, as well
 * as pattern operators =~ and !~. The + operator performs string concatenation
 * for non-numeric values.
 */
function Expr(str) {

  var matchInfo;
  var operators = [];
  this.text = str;
  this.tokens = [];
  var unary = true;

  while ((matchInfo = str.match(Expr.TOKEN_PAT)) != null) {

    var token = matchInfo[2];
    str = str.substring(matchInfo[1].length);

    if (token == '(') {
      operators.unshift(token);
      unary = true;
    } else if (token == ')') {
      while (operators.length > 0 && (token = operators.shift()) != '(') {
        this.tokens.push(new Expr.Token(Expr.OPERATOR_TYPE, token));
      }
      unary = false;
    } else if (token == ':') {
      while (operators.length > 0 && (token = operators.shift()) != '?') {
        this.tokens.push(new Expr.Token(Expr.OPERATOR_TYPE, token));
      }
      operators.unshift('?');
      unary = true;
    } else if (Expr.OPERATOR_PRECEDENCE[token] != null) {
      if (unary) {
        token = 'u' + token;
      } else {
        var rightAssoc = token == '?' || token[token.length - 1] == '=';
        while (operators.length > 0) {
          if (Expr.OPERATOR_PRECEDENCE[operators[0]] < Expr.OPERATOR_PRECEDENCE[token] ||
              (rightAssoc && operators[0] == token)) {
            break;
          }
          this.tokens.push(new Expr.Token(Expr.OPERATOR_TYPE, operators.shift()));
        }
      }
      operators.unshift(token);
      unary = true;
    } else {
      var tipe = Expr.LITERAL_TYPE;
      if (token[0] == "'") {
        token = token.substring(1, token.length-1).replace(/\\'/g, "'");
      } else if (token[0] == '"') {
        token = token.substring(1, token.length-1).replace(/\\"/g, '"');
      } else if (token == "false" || token == "true") {
        token = token == "true";
      } else if (token == "null") {
        token = null;
      } else if (token.match(/^\d/)) {
        token = Number(token);
      } else {
        tipe = Expr.IDENTIFIER_TYPE;
      }
      this.tokens.push(new Expr.Token(tipe, token));
      unary = false;
    }

  }

  while (operators.length > 0) {
    this.tokens.push(new Expr.Token(Expr.OPERATOR_TYPE, operators.shift()));
  }

}

Expr.IDENTIFIER_TYPE = 0;
Expr.LITERAL_TYPE = 1;
Expr.OPERATOR_TYPE = 2;

Expr.OPERATOR_PRECEDENCE = {
  '(':-1,
  '?':0,
  '=':1, '<?=':1, '>?=':1, '+=':1, '-=':1, '*=':1, '/=':1, '//=':1,
  '&&':2, '||':2,
  '==':3, '!=':3, '<':3, '<=':3, '>':3, '>=':3, '<?':3, '>?':3, '=~':3, '!~':3,
  '+':5, '-':5,
  '*':7, '/':7, '//':7, '%':7,
  'u+':8, 'u-':8, '!':8, 'u!':8, '$':8, 'u$':8
};
Expr.TOKEN_PAT = new RegExp(
  '^(\\s*(' + /* leading whitespace */
  '\\d+(\\.\\d+)?|"(\\\\"|[^"])*"|\'(\\\\\'|[^\'])*\'|' + /* literals */
  '[\\w\\.]+|' + /* identifiers */
  '==|=~|' + /* equals, placed so first = won't be taken for assignment */
  '(<\\?|>\\?|\\+|-|\\*|/|//)?=|' + /* assign ops */
  '!=|!~|<\\?|<=|<|>\\?|>=|>|' + /* relops */
  '\\+|-|\\*|//|/|%|' + /* arith ops */
  '&&|\\|\\||' + /* conjunction */
  '\\?|:|' + /* ternary op */
  '!|' + /* negation */
  '\\$|' + /* convert to identifier */
  '\\(|\\)' + /* parens */
  '))'
);

Expr.Token = function(tipe, value) {
  this.tipe = tipe;
  this.value = value;
};
Expr.Token.prototype.toString = function() {
  return "{" + this.tipe + "," + this.value + "}";
};

Expr.prototype.eval = function(dict) {

  var stack = [];

  this.tokens.forEach(token => {

    if (token.tipe == Expr.OPERATOR_TYPE) {
      var op = token.value;
      if (op[0] == 'u') {
        var operand = stack.pop();
        var value = operand == null ? null :
                    operand.tipe == Expr.IDENTIFIER_TYPE ? dict[operand.value] :
                    operand.value;
        if (operand == null) {
          console.log('Operand missing in "' + this.text + '"');
          value = null;
        } else if (op == 'u!') {
          value = !value;
        } else if (op == 'u-') {
          value = -value;
        }
        stack.push({tipe: op == 'u$' ? Expr.IDENTIFIER_TYPE : Expr.LITERAL_TYPE, value: value});
      } else {
        var right = stack.pop();
        var left = stack.pop();
        var leftVal = left == null ? null :
                      left.tipe == Expr.IDENTIFIER_TYPE ? dict[left.value] :
                      left.value;
        var value = right == null ? null :
                    right.tipe == Expr.IDENTIFIER_TYPE ? dict[right.value] :
                    right.value;
        if (left == null || right == null) {
          console.log('Operand missing in "' + this.text + '"');
          value = null;
        } else if (op == '==') {
          value = leftVal == value;
        } else if (op == '!=') {
          value = leftVal != value;
        } else if (op == '=~') {
          value = (leftVal + '').match(new RegExp(value)) ? true : false;
        } else if (op == '!~') {
          value = (leftVal + '').match(new RegExp(value)) ? false : true;
        } else if (op == '&&') {
          value = leftVal ? value : leftVal;
        } else if (op == '||') {
          value = leftVal ? leftVal : value;
        } else if (op == '=') {
          dict[left.value] = value;
        } else if (op == '?') {
          var test = stack.pop();
          var testVal = test == null ? null :
                        test.tipe == Expr.IDENTIFIER_TYPE ? dict[test.value] :
                        test.value;
          if (test == null) {
            console.log('Operand missing in "' + this.text + '"');
            value = null;
          } else {
            value = testVal ? leftVal : value;
          }
        } else if (op == '<') {
          value = leftVal < value;
        } else if (op == '<=') {
          value = leftVal <= value;
        } else if (op == '>') {
          value = leftVal > value;
        } else if (op == '>=') {
          value = leftVal >= value;
        } else if (op == '<?') {
          value = leftVal < value ? leftVal : value;
        } else if (op == '>?') {
          value = leftVal > value ? leftVal : value;
        } else if (op == '+') {
          value = leftVal + value;
        } else if (op == '-') {
          value = leftVal - value;
        } else if (op == '*') {
          value = leftVal * value;
        } else if (op == '/') {
          value = leftVal / value;
        } else if (op == '//') {
          value = Math.floor(leftVal / value);
        } else if (op == '%') {
          value = leftVal % value;
        } else if (op[op.length-1] == '=') {
          if (op == '<?=') {
            value = leftVal < value ? leftVal : value;
          } else if (op == '>?=') {
            value = leftVal > value ? leftVal : value;
          } else if (op == '+=') {
            value = leftVal + value;
          } else if (op == '-=') {
            value = leftVal - value;
          } else if (op == '*=') {
            value = leftVal * value;
          } else if (op == '/=') {
            value = leftVal / value;
          } else if (op == '//=') {
            value = Math.floor(leftVal / value);
          }
          dict[left.value] = value;
        }
        stack.push({tipe: Expr.LITERAL_TYPE, value: value});
      }
    } else {
      stack.push(token);
    }

  });

  var result = stack.pop();
  return result.tipe == Expr.IDENTIFIER_TYPE ? dict[result.value] : result.value;

};

Expr.prototype.identifiers = function() {
  let result = [];
  for(let i = 0; i < this.tokens.length; i++) {
    let t = this.tokens[i];
    let next = this.tokens[i + 1];
    if(t.tipe == Expr.IDENTIFIER_TYPE ||
       (t.tipe == Expr.LITERAL_TYPE && next != null &&
        next.tipe == Expr.OPERATOR_TYPE && next.value == 'u$'))
      result.push(t.value);
  }
  return result;
};
