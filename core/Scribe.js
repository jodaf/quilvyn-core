"use strict";

var COPYRIGHT = 'Copyright 2015 James J. Hayes';
var VERSION = '1.1.0';
var ABOUT_TEXT =
'Scribe Character Editor version ' + VERSION + '\n' +
'The Scribe Character Editor is ' + COPYRIGHT + '\n' +
'This program is free software; you can redistribute it and/or modify it ' +
'under the terms of the GNU General Public License as published by the Free ' +
'Software Foundation; either version 2 of the License, or (at your option) ' +
'any later version.\n' +
'This program is distributed in the hope that it will be useful, but WITHOUT ' +
'ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or ' +
'FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for ' +
'more details.\n' +
'You should have received a copy of the GNU General Public License along ' +
'with this program; if not, write to the Free Software Foundation, Inc., 59 ' +
'Temple Place, Suite 330, Boston, MA 02111-1307 USA. ' +
'Click <a href="core/gpl.txt">here</a> to see it.\n' +
'System Reference Document material is Open Game Content released by Wizards ' +
'of the Coast under the Open Gaming License.  You should have received a ' +
'copy of the Open Gaming License with this program; if not, you can obtain ' +
'one from http://www.wizards.com/d20/files/OGLv1.0a.rtf. Click ' +
'<a href="srd35/ogl.txt">here</a> to see the license.\n' +
'Thanks to my dungeon crew, especially Rich Hakesley and Norm Jacobson, for ' +
'patient testing of Scribe and for suggestions that greatly improved it.';

var FEATURES_OF_EDIT_WINDOW =
  'height=750,width=500,menubar,resizable,scrollbars';
var FEATURES_OF_SHEET_WINDOW =
  'height=750,width=750,menubar,resizable,scrollbars,toolbar';
var FEATURES_OF_OTHER_WINDOWS =
  'height=750,width=750,menubar,resizable,scrollbars,toolbar';
var PERSISTENT_CHARACTER_PREFIX = 'ScribeCharacter.';
var PERSISTENT_INFO_PREFIX = 'ScribeInfo.';
var TIMEOUT_DELAY = 1000; // One second

var character = {};     // Displayed character attrs
var characterCache = {};// Attrs of all displayed characters, indexed by path
var characterPath = ''; // Path to most-recently opened/generated character
var characterPopup = null; // Current character message popup window
var editForm;           // Character editing form (editWindow.document.forms[0])
var editWindow = null;  // Window where editor is shown
var persistentInfo = {  // What we store in persistent data
  computed: '0',        // Show computed attrs for debugging
  hidden: '0',          // Show information marked "hidden" on sheet?
  italics: '1'          // Show italicized notes on sheet?
};
var ruleSet = null;     // The rule set currently in use
var ruleSets = {};      // Registered rule sets, indexed by name
var scribeTab = null;   // Menu/sheet tab, if requested
var sheetWindow = null; // Window where character sheet is shown

// Hack to support crippled IE/Edge testing
var storage = localStorage || {
  'getItem':function(name) { return window.storage[name]; },
  'removeItem':function(name) { delete window.storage[name]; },
  'setItem':function(name,value) { window.storage[name] = value; }
};

/* Launch routine called after all Scribe scripts are loaded. */
function Scribe() {

  if(InputGetValue == null || ObjectViewer == null || RuleEngine == null ||
     ScribeRules == null || ScribeUtils == null) {
    alert('JavaScript modules needed by Scribe are missing; exiting');
    return;
  }

  var defaults = {
    'BACKGROUND':'wheat',
    'DEFAULT_SHEET_STYLE':'Standard',
    'MENU_WIDTH_PERCENT':30,
    'WARN_ABOUT_DISCARD':true
  };

  for(var a in defaults) {
    if(window[a] == null)
      window[a] = defaults[a];
  }
  try {
    window.MENU_WIDTH_PERCENT = Math.floor(Number(window.MENU_WIDTH_PERCENT));
    if(window.MENU_WIDTH_PERCENT < 10 || window.MENU_WIDHT_PERCENT > 90)
      window.MENU_WIDTH_PERCENT = 0;
  } catch(err) {
    window.MENU_WIDTH_PERCENT = 0;
  }


  for(var a in persistentInfo) {
    if(storage.getItem(PERSISTENT_INFO_PREFIX + a) != null) {
      persistentInfo[a] = storage.getItem(PERSISTENT_INFO_PREFIX + a);
    }
  }

  if(CustomizeScribe != null)
    CustomizeScribe();

  if(window.MENU_WIDTH_PERCENT > 0) {
    var sheetWidthPercent = 99 - window.MENU_WIDTH_PERCENT;
    scribeTab = window.open('', 'ScribeCombined');
    scribeTab.document.write(
      '<html>\n' +
      '<head>\n' +
      '  <title>Scribe</title>\n' +
      '  <style>\n' +
      '    .edit {\n' +
      '      float: left;\n' +
      '      width: ' + window.MENU_WIDTH_PERCENT + '%;\n' +
      '      height: 90%;\n' +
      '    }\n' +
      '    .sheet {\n' +
      '      float: left;\n' +
      '      width: ' + sheetWidthPercent + '%;\n' +
      '      height: 90%;\n' +
      '    }\n' +
      '  </style>\n' +
      '</head>\n' +
      '<body>\n' +
      '  <iframe class="edit"></iframe>\n' +
      '  <iframe class="sheet"></iframe>\n' +
      '</body>\n' +
      '</html>\n'
    );
    scribeTab.document.close();
  }

  Scribe.randomizeCharacter(false);

}

/* Adds #rs# to Scribe's list of supported rule sets. */
Scribe.addRuleSet = function(rs) {
  // Add a rule for handling hidden information
  rs.defineRule('hiddenNotes', 'hidden', '?', null);
  ruleSets[rs.getName()] = rs;
  ruleSet = rs;
};

/* Interacts w/user to delete a character from persistent storage. */
Scribe.deleteCharacter = function() {
  var prompt = 'Enter character to delete:';
  for(var path in storage) {
    if(path.indexOf(PERSISTENT_CHARACTER_PREFIX) == 0)
      prompt += "\n" + path.substring(PERSISTENT_CHARACTER_PREFIX.length);
  }
  var path = editWindow.prompt(prompt, '');
  if(path == null)
    // User cancel
    return;
  if(storage.getItem(PERSISTENT_CHARACTER_PREFIX + path) == null) {
    editWindow.alert("No such character " + path);
    return;
  }
  storage.removeItem(PERSISTENT_CHARACTER_PREFIX + path);
  Scribe.refreshEditor(false);
}

/* Returns HTML for the character editor form. */
Scribe.editorHtml = function() {
  var scribeElements = [
    ['about', ' ', 'button', ['About']],
    ['help', '', 'button', ['Help']],
    ['rules', 'Rules', 'select-one', []],
    ['ruleAttributes', '', 'button', ['Attributes']],
    ['ruleRules', '', 'button', ['Rules']],
    ['ruleNotes', '', 'button', ['Notes']],
    ['character', 'Character', 'select-one', []],
    ['summary', '', 'button', ['Summary']],
    ['view', '', 'button', ['View Html']],
    ['italics', 'Show', 'checkbox', ['Italic Notes']],
    ['hidden', '', 'checkbox', ['Hidden Info']],
    ['computed', '', 'checkbox', ['Computed Attrs']],
    ['viewer', 'Sheet Style', 'select-one', []],
    ['randomize', 'Randomize', 'select-one', 'random']
  ];
  var elements = scribeElements.concat(ruleSet.getEditorElements());
  var htmlBits = ['<form name="frm"><table>'];
  for(var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var label = element[1];
    var name = element[0];
    var params = element[3];
    var type = element[2];
    if(typeof(params) == 'string') {
      if(ruleSet.getChoices(params) == null)
        continue;
      params = ScribeUtils.getKeys(ruleSet.getChoices(params));
      if(name == 'randomize')
        params = ['---choose one---'].concat(params);
    }
    if(label != '' || i == 0) {
      if(i > 0) {
        htmlBits[htmlBits.length] = '</td></tr>';
      }
      htmlBits[htmlBits.length] = '<tr><th>' + label + '</th><td>';
    }
    if(type.match(/^f?(bag|set)$/)) {
      var widget = type.match(/bag/) ? InputHtml(name, 'text', [3]) :
                                   InputHtml(name, 'checkbox', null);
      htmlBits[htmlBits.length] =
        '  ' +
        InputHtml(name + '_sel', 'select-one', params) +
        widget +
        InputHtml(name + '_clear', 'button', ['Clear All']) +
        (type.charAt(0)=='f' ? InputHtml(name + '_filter', 'text', [15]) : '');
    } else {
      htmlBits[htmlBits.length] = '  ' + InputHtml(name, type, params);
    }
  }
  htmlBits = htmlBits.concat(['</td></tr>', '</table></form>']);
  var result = htmlBits.join('\n');
  return result;
};

/*
 * Interacts w/user to replace the current character with new one taken from an
 * external source.
 */
Scribe.importCharacter = function() {

  if(characterPopup == null) {
    // Nothing presently pending
    var htmlBits = [
      '<html><head><title>Import Character</title></head>',
      '<body bgcolor="' + BACKGROUND + '">',
      '<img src="' + LOGO_URL + ' "/><br/>',
      '<h2>Enter attribute definition from character sheet source</h2>',
      '<form name="frm"><table>',
      '<tr><td><textarea name="code" rows="5" cols="50"></textarea></td></tr>',
      '</table></form>',
      '<form>',
      '<input type="button" value="Ok" onclick="okay=true;"/>',
      '<input type="button" value="Cancel" onclick="window.close();"/>',
      '</form></body></html>'
    ];
    var html = htmlBits.join('\n') + '\n';
    characterPopup = window.open('', '__import', FEATURES_OF_OTHER_WINDOWS);
    characterPopup.document.write(html);
    characterPopup.document.close();
    characterPopup.okay = false;
    setTimeout('Scribe.importCharacter()', TIMEOUT_DELAY);
    return;
  } else if(characterPopup.closed) {
    // User cancel
    characterPopup = null;
    return;
  } else if(characterPopup.name != '__import') {
    // Some other character manipulation pending
    return;
  } else if(!characterPopup.okay) {
    // Try again later
    setTimeout('Scribe.importCharacter()', TIMEOUT_DELAY);
    return;
  }

  // Ready to import
  var text = characterPopup.document.frm.elements[0].value;
  var index = text.indexOf('{');
  if(index < 0) {
    characterPopup.alert("Syntax error: missing {");
    characterPopup.okay = false;
    setTimeout('Scribe.importCharacter()', TIMEOUT_DELAY);
    return;
  }
  text = text.substring(index + 1);
  var attrPat = /^\s*"((?:\\"|[^"])*)"\s*:\s*(\d+|"((?:\\"|[^"])*)"|\{)/;
  var matchInfo;
  var nesting = '';
  var importedCharacter = {};
  while((matchInfo = text.match(attrPat)) != null) {
    text = text.substring(matchInfo[0].length);
    var attr = matchInfo[1];
    var value = matchInfo[3] || matchInfo[2];
    value = value.replace(/\\"/g, '"').replace(/\\n/g, '\n');
    if(value == '{') {
      nesting += attr + '.';
    } else {
      importedCharacter[nesting + attr] = value;
    }
    while(nesting != '' && (matchInfo = text.match(/^\s*\}/)) != null) {
      text = text.substring(matchInfo[0].length);
      nesting = nesting.replace(/[^\.]*\.$/, '');
    }
    if((matchInfo = text.match(/^\s*,/)) != null) {
      text = text.substring(matchInfo[0].length);
    }
  }
  if(!text.match(/^\s*\}/)) {
    characterPopup.alert("Syntax error: missing } at '" + text + "'");
    characterPopup.okay = false;
    setTimeout('Scribe.importCharacter()', TIMEOUT_DELAY);
    return;
  }
  character = importedCharacter;
  characterPath = '';
  characterCache[characterPath] = {}; // Query wrt saving before opening another
  Scribe.refreshEditor(false);
  Scribe.refreshSheet();
  characterPopup.close();
  characterPopup = null;

};

/* Loads character specified by #path# from persistent storage. */
Scribe.openCharacter = function(path) {
  character = {};
  var attrs = storage.getItem(PERSISTENT_CHARACTER_PREFIX + path).split('\t');
  for(var i = 0; i < attrs.length; i++) {
    var pieces = attrs[i].split('=');
    if(pieces.length == 2)
      character[pieces[0]] = pieces[1];
  }
  characterPath = path;
  characterCache[characterPath] = ScribeUtils.clone(character);
  Scribe.refreshEditor(false);
  Scribe.refreshSheet();
}

/*
 * Replaces the current character with one that has all randomized attributes.
 * If #prompt# is true, allows the user to specify certain attributes.
 */
Scribe.randomizeCharacter = function(prompt) {

  if(!prompt) {
    ; // empty -- no popup needed
  } else if(characterPopup == null) {
    // Nothing presently pending
    var presets = ruleSet.getChoices('preset');
    if(presets == null) {
      return Scribe.randomizeCharacter(false);
    }
    var htmlBits = [
      '<html><head><title>New Character</title></head>',
      '<body bgcolor="' + BACKGROUND + '">',
      '<img src="' + LOGO_URL + ' "/><br/>',
      '<h2>New Character Attributes</h2>',
      '<form name="frm"><table>'];
    presets = ScribeUtils.getKeys(presets);
    // Copy info for each potential preset from the editor form to the loading
    // popup so that the user can specify the value
    for(var i = 0; i < presets.length; i++) {
      var preset = presets[i];
      var name = preset.replace(/([\w\)])(?=[A-Z\(])/g, '$1 ');
      name = name.substring(0, 1).toUpperCase() + name.substring(1);
      var presetHtml = '<tr><td><b>' + name + '</b></td>';
      var widget = editForm[preset];
      var selWidget = editForm[preset + '_sel'];
      if(selWidget != null) {
        // Sets and bags are difficult to manage, so we just provide a
        // separate entry field for each value, putting multiple ones on each
        // line to keep the popup compact
        presetHtml += '</tr>';
        var options = selWidget.options;
        var optionsPerLine = Math.ceil(options.length / 10) + 1;
        for(var j = 0; j < options.length; j += optionsPerLine) {
          var lineHtml = '<tr>';
          for(var k = j; k < j + optionsPerLine && k < options.length; k++) {
            var option = options[k].value;
            lineHtml += '<td><b>' + option + '</b></td><td>' +
                        InputHtml(preset + '.' + option, 'text', [2]) +
                        '</td>';
          }
          lineHtml += '</tr>';
          presetHtml += lineHtml;
        }
      } else if(widget != null) {
        presetHtml += '<td>' +
                      InputHtml(preset, widget.type, InputGetParams(widget)) +
                      '</td></tr>';
      } else {
        presetHtml += '<td>' + InputHtml(preset, 'text', [3]) + '</td></tr>';
      }
      htmlBits[htmlBits.length] = presetHtml;
    }
    htmlBits = htmlBits.concat([
      '</table></form>',
      '<form>',
      '<input type="button" value="Ok" onclick="okay=true;"/>',
      '<input type="button" value="Cancel" onclick="window.close();"/>',
      '</form></body></html>'
    ]);
    var html = htmlBits.join('\n') + '\n';
    characterPopup = window.open('', '__random', FEATURES_OF_OTHER_WINDOWS);
    characterPopup.document.write(html);
    characterPopup.document.close();
    characterPopup.okay = false;
    // Randomize the value of each pull-down menu in the loading window
    for(var i = 0; i < presets.length; i++) {
      var widget = characterPopup.document.frm[presets[i]];
      if(typeof(widget) == 'object' && widget != null &&
         widget.selectedIndex != null) {
        widget.selectedIndex = ScribeUtils.random(0, widget.options.length - 1);
      }
    }
    setTimeout('Scribe.randomizeCharacter(true)', TIMEOUT_DELAY);
    return;
  } else if(characterPopup.closed) {
    // User cancel
    characterPopup = null;
    return;
  } else if(characterPopup.name != '__random') {
    // Some other character manipulation pending
    return;
  } else if(!characterPopup.okay) {
    // Try again later
    setTimeout('Scribe.randomizeCharacter(true)', TIMEOUT_DELAY);
    return;
  }

  // Ready to generate
  var fixedAttributes = {};
  if(characterPopup != null) {
    for(i = 0; i < characterPopup.document.frm.elements.length; i++) {
      var element = characterPopup.document.frm.elements[i];
      var name = element.name;
      var value = InputGetValue(element);
      if(element.type=='button' || name==null || value==null || value=='')
        continue;
      fixedAttributes[name] = value;
    }
  }
  character = ruleSet.randomizeAllAttributes(fixedAttributes);
  characterPath = '';
  characterCache[characterPath] = ScribeUtils.clone(character);
  Scribe.refreshEditor(false);
  Scribe.refreshSheet();
  if(characterPopup != null)
    characterPopup.close();
  characterPopup = null;

};

/*
 * Resets the editing window fields to the values of the current character.
 * First redraws the editor if #redraw# is true.
 */
Scribe.refreshEditor = function(redraw) {

  var i;

  if(editWindow == null || editWindow.closed) {
    editWindow = scribeTab != null ? scribeTab.frames[0] :
                 window.open('', 'scribeEditor', FEATURES_OF_EDIT_WINDOW);
    redraw = true;
  }
  if(redraw) {
    var editHtml =
      '<html><head><title>Scribe Editor Window</title></head>\n' +
      '<body bgcolor="' + BACKGROUND + '">\n' +
      '<img src="' + LOGO_URL + ' "/><br/>\n' +
      COPYRIGHT + '<br/>\n' +
      Scribe.editorHtml() + '\n' +
      '</body></html>\n';
    editWindow.document.write(editHtml);
    editWindow.document.close();
    editForm = editWindow.document.forms[0];
    var callback = function() {Scribe.update(this);};
    for(i = 0; i < editForm.elements.length; i++) {
      InputSetCallback(editForm.elements[i], callback);
    }
  }

  var paths = [];
  for(var path in storage) {
    if(path.indexOf(PERSISTENT_CHARACTER_PREFIX) == 0)
      paths.push(path);
  }
  paths = paths.sort();
  var characterOpts = [
    '---choose one---', 'New...', 'Save', 'Save As...', 'Import...', 'Delete...'
  ];
  for(var path in paths) {
    characterOpts.push
      (paths[path].substring(PERSISTENT_CHARACTER_PREFIX.length));
  }

  InputSetOptions(editForm.character, characterOpts);
  InputSetOptions(editForm.rules, ScribeUtils.getKeys(ruleSets));
  InputSetOptions(editForm.viewer, ruleSet.getViewerNames());

  // Skip to first character-related editor input
  for(i = 0;
      i < editForm.elements.length && editForm.elements[i].name != 'name';
      i++)
    ; /* empty */
  for( ; i < editForm.elements.length; i++) {
    var input = editForm.elements[i];
    var name = input.name;
    var sel = editForm[name + '_sel'];
    var value = null;
    if(name.indexOf('_sel') >= 0) {
      // For bags/sets, display the first option for which the character has
      // a non-null value
      var prefix = name.substring(0, name.indexOf('_sel')) + '.';
      for(var a in character) {
        if(a.substring(0, prefix.length) == prefix) {
          value = a.substring(prefix.length);
          break;
        }
      }
    } else if(sel == null) {
      value = character[name];
    } else {
      value = character[name + '.' + InputGetValue(sel)];
    }
    if(InputGetValue(input) != value)
      InputSetValue(input, value);
  }

  InputSetValue(editForm.computed, persistentInfo.computed == '1');
  InputSetValue(editForm.hidden, persistentInfo.hidden == '1');
  InputSetValue(editForm.italics, persistentInfo.italics == '1');
  InputSetValue(editForm.rules, ruleSet.getName());
  InputSetValue(editForm.viewer,
                character['viewer'] || window.DEFAULT_SHEET_STYLE);

};

/* Draws the sheet for the current character in the character sheet window. */
Scribe.refreshSheet = function() {
  if(sheetWindow == null || sheetWindow.closed) {
    sheetWindow = window.scribeTab != null ? scribeTab.frames[1] :
                  window.open('', 'scribeSheet', FEATURES_OF_SHEET_WINDOW);
  }
  sheetWindow.document.write(Scribe.sheetHtml(character));
  sheetWindow.document.close();
};

/* Interacts w/user to preserve current character in persistent storage. */
Scribe.saveCharacter = function(path) {
  if(path == null) {
    path = editWindow.prompt("Save to path", "");
    if(path == null)
      return;
  }
  character['_timestamp'] = Date.now();
  var stringified = '';
  for(var attr in character) {
    stringified += attr + '=' + character[attr] + '\t';
  }
  storage.setItem(PERSISTENT_CHARACTER_PREFIX + path, stringified);
  characterPath = path;
  characterCache[characterPath] = ScribeUtils.clone(character);
  Scribe.refreshEditor(false);
}

/* Returns the character sheet HTML for the current character. */
Scribe.sheetHtml = function(attrs) {

  var a;
  var computedAttributes;
  var enteredAttributes = ScribeUtils.clone(attrs);
  var i;
  var sheetAttributes = {};

  enteredAttributes.hidden = persistentInfo.hidden;
  computedAttributes = ruleSet.applyRules(enteredAttributes);
  // NOTE: ObjectFormatter doesn't support interspersing values in a list
  // (e.g., skill ability, weapon damage), so we do some inelegant manipulation
  // of sheetAttributes' names and values here to get the sheet to look right.
  var notes = ruleSet.getChoices('notes');
  var strengthDamageAdjustment =
    computedAttributes['combatNotes.strengthDamageAdjustment'];
  if(strengthDamageAdjustment == null)
    strengthDamageAdjustment = 0;
  for(a in computedAttributes) {
    var name = a.replace(/([\w\)])(?=[A-Z\(])/g, '$1 ');
    name = name.substring(0, 1).toUpperCase() + name.substring(1);
    var value = computedAttributes[a];
    if((i = name.indexOf('.')) < 0) {
      sheetAttributes[name] = value;
    } else {
      var object = name.substring(0, i);
      name = name.substring(i + 1, i + 2).toUpperCase() + name.substring(i + 2);
      if(name.match(/\.\d+$/))
        continue; // Ignore note multi-values
      if(object.indexOf('Notes') >= 0 && typeof(value) == 'number') {
        if(value == 0)
          continue; // Suppress notes with zero value
        else if(notes[a] == null)
          value = ScribeUtils.signed(value); // Make signed if not formatted
      }
      if(notes[a] != null) {
        value = notes[a].replace(/%V/, value);
        for(var j=1; computedAttributes[a + '.' + j] != null; j++) {
          value = value.replace('%' + j, computedAttributes[a + '.' + j]);
        }
      }
      if(object == 'Skills') {
        var modifier = computedAttributes['skillModifier.' + name];
        if(modifier != null)
          value += ' (' + modifier + ')';
        var ability = ruleSet.getChoices('skills')[name];
        var skillInfo = [];
        if(ability != null && ability != '' && ability.substring(0, 1) != '/')
          skillInfo[skillInfo.length] = ability.substring(0, 3);
        if(computedAttributes['classSkills.' + name] == null)
          skillInfo[skillInfo.length] = 'cc';
        if(skillInfo.length > 0)
          name += ' (' + skillInfo.join(';') + ')';
      } else if(object == 'Weapons') {
        var damages = ruleSet.getChoices('weapons')[name];
        damages = damages == null ? 'd6' : damages.replace(/ /g, '');
        var range = computedAttributes['weaponRange.' + name];
        if((i = damages.search(/[rR]/)) >= 0) {
          if(range == null)
            range = damages.substring(i + 1) - 0;
          damages = damages.substring(0, i);
          if(computedAttributes['weaponRangeAdjustment.' + name] != null)
            range += computedAttributes['weaponRangeAdjustment.' + name] - 0;
          if(computedAttributes['features.Far Shot'] != null)
            range *= name.indexOf('bow') < 0 ? 2 : 1.5;
        }
        var attack =
          range == null ||
          name.match
            (/^(Club|Dagger|Light Hammer|Shortspear|Spear|Trident)$/) != null ?
          computedAttributes.meleeAttack : computedAttributes.rangedAttack;
        if(computedAttributes['weaponAttackAdjustment.' + name] != null)
          attack += computedAttributes['weaponAttackAdjustment.' + name] - 0;
        var addedDamage = strengthDamageAdjustment;
        if(name.indexOf('bow') >= 0 &&
           (name.indexOf('Composite') < 0 || addedDamage > 0))
          addedDamage = 0;
        if(computedAttributes['weaponDamageAdjustment.' + name] != null)
          addedDamage += computedAttributes['weaponDamageAdjustment.'+name] - 0;
        damages = damages.split('/');
        for(i = 0; i < damages.length; i++) {
          var pieces =
            damages[i].match(/^(\d*d\d+)([\+\-]\d+)? *(x(\d+))? *(@(\d+))?$/);
          if(pieces == null)
            pieces = ['d6', 'd6'];
          var additional = (pieces[2] ? pieces[2] - 0 : 0) + addedDamage;
          var damage = computedAttributes['weaponDamage.' + name];
          if(damage == null)
            damage = pieces[1];
          var multiplier = pieces[4] ? pieces[4] - 0 : 2;
          var threat = pieces[6] ? pieces[6] - 0 : 20;
          if(computedAttributes['weaponCriticalAdjustment.' + name] != null)
            threat -= computedAttributes['weaponCriticalAdjustment.' + name];
          if(computedAttributes['features.Small'] &&
             SRD35.weaponsSmallDamage[damage] != null) {
            damage = SRD35.weaponsSmallDamage[damage];
          } else if(computedAttributes['features.Large'] &&
                    SRD35.weaponsLargeDamage[damage] != null) {
            damage = SRD35.weaponsLargeDamage[damage];
          }
          if(additional != 0)
            damage += ScribeUtils.signed(additional);
          damages[i] = damage;
          if(multiplier > 1)
            damages[i] += ' x' + multiplier + '@' + threat;
        }
        name += '(' + ScribeUtils.signed(attack) + ' ' + damages.join('/') +
                (range != null ? ' R' + range : '') + ')';
      }
      value = name + ': ' + value;
      if(object.indexOf('Notes') > 0 && ruleSet.isSource(a)) {
        if(persistentInfo.italics == '1')
          value = '<i>' + value + '</i>';
        else
          continue;
      }
      if(sheetAttributes[object] == null)
        sheetAttributes[object] = [];
      sheetAttributes[object][sheetAttributes[object].length] = value;
    }
  }

  for(a in sheetAttributes) {
    var attr = sheetAttributes[a];
    if(typeof(attr) == 'object') {
      attr.sort();
      // If all values in the array are 1|true, assume that it's a set and
      // suppress display of the values
      if(attr.join(',').replace(/: (1|true)(,|$)/g, '').indexOf(':') < 0)
        for(i = 0; i < attr.length; i++)
          attr[i] = attr[i].replace(/:.*/, '');
      sheetAttributes[a] = attr;
    }
  }

  var attrImage = 'var attributes = ' + ObjectViewer.toCode(attrs) + ';\n';
  if(persistentInfo.computed == '1') {
    attrImage +=
      'var computed = ' + ObjectViewer.toCode(computedAttributes) + ';\n';
  }

  return '<' + '!' + '-- Generated ' + new Date().toString() +
           ' by Scribe version ' + VERSION + '; ' + 
           ruleSet.getName() + ' rule set version ' + ruleSet.getVersion() +
           ' --' + '>\n' +
         '<html>\n' +
         '<head>\n' +
         '  <title>' + sheetAttributes.Name + '</title>\n' +
         '  <script>\n' +
         attrImage +
         // Careful: don't want to close scribe.html's script tag here!
         '  </' + 'script>\n' +
         '</head>\n' +
         '<body>\n' +
         ruleSet.getViewer(InputGetValue(editForm.viewer)).
           getHtml(sheetAttributes, '_top') + '\n' +
         '</body>\n' +
         '</html>\n';

};

/* Opens a window that contains HTML for #html# in readable/copyable format. */
Scribe.showHtml = function(html) {
  if(Scribe.showHtml.htmlWindow == null || Scribe.showHtml.htmlWindow.closed)
    Scribe.showHtml.htmlWindow =
      window.open('', 'html', FEATURES_OF_OTHER_WINDOWS);
  else
    Scribe.showHtml.htmlWindow.focus();
  html = html.replace(/</g, '&lt;');
  html = html.replace(/>/g, '&gt;');
  Scribe.showHtml.htmlWindow.document.write(
    '<html><head><title>HTML</title></head>\n' +
    '<body><pre>' + html + '</pre></body></html>\n'
  );
  Scribe.showHtml.htmlWindow.document.close();
};

/* Stores the current values of persistentInfo in the browser. */
Scribe.storePersistentInfo = function() {
  for(var a in persistentInfo) {
    storage.setItem(PERSISTENT_INFO_PREFIX + a, persistentInfo[a]);
  }
};

/*
 * Opens a window that displays a summary of the attributes of all characters
 * that have been loaded into the editor.
 */
Scribe.summarizeCachedAttrs = function() {
  var combinedAttrs = { };
  var htmlBits = [
    '<head><title>Scribe Character Attribute Summary</title></head>',
    '<body bgcolor="' + BACKGROUND + '">',
    '<h1>Scribe Character Attribute Summary</h1>',
    '<table border="1">'
  ];
  var notes = ruleSet.getChoices('notes');
  for(var character in characterCache) {
    if(character == 'random')
      continue;
    var attrs = ruleSet.applyRules(characterCache[character]);
    for(var attr in attrs) {
      if(ruleSet.isSource(attr) ||
         attr.indexOf('features.') >= 0 ||
         attr.match(/\.[0-9]+$/))
        continue;
      var value = attrs[attr];
      if(attr.indexOf('Notes.') >= 0 && value == 0)
        continue;
      if(combinedAttrs[attr] == null)
        combinedAttrs[attr] = [];
      var format = notes[attr];
      if(format != null)
        value = format.replace(/%V/, value);
      combinedAttrs[attr].push(value);
    }
  }
  var keys = ScribeUtils.getKeys(combinedAttrs);
  keys.sort();
  for(var i = 0; i < keys.length; i++) {
    var attr = keys[i];
    var values = combinedAttrs[attr];
    values.sort();
    var unique = [];
    for(var j = 0; j < values.length; j++) {
      var value = values[j];
      var count = 1;
      while(j < values.length && values[j + 1] == value) {
        count++;
        j++;
      }
      if(count > 1)
        value = count + '@' + value;
      unique.push(value);
    }
    htmlBits[htmlBits.length] =
      '<tr><th>' + attr + '</th><td>' + unique.join(',') + '</td></tr>';
  }
  htmlBits[htmlBits.length] = '</table>';
  htmlBits[htmlBits.length] = '</body></html>\n';
  if(Scribe.summarizeCachedAttrs.win == null ||
     Scribe.summarizeCachedAttrs.win.closed)
    Scribe.summarizeCachedAttrs.win =
      window.open('', 'sumwin', FEATURES_OF_OTHER_WINDOWS);
  else
    Scribe.summarizeCachedAttrs.win.focus();
  Scribe.summarizeCachedAttrs.win.document.write(htmlBits.join('\n'));
  Scribe.summarizeCachedAttrs.win.document.close();
};

/* Callback invoked when the user changes the editor value of Input #input#. */
Scribe.update = function(input) {

  var name = input.name;
  var value = InputGetValue(input);
  if(value === true)
    value = 1;
  else if(value === false)
    value = 0;
  if(name == 'about') {
    if(Scribe.aboutWindow == null || Scribe.aboutWindow.closed) {
      Scribe.aboutWindow =
        window.open('', 'About Scribe', FEATURES_OF_OTHER_WINDOWS);
      Scribe.aboutWindow.document.write
        (ABOUT_TEXT.replace(/\n/g, '<br/>\n<br/>\n'));
      Scribe.aboutWindow.document.close();
      Scribe.aboutWindow.document.bgColor = BACKGROUND;
    } else
      Scribe.aboutWindow.focus();
  } else if(name.match(/^(computed|hidden|italics)$/)) {
    persistentInfo[name] = value ? '1' : '0';
    Scribe.storePersistentInfo();
    Scribe.refreshSheet();
  } else if(name == 'character') {
    input.selectedIndex = 0;
    if(value == '---select one---')
      ; /* empty--Safari bug workaround */
    else if(value == 'Delete...')
      Scribe.deleteCharacter();
    else if(value == 'Save')
      Scribe.saveCharacter(characterPath == '' ? null : characterPath);
    else if(value == 'Save As...')
      Scribe.saveCharacter(null);
    else if(WARN_ABOUT_DISCARD &&
       !ScribeUtils.clones(character, characterCache[characterPath]) &&
       !editWindow.confirm("Discard changes to character?"))
      ; /* empty */
    else if(value == 'Import...')
      Scribe.importCharacter();
    else if(value == 'New...')
      Scribe.randomizeCharacter(true);
    else
      Scribe.openCharacter(value);
  } else if(name == 'help') {
    if(Scribe.helpWindow == null || Scribe.helpWindow.closed)
      Scribe.helpWindow =
        window.open(HELP_URL, 'help', FEATURES_OF_OTHER_WINDOWS);
    else
      Scribe.helpWindow.focus();
  } else if(name == 'randomize') {
    input.selectedIndex = 0;
    ruleSet.randomizeOneAttribute(character, value);
    Scribe.refreshEditor(false);
    Scribe.refreshSheet();
  } else if(name == 'rules') {
    ruleSet = ruleSets[value];
    Scribe.refreshEditor(true);
    Scribe.refreshSheet();
  } else if(name == 'ruleAttributes') {
    if(Scribe.attributesWindow != null && !Scribe.attributesWindow.closed)
      Scribe.attributesWindow.close();
    Scribe.attributesWindow =
      window.open('', 'attrwin', FEATURES_OF_OTHER_WINDOWS);
    Scribe.attributesWindow.document.write(
      '<html>\n',
      '<head>\n',
      '<title>Attributes of ' + InputGetValue(editForm.rules) + '</title>\n',
      '</head>\n',
      '<body>\n'
    );
    var attrs = ruleSet.allSources().concat(ruleSet.allTargets());
    attrs.sort();
    for(var i = 0; i < attrs.length; i++) {
      if(i > 0 && attrs[i] != '' && attrs[i] != attrs[i - 1])
        Scribe.attributesWindow.document.write(attrs[i] + '<br/>\n');
    }
    Scribe.attributesWindow.document.write(
      '</body>\n',
      '</html>\n'
    );
    Scribe.attributesWindow.document.close();
  } else if(name == 'ruleNotes') {
    if(Scribe.ruleNotesWindow != null && !Scribe.ruleNotesWindow.closed)
      Scribe.ruleNotesWindow.close();
    Scribe.ruleNotesWindow =
      window.open('', 'rulenotes', FEATURES_OF_OTHER_WINDOWS);
    Scribe.ruleNotesWindow.document.write(
      '<html>\n',
      '<head>\n',
      '<title>Rule Notes for ' + InputGetValue(editForm.rules) + '</title>\n',
      '</head>\n',
      '<body bgcolor="' + BACKGROUND + '">\n',
      ruleSet.ruleNotes(),
      '\n</body>\n',
      '</html>\n'
    );
    Scribe.ruleNotesWindow.document.close();
  } else if(name == 'ruleRules') {
    var awin = window.open('', 'rulewin', FEATURES_OF_OTHER_WINDOWS);
    awin.document.write
      ('<html><head><title>RULES</title></head><body><pre>\n');
    awin.document.write(ruleSet.toHtml());
    awin.document.write('</pre></body></html>');
    awin.document.close();
  } else if(name == 'summary') {
    Scribe.summarizeCachedAttrs();
  } else if(name == 'view') {
    Scribe.showHtml(Scribe.sheetHtml(character));
  } else if(name.indexOf('_clear') >= 0) {
    name = name.replace(/_clear/, '');
    for(var a in character) {
      if(a.indexOf(name + '.') == 0)
        delete character[a];
    }
    input = editForm[name];
    if(input != null)
      InputSetValue(input, null);
    input = editForm[name + '_sel'];
    if(input != null)
      input.selectedIndex = 0;
    Scribe.refreshEditor(false);
    Scribe.refreshSheet();
  } else if(name.indexOf('_filter') >= 0) {
    name = name.replace(/_filter/, '');
    var opts = [];
    for(var a in ruleSet.getChoices(name)) {
      if(value == "" || a.indexOf(value) >= 0) {
        opts[opts.length] = a;
      }
    }
    if(opts.length == 0)
      opts[opts.length] = "---empty---";
    opts.sort();
    InputSetOptions(editForm[name + "_sel"], opts);
    character[name + '_filter'] = value;
    Scribe.refreshEditor(false);
  } else if(name.indexOf('_sel') >= 0) {
    name = name.replace(/_sel/, '');
    input = editForm[name];
    if(input != null) {
      InputSetValue(input, character[name + '.' + value]);
    }
  } else {
    var selector = editForm[name + '_sel'];
    if(selector != null)
      name += '.' + InputGetValue(selector);
    if(!value)
      delete character[name];
    else if(typeof(value) == 'string' &&
            value.match(/^\+-?\d+$/) &&
            (typeof(character[name]) == 'number' ||
             (typeof(character[name]) == 'string' &&
              character[name].match(/^\d+$/)))) {
      character[name] = ((character[name] - 0) + (value.substring(1) - 0)) + '';
      InputSetValue(input, character[name]);
    }
    else
      character[name] = value;
    Scribe.refreshSheet();
    if(name.search(/^(levels|domains)\./) >= 0)
      Scribe.refreshEditor(false);
  }

};
