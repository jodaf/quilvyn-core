"use strict";

var COPYRIGHT = 'Copyright 2020 James J. Hayes';
var VERSION = '2.0.1';
var ABOUT_TEXT =
'Quilvyn Character Editor version ' + VERSION + '\n' +
'The Quilvyn Character Editor is ' + COPYRIGHT + '\n' +
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
'<a href="plugins/ogl.txt">here</a> to see the license.\n' +
'Thanks to my dungeon crew, especially Rich Hakesley and Norm Jacobson, for ' +
'patient testing of Quilvyn and for suggestions that greatly improved it.';

var FEATURES_OF_EDIT_WINDOW =
  'height=750,width=500,menubar,resizable,scrollbars';
var FEATURES_OF_SHEET_WINDOW =
  'height=750,width=750,menubar,resizable,scrollbars,toolbar';
var FEATURES_OF_OTHER_WINDOWS =
  'height=750,width=750,menubar,resizable,scrollbars,toolbar';
var PERSISTENT_CHARACTER_PREFIX = 'QuilvynCharacter.';
var PERSISTENT_INFO_PREFIX = 'QuilvynInfo.';
var PERSISTENT_RULE_PREFIX = 'QuilvynRule.';
var TIMEOUT_DELAY = 1000; // One second

var character = {};     // Displayed character attrs
var characterCache = {};// Attrs of all displayed characters, indexed by path
var characterPath = ''; // Path to most-recently opened/generated character
var editForm;           // Character editing form (editWindow.document.forms[0])
var editWindow = null;  // Window where editor is shown
var persistentInfo = {  // What we store in persistent data
  extras: '1',          // Show extra attributes on sheet?
  hidden: '0',          // Show information marked "hidden" on sheet?
  italics: '1'          // Show italicized notes on sheet?
};
var ruleSet = null;     // The rule set currently in use
var ruleSets = {};      // Registered rule sets, indexed by name
var quilvynTab = null;  // Menu/sheet tab, if requested
var sheetWindow = null; // Window where character sheet is shown

/* Launch routine called after all Quilvyn scripts are loaded. */
function Quilvyn() {

  if(InputGetValue == null || ObjectViewer == null || RuleEngine == null ||
     QuilvynRules == null || QuilvynUtils == null) {
    alert('JavaScript modules needed by Quilvyn are missing; exiting');
    return;
  }

  window.BACKGROUND = typeof BACKGROUND === 'undefined' ? 'wheat' : BACKGROUND;
  window.DEFAULT_SHEET_STYLE = typeof DEFAULT_SHEET_STYLE === 'undefined' ? 'Standard' : DEFAULT_SHEET_STYLE;
  window.LOGO_URL = typeof LOGO_URL === 'undefined' ? 'core/quilvyn.gif' : LOGO_URL;
  window.MENU_WIDTH_PERCENT = typeof MENU_WIDTH_PERCENT === 'undefined' ? 30 : MENU_WIDTH_PERCENT;
  window.WARN_ABOUT_DISCARD = typeof WARN_ABOUT_DISCARD === 'undefined' ? true : WARN_ABOUT_DISCARD;

  try {
    window.MENU_WIDTH_PERCENT = Math.floor(Number(window.MENU_WIDTH_PERCENT));
    if(window.MENU_WIDTH_PERCENT < 10 || window.MENU_WIDTH_PERCENT > 90)
      window.MENU_WIDTH_PERCENT = 0;
  } catch(err) {
    window.MENU_WIDTH_PERCENT = 0;
  }


  for(var a in persistentInfo) {
    if(STORAGE.getItem(PERSISTENT_INFO_PREFIX + a) != null) {
      persistentInfo[a] = STORAGE.getItem(PERSISTENT_INFO_PREFIX + a);
    }
  }

  if(CustomizeQuilvyn != null)
    CustomizeQuilvyn();

  if(window.MENU_WIDTH_PERCENT > 0) {
    var sheetWidthPercent = 99 - window.MENU_WIDTH_PERCENT;
    quilvynTab = window.open('', '');
    quilvynTab.document.write(
      '<html>\n' +
      '<head>\n' +
      '  <title>Quilvyn</title>\n' +
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
    quilvynTab.document.close();
    quilvynTab.focus();
  }

  Quilvyn.newCharacter();

}

/* Adds #rs# to Quilvyn's list of supported rule sets. */
Quilvyn.addRuleSet = function(rs) {
  // Add a rule for handling hidden information
  rs.defineRule('hiddenNotes', 'hidden', '?', null);
  ruleSets[rs.getName()] = rs;
  ruleSet = rs;
  var customRulePrefix = PERSISTENT_RULE_PREFIX + rs.getName() + '.';
  for(var path in STORAGE) {
    if(path.startsWith(customRulePrefix)) {
      var typeAndName = path.substring(customRulePrefix.length).split('.');
      ruleSet.choiceRules(rs, typeAndName[0], typeAndName[1], STORAGE.getItem(path));
    }
  }
};

Quilvyn.applyV2Changes = function(character) {
  var result = {};
  for(var attr in character) {
    var value = character[attr];
    if(attr == 'deity')
      value = value.replace(/ \(.*/, '');
    else if(attr.match(/^domains\./))
      attr = attr.replace('domains.', 'selectableFeatures.Cleric - ') + ' Domain';
    else if(attr.match(/^prohibit\./))
      attr = attr.replace('prohibit.', 'selectableFeatures.Wizard - School Opposition (') + ')';
    else if(attr.match(/^specialize\./))
      attr = attr.replace('specialize.', 'selectableFeatures.Wizard - School Specialization (') + ')';
    attr = attr.replace(/(half) ?(elf)/i, '$1-$2');
    attr = attr.replace(/(half) ?(orc)/i, '$1-$2');
    attr = attr.replace(/(blind) ?(fight)/i, '$1-$2');
    attr = attr.replace(/(point) ?(blank)/i, '$1-$2');
    value = value.replace(/(half) ?(elf)/i, '$1-$2');
    value = value.replace(/(half) ?(orc)/i, '$1-$2');
    value = value.replace(/(blind) ?(fight)/i, '$1-$2');
    value = value.replace(/(point) ?(blank)/i, '$1-$2');
    result[attr] = value;
  }
  return result;
};

/* Interacts with the user to add one custom choice to the current rule set. */
Quilvyn.customChoicesAdd = function(focus, input) {

  if(focus && Quilvyn.customChoicesAdd.win != null) {
    // Prior add still pending
    Quilvyn.customChoicesAdd.win.focus();
    return;
  } else if(Quilvyn.customChoicesAdd.win == null) {
    // New addition
    var choices = QuilvynUtils.getKeys(ruleSet.getChoices('choices'));
    var htmlBits = [
      '<html><head><title>Add Custom Choice</title></head>',
      '<body bgcolor="' + window.BACKGROUND + '">',
      '<img src="' + LOGO_URL + '"/><br/>'
    ];
    htmlBits.push(
      '<form>',
      '<b>Type</b>',
      InputHtml('type', 'select-one', choices).replace('>', ' onchange="update=true">'),
      '<b>Name</b>',
      InputHtml('name', 'text', [20]),
      '<table name="variableFields">',
      '</table>',
      '<input type="button" name="Ok" value="Ok" onclick="okay=true;"/>',
      '<input type="button" name="Cancel" value="Cancel" onclick="window.close();"/>',
      '</form></body></html>'
    );
    var html = htmlBits.join('\n') + '\n';
    Quilvyn.customChoicesAdd.win = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
    Quilvyn.customChoicesAdd.win.document.write(html);
    Quilvyn.customChoicesAdd.win.document.close();
    Quilvyn.customChoicesAdd.win.okay = false;
    Quilvyn.customChoicesAdd.win.focus();
    Quilvyn.customChoicesAdd.win.update = true;
    Quilvyn.customChoicesAdd(false, Quilvyn.customChoicesAdd.win.document.forms[0]['type']);
    return;
  } else if(Quilvyn.customChoicesAdd.win.closed) {
    // User cancel
    Quilvyn.customChoicesAdd.win = null;
    return;
  } else if(!Quilvyn.customChoicesAdd.win.okay) {
    // Try again later, after updating the input fields as necessary
    if(Quilvyn.customChoicesAdd.win.update) {
      var typeInput =
        Quilvyn.customChoicesAdd.win.document.getElementsByName('type')[0];
      var typeValue = InputGetValue(typeInput);
      var elements = ruleSet.choiceEditorElements(ruleSet, typeValue);
      var htmlBits = [];
      for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var label = element[1];
        var name = element[0];
        var params = element[3];
        var type = element[2];
        htmlBits.push(
          '<tr><th>' + (label ? label : '&nbsp;') + '</th><td>' +
          InputHtml(name, type, params) + '</td></tr>'
        );
      }
      Quilvyn.customChoicesAdd.win.document.getElementsByName('variableFields')[0].innerHTML = htmlBits.join('\n');
      Quilvyn.customChoicesAdd.win.update = false;
    }
    setTimeout('Quilvyn.customChoicesAdd(false)', TIMEOUT_DELAY);
    return;
  }

  // Ready to add choice
  var inputForm = Quilvyn.customChoicesAdd.win.document.forms[0];
  var attrs = [];
  var name = '';
  var type = '';
  for(i = 0; i < inputForm.elements.length; i++) {
    var input = inputForm.elements[i];
    var inputName = input.name;
    var inputValue = InputGetValue(input);
    if(inputName == 'name')
      name = inputValue;
    else if(inputName == 'type')
      type = inputValue;
    else if(inputName == 'Ok' || inputName == 'Cancel')
      continue;
    else {
      var quote = '';
      if(inputValue.indexOf(' ') >= 0)
        quote = inputValue.indexOf('"') >= 0 ? "'" : '"';
      attrs.push(inputName + '=' + quote + inputValue + quote);
    }
  }
  attrs = attrs.join(' ');
  ruleSet.choiceRules(ruleSet, type, name, attrs);
  STORAGE.setItem(PERSISTENT_RULE_PREFIX + ruleSet.getName() + '.' + type + '.' + name, attrs);

  Quilvyn.customChoicesAdd.win.close();
  Quilvyn.customChoicesAdd.win = null;
  Quilvyn.refreshEditor(true);

};

/*
 * Interacts with the user to delete one custom choice from the current rule
 * set.
 */
Quilvyn.customChoicesDelete = function() {
  var prompt = 'Enter custom choice to delete:';
  var paths = [];
  var prefix = PERSISTENT_RULE_PREFIX + ruleSet.getName() + '.';
  for(var path in STORAGE) {
    if(path.startsWith(prefix))
      paths.push(path.substring(prefix.length));
  }
  paths.sort();
  var path = editWindow.prompt(prompt + '\n' + paths.join('\n'), '');
  if(path == null)
    // User cancel
    return;
  if(STORAGE.getItem(prefix + path) == null) {
    editWindow.alert("No such custom choice " + path);
    return;
  }
  STORAGE.removeItem(prefix + path);
  var pieces = path.split('.');
  var type = pieces[0];
  type =
    type.substring(0,1).toLowerCase()+type.substring(1).replace(/ /g, '') + 's';
  ruleSet.deleteChoice(type, pieces[1]);
  Quilvyn.refreshEditor(true);
};

/*
 * Displays all custom choices in the current rule set in a format that can be
 * imported into Quilvyn.
 */
Quilvyn.customChoicesExport = function() {
  var htmlBits = [
    '<html><head><title>Export Custom Choices</title></head>',
    '<body bgcolor="' + window.BACKGROUND + '">',
    '<img src="' + LOGO_URL + ' "/><br/>',
    '<pre>'
  ];
  var prefix = PERSISTENT_RULE_PREFIX + ruleSet.getName() + '.';
  for(var path in STORAGE) {
    if(!path.startsWith(prefix))
      continue;
    var text = (path.substring(prefix.length) + '.' + STORAGE.getItem(path)).
      replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    htmlBits.push(text);
  }
  htmlBits.push('</pre>', '</body></html>');
  var html = htmlBits.join('\n') + '\n';
  var exportPopup = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
  exportPopup.document.write(html);
  exportPopup.document.close();
  exportPopup.focus();
};

/*
 * Interacts with the user to import a set of custom choices into the current
 * rule set.
 */
Quilvyn.customChoicesImport = function(focus) {

  if(focus && Quilvyn.customChoicesImport.win != null) {
    // Prior import still pending
    Quilvyn.customChoicesImport.win.focus();
    return;
  } else if(Quilvyn.customChoicesImport.win == null) {
    // New import
    var htmlBits = [
      '<html><head><title>Import Custom Choices</title></head>',
      '<body bgcolor="' + window.BACKGROUND + '">',
      '<img src="' + LOGO_URL + ' "/><br/>',
      '<h2>Enter choice definitions from export</h2>',
      '<form name="frm"><table>',
      '<tr><td><textarea name="code" rows="20" cols="50"></textarea></td></tr>',
      '</table></form>',
      '<form>',
      '<input type="button" value="Ok" onclick="okay=true;"/>',
      '<input type="button" value="Cancel" onclick="window.close();"/>',
      '</form></body></html>'
    ];
    var html = htmlBits.join('\n') + '\n';
    Quilvyn.customChoicesImport.win =
      window.open('', '', FEATURES_OF_OTHER_WINDOWS);
    Quilvyn.customChoicesImport.win.document.write(html);
    Quilvyn.customChoicesImport.win.document.close();
    Quilvyn.customChoicesImport.win.okay = false;
    Quilvyn.customChoicesImport.win.focus();
    setTimeout('Quilvyn.customChoicesImport(false)', TIMEOUT_DELAY);
    return;
  } else if(Quilvyn.customChoicesImport.win.closed) {
    // User cancel
    Quilvyn.customChoicesImport.win = null;
    return;
  } else if(!Quilvyn.customChoicesImport.win.okay) {
    // Try again later
    setTimeout('Quilvyn.customChoicesImport(false)', TIMEOUT_DELAY);
    return;
  }

  // Ready to import
  var lines = Quilvyn.customChoicesImport.win.document.frm.elements[0].value.split('\n');

  for(var i = 0; i < lines.length; i++) {
    var pieces = lines[i].split('.');
    var choiceType = pieces.shift();
    var choiceName = pieces.shift();
    var choiceAttrs = pieces.join('.');
    ruleSet.choiceRules(ruleSet, choiceType, choiceName, choiceAttrs);
    STORAGE.setItem(PERSISTENT_RULE_PREFIX + ruleSet.getName() + '.' + choiceType + '.' + choiceName, choiceAttrs);
  }

  Quilvyn.customChoicesImport.win.close();
  Quilvyn.customChoicesImport.win = null;
  Quilvyn.refreshEditor(true);

};

/* Interacts w/user to delete a character from persistent storage. */
Quilvyn.deleteCharacter = function() {
  var prompt = 'Enter character to delete:';
  var paths = [];
  for(var path in STORAGE) {
    if(path.startsWith(PERSISTENT_CHARACTER_PREFIX))
      paths.push(path.substring(PERSISTENT_CHARACTER_PREFIX.length));
  }
  paths.sort();
  var path = editWindow.prompt(prompt + '\n' + paths.join('\n'), '');
  if(path == null)
    // User cancel
    return;
  if(STORAGE.getItem(PERSISTENT_CHARACTER_PREFIX + path) == null) {
    editWindow.alert("No such character " + path);
    return;
  }
  STORAGE.removeItem(PERSISTENT_CHARACTER_PREFIX + path);
  Quilvyn.refreshEditor(false);
}

/* Returns HTML for the character editor form. */
Quilvyn.editorHtml = function() {
  var quilvynElements = [
    ['about', ' ', 'button', ['About']],
    ['help', '', 'button', ['Help']],
    ['rules', 'Rules', 'select-one', []],
    ['rulesNotes', '', 'button', ['Notes']],
    ['rulesCustomize', '', 'select-one', ['--- Customize ---', 'Add...', 'Delete...', 'Export', 'Import...']],
    ['ruleRules', '', 'button', ['Rules']],
    ['character', 'Character', 'select-one', []],
    ['italics', 'Show', 'checkbox', ['Italic Notes']],
    ['extras', '', 'checkbox', ['Extras']],
    ['hidden', '', 'checkbox', ['Hidden']],
    ['viewer', 'Sheet Style', 'select-one', []],
    ['randomize', 'Randomize', 'select-one', 'random']
  ];
  var elements = quilvynElements.concat(ruleSet.getEditorElements());
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
      params = QuilvynUtils.getKeys(ruleSet.getChoices(params));
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

/* Pops a window containing the attribues of all stored characters. */
Quilvyn.exportCharacters = function() {
  var htmlBits = [
    '<html><head><title>Export Characters</title></head>',
    '<body bgcolor="' + window.BACKGROUND + '">',
    '<img src="' + LOGO_URL + ' "/><br/>'];
  for(var path in STORAGE) {
    if(!path.startsWith(PERSISTENT_CHARACTER_PREFIX))
      continue;
    var toExport = Quilvyn.retrieveCharacterFromStorage(path);
    // In case character saved before _path attr use
    toExport['_path'] = path.substring(PERSISTENT_CHARACTER_PREFIX.length);
    var text = ObjectViewer.toCode(toExport).
      replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    htmlBits.push("<pre>\n" + text + "\n</pre><br/>\n");
  }
  htmlBits.push('</body></html>');
  var html = htmlBits.join('\n') + '\n';
  var exportPopup = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
  exportPopup.document.write(html);
  exportPopup.document.close();
  exportPopup.focus();
};

/*
 * Interacts w/user to import characters from external sources. If an import
 * window is already open, places focus on it if #focus# is true.
 */
Quilvyn.importCharacters = function(focus) {

  if(focus && Quilvyn.importCharacters.win != null) {
    // Prior import still pending
    Quilvyn.importCharacters.win.focus();
    return;
  } else if(Quilvyn.importCharacters.win == null) {
    // New import
    var htmlBits = [
      '<html><head><title>Import Character</title></head>',
      '<body bgcolor="' + window.BACKGROUND + '">',
      '<img src="' + LOGO_URL + ' "/><br/>',
      '<h2>Enter attribute definition from character sheet source</h2>',
      '<form name="frm"><table>',
      '<tr><td><textarea name="code" rows="20" cols="50"></textarea></td></tr>',
      '</table></form>',
      '<form>',
      '<input type="button" value="Ok" onclick="okay=true;"/>',
      '<input type="button" value="Cancel" onclick="window.close();"/>',
      '</form></body></html>'
    ];
    var html = htmlBits.join('\n') + '\n';
    Quilvyn.importCharacters.win =
      window.open('', '', FEATURES_OF_OTHER_WINDOWS);
    Quilvyn.importCharacters.win.document.write(html);
    Quilvyn.importCharacters.win.document.close();
    Quilvyn.importCharacters.win.okay = false;
    Quilvyn.importCharacters.win.focus();
    setTimeout('Quilvyn.importCharacters(false)', TIMEOUT_DELAY);
    return;
  } else if(Quilvyn.importCharacters.win.closed) {
    // User cancel
    Quilvyn.importCharacters.win = null;
    return;
  } else if(!Quilvyn.importCharacters.win.okay) {
    // Try again later
    setTimeout('Quilvyn.importCharacters(false)', TIMEOUT_DELAY);
    return;
  }

  // Ready to import
  var text = Quilvyn.importCharacters.win.document.frm.elements[0].value;
  var index = text.indexOf('{');

  if(index < 0) {
    Quilvyn.importCharacters.win.alert("Syntax error: missing {");
    Quilvyn.importCharacters.win.focus();
    Quilvyn.importCharacters.win.okay = false;
    setTimeout('Quilvyn.importCharacters(false)', TIMEOUT_DELAY);
    return;
  }

  while(index >= 0) {
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
      Quilvyn.importCharacters.win.alert("Syntax error: missing } at '" + text + "'");
      Quilvyn.importCharacters.win.focus();
      Quilvyn.importCharacters.win.okay = false;
      setTimeout('Quilvyn.importCharacters(false)', TIMEOUT_DELAY);
      return;
    }
    character = Quilvyn.applyV2Changes(importedCharacter);
    characterPath = character['_path'] || '';
    characterCache[characterPath] = QuilvynUtils.clone(character);
    Quilvyn.saveCharacter(characterPath);
    index = text.indexOf('{');
  }

  Quilvyn.importCharacters.win.close();
  Quilvyn.importCharacters.win = null;
  Quilvyn.refreshEditor(false);
  Quilvyn.refreshSheet();

};

/* Loads character specified by #path# from persistent storage. */
Quilvyn.openCharacter = function(path) {
  character =
    Quilvyn.retrieveCharacterFromStorage(PERSISTENT_CHARACTER_PREFIX + path);
  character = Quilvyn.applyV2Changes(character);
  character['_path'] = path; // In case character saved before _path attr use
  characterPath = path;
  characterCache[characterPath] = QuilvynUtils.clone(character);
  Quilvyn.refreshEditor(false);
  Quilvyn.refreshSheet();
}

/* Replaces the current character with one with empty attributes. */
Quilvyn.newCharacter = function() {
  character = {};
  var elements = ruleSet.getEditorElements();
  for(var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var label = element[1];
    var name = element[0];
    var params = element[3];
    var type = element[2];
    if(type == 'checkbox') {
      character[name] = 0;
    } else if(type == 'select-one') {
      var options = typeof(params) == 'string' ? QuilvynUtils.getKeys(ruleSet.getChoices(params)) : params;
      character[name] = options.includes('None') ? 'None' : options[0];
    } else if(name == 'experience' || name == 'hitPoints') {
      character[name] = 0;
    }
  }
  characterPath = '';
  characterCache[characterPath] = QuilvynUtils.clone(character);
  Quilvyn.refreshEditor(false);
  Quilvyn.refreshSheet();
};

/*
 * Interacts w/user to repace the current character with on that has all
 * randomized attributes. If a randomize prompt window is already open, places
 * focus on it if #focus# is true.
 */
Quilvyn.randomizeCharacter = function(focus) {

  var presets = ruleSet.getChoices('preset');

  if(presets == null) {
    // No window needed
  } else if(focus && Quilvyn.randomizeCharacter.win != null) {
    // Prior randomize still pending
    Quilvyn.randomizeCharacter.win.focus();
    return;
  } else if(Quilvyn.randomizeCharacter.win == null) {
    // New randomize
    var htmlBits = [
      '<html><head><title>Random Character</title></head>',
      '<body bgcolor="' + window.BACKGROUND + '">',
      '<img src="' + LOGO_URL + ' "/><br/>',
      '<h2>Character Attributes</h2>',
      '<form name="frm"><table>'];
    presets = QuilvynUtils.getKeys(presets);
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
    Quilvyn.randomizeCharacter.win =
      window.open('', '', FEATURES_OF_OTHER_WINDOWS);
    Quilvyn.randomizeCharacter.win.document.write(html);
    Quilvyn.randomizeCharacter.win.document.close();
    // Randomize the value of each pull-down menu in the loading window
    for(var i = 0; i < presets.length; i++) {
      var widget = Quilvyn.randomizeCharacter.win.document.frm[presets[i]];
      if(typeof(widget) == 'object' && widget != null &&
         widget.selectedIndex != null) {
        widget.selectedIndex = QuilvynUtils.random(0, widget.options.length-1);
      }
    }
    Quilvyn.randomizeCharacter.win.okay = false;
    Quilvyn.randomizeCharacter.win.focus();
    setTimeout('Quilvyn.randomizeCharacter(false)', TIMEOUT_DELAY);
    return;
  } else if(Quilvyn.randomizeCharacter.win.closed) {
    // User cancel
    Quilvyn.randomizeCharacter.win = null;
    return;
  } else if(!Quilvyn.randomizeCharacter.win.okay) {
    // Try again later
    setTimeout('Quilvyn.randomizeCharacter(false)', TIMEOUT_DELAY);
    return;
  }

  // Ready to generate
  var fixedAttributes = {};
  if(Quilvyn.randomizeCharacter.win != null) {
    for(i = 0; i < Quilvyn.randomizeCharacter.win.document.frm.elements.length; i++) {
      var element = Quilvyn.randomizeCharacter.win.document.frm.elements[i];
      var name = element.name;
      var value = InputGetValue(element);
      if(element.type=='button' || name==null || value==null || value=='')
        continue;
      if(typeof(value) == 'string' && value.match(/^[\+\-]?\d+$/))
        value -= 0;
      fixedAttributes[name] = value;
    }
    Quilvyn.randomizeCharacter.win.close();
    Quilvyn.randomizeCharacter.win = null;
  }
  character = ruleSet.randomizeAllAttributes(fixedAttributes);
  characterPath = '';
  characterCache[characterPath] = QuilvynUtils.clone(character);
  Quilvyn.refreshEditor(false);
  Quilvyn.refreshSheet();

};

/*
 * Resets the editing window fields to the values of the current character.
 * First redraws the editor if #redraw# is true.
 */
Quilvyn.refreshEditor = function(redraw) {

  var i;

  if(editWindow == null || editWindow.closed) {
    editWindow = quilvynTab != null ? quilvynTab.frames[0] :
                 window.open('', '', FEATURES_OF_EDIT_WINDOW);
    redraw = true;
  }
  if(redraw) {
    var editHtml =
      '<html><head><title>Quilvyn Editor Window</title></head>\n' +
      '<body bgcolor="' + window.BACKGROUND + '">\n' +
      '<img src="' + LOGO_URL + ' "/><br/>\n' +
      COPYRIGHT + '<br/>\n' +
      Quilvyn.editorHtml() + '\n' +
      '</body></html>\n';
    editWindow.document.write(editHtml);
    editWindow.document.close();
    editForm = editWindow.document.forms[0];
    var callback = function() {Quilvyn.update(this);};
    for(i = 0; i < editForm.elements.length; i++) {
      InputSetCallback(editForm.elements[i], callback);
    }
  }

  var characterOpts = [];
  for(var path in STORAGE) {
    if(path.startsWith(PERSISTENT_CHARACTER_PREFIX))
      characterOpts.push(path.substring(PERSISTENT_CHARACTER_PREFIX.length));
  }
  characterOpts = characterOpts.sort();
  characterOpts.unshift(
    '---choose one---', 'New', 'Random...', 'Save', 'Save As...', 'Delete...', 'HTML', 'Import...', 'Export', 'Summary'
  );

  InputSetOptions(editForm.character, characterOpts);
  InputSetOptions(editForm.rules, QuilvynUtils.getKeys(ruleSets));
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
    if(InputGetValue(input) !== value)
      InputSetValue(input, value);
  }

  InputSetValue(editForm.extras, persistentInfo.extras == '1');
  InputSetValue(editForm.hidden, persistentInfo.hidden == '1');
  InputSetValue(editForm.italics, persistentInfo.italics == '1');
  InputSetValue(editForm.rules, ruleSet.getName());
  InputSetValue(editForm.viewer,
                character['viewer'] || window.DEFAULT_SHEET_STYLE);
  editWindow.focus();

};

/* Draws the sheet for the current character in the character sheet window. */
Quilvyn.refreshSheet = function() {
  if(sheetWindow == null || sheetWindow.closed) {
    sheetWindow = window.quilvynTab != null ? quilvynTab.frames[1] :
                  window.open('', '', FEATURES_OF_SHEET_WINDOW);
  }
  sheetWindow.document.write(Quilvyn.sheetHtml(character));
  sheetWindow.document.close();
  sheetWindow.document.title = character.name;
  if(quilvynTab != null)
    quilvynTab.document.title = 'Quilvyn - ' + character.name;
  sheetWindow.focus();
};

/* Creates and returns a character from the contents of a storage path. */
Quilvyn.retrieveCharacterFromStorage = function(path) {
  var result = {};
  var attrs = STORAGE.getItem(path).split('\t');
  for(var i = 0; i < attrs.length; i++) {
    var pieces = attrs[i].split('=', 2);
    if(pieces.length == 2)
      result[pieces[0]] = pieces[1];
  }
  return result;
}

/* Interacts w/user to preserve current character in persistent storage. */
Quilvyn.saveCharacter = function(path) {
  if(path == '') {
    path = editWindow.prompt("Save " + character['name'] + " to path", "");
    if(path == null)
      return;
  }
  character['_path'] = path;
  character['_timestamp'] = Date.now();
  var stringified = '';
  for(var attr in character) {
    stringified += attr + '=' + character[attr] + '\t';
  }
  STORAGE.setItem(PERSISTENT_CHARACTER_PREFIX + path, stringified);
  characterPath = path;
  characterCache[characterPath] = QuilvynUtils.clone(character);
  Quilvyn.refreshEditor(false);
}

/* Returns the character sheet HTML for the current character. */
Quilvyn.sheetHtml = function(attrs) {

  var a;
  var computedAttributes;
  var enteredAttributes = QuilvynUtils.clone(attrs);
  var i;
  var rulesExtras = ruleSet.getChoices('extras') || {};
  var sheetAttributes = {};

  enteredAttributes.hidden = persistentInfo.hidden;
  computedAttributes = ruleSet.applyRules(enteredAttributes);
  var formats = ruleSet.getFormats(ruleSet, InputGetValue(editForm.viewer));
  for(a in computedAttributes) {
    if(a.match(/\.\d+$/))
      continue; // Ignore format multi-values
    var isNote = a.indexOf('Notes') > 0;
    var name = a.replace(/([\w\)])(?=[A-Z\(])/g, '$1 ');
    name = name.substring(0, 1).toUpperCase() + name.substring(1);
    var value = computedAttributes[a];
    if(isNote && value == 0)
      continue; // Suppress notes with zero value
    if(formats[a] != null) {
      value = formats[a].replace(/%V/g, value);
      for(var j = 1; computedAttributes[a + '.' + j] != null; j++) {
        value = value.replace(new RegExp('%' + j, 'g'), computedAttributes[a + '.' + j]);
      }
    } else if(isNote && typeof(value) == 'number') {
      value = QuilvynUtils.signed(value);
    }
    if(persistentInfo.extras == '0' &&
       (a in rulesExtras || a.split('.')[0] in rulesExtras))
      continue;
    if((i = name.indexOf('.')) < 0) {
      sheetAttributes[name] = value;
    } else {
      var object = name.substring(0, i);
      name = name.substring(i + 1, i + 2).toUpperCase() + name.substring(i + 2);
      value = name + ': ' + value;
      if(isNote && ruleSet.isSource(a)) {
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
  if(attrs.notes && attrs.notes.indexOf("+COMPUTE") >= 0) {
    attrImage +=
      'var computed = ' + ObjectViewer.toCode(computedAttributes) + ';\n';
  }

  return '<' + '!' + '-- Generated ' + new Date().toString() +
           ' by Quilvyn version ' + VERSION + '; ' +
           ruleSet.getName() + ' rule set version ' + ruleSet.getVersion() +
           ' --' + '>\n' +
         '<html>\n' +
         '<head>\n' +
         '  <title>' + sheetAttributes.Name + '</title>\n' +
         '  <script>\n' +
         attrImage +
         // Careful: don't want to close quilvyn.html's script tag here!
         '  </' + 'script>\n' +
         '</head>\n' +
         '<body>\n' +
         ruleSet.getViewer(InputGetValue(editForm.viewer)).
           getHtml(sheetAttributes, '_top') + '\n' +
         '</body>\n' +
         '</html>\n';

};

/* Opens a window that contains HTML for #html# in readable/copyable format. */
Quilvyn.showHtml = function(html) {
  if(Quilvyn.showHtml.htmlWindow==null || Quilvyn.showHtml.htmlWindow.closed) {
    Quilvyn.showHtml.htmlWindow =
      window.open('', '', FEATURES_OF_OTHER_WINDOWS);
  }
  html = html.replace(/</g, '&lt;');
  html = html.replace(/>/g, '&gt;');
  Quilvyn.showHtml.htmlWindow.document.write(
    '<html><head><title>HTML</title></head>\n' +
    '<body><pre>' + html + '</pre></body></html>\n'
  );
  Quilvyn.showHtml.htmlWindow.document.close();
  Quilvyn.showHtml.htmlWindow.focus();
};

/* Stores the current values of persistentInfo in the browser. */
Quilvyn.storePersistentInfo = function() {
  for(var a in persistentInfo) {
    STORAGE.setItem(PERSISTENT_INFO_PREFIX + a, persistentInfo[a]);
  }
};

/*
 * Opens a window that displays a summary of the attributes of all characters
 * that have been loaded into the editor.
 */
Quilvyn.summarizeCachedAttrs = function() {
  var combinedAttrs = { };
  var htmlBits = [
    '<head><title>Quilvyn Character Attribute Summary</title></head>',
    '<body bgcolor="' + window.BACKGROUND + '">',
    '<h1>Quilvyn Character Attribute Summary</h1>',
    '<table border="1">'
  ];
  var formats = ruleSet.getFormats(ruleSet, InputGetValue(editForm.viewer));
  for(var character in characterCache) {
    if(character == '')
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
      var format = formats[attr];
      if(format != null)
        value = format.replace(/%V/g, value);
      combinedAttrs[attr].push(value);
    }
  }
  var keys = QuilvynUtils.getKeys(combinedAttrs);
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
  if(Quilvyn.summarizeCachedAttrs.win == null ||
     Quilvyn.summarizeCachedAttrs.win.closed)
    Quilvyn.summarizeCachedAttrs.win =
      window.open('', '', FEATURES_OF_OTHER_WINDOWS);
  else
    Quilvyn.summarizeCachedAttrs.win.focus();
  Quilvyn.summarizeCachedAttrs.win.document.write(htmlBits.join('\n'));
  Quilvyn.summarizeCachedAttrs.win.document.close();
  Quilvyn.summarizeCachedAttrs.win.focus();
};

/* Callback invoked when the user changes the editor value of Input #input#. */
Quilvyn.update = function(input) {

  var name = input.name;
  var value = InputGetValue(input);
  if(value === true)
    value = 1;
  else if(value === false)
    value = 0;
  else if(typeof(value) == 'string' && value.match(/^-?\d+$/))
    value -= 0;
  if(name == 'about') {
    if(Quilvyn.aboutWindow == null || Quilvyn.aboutWindow.closed) {
      Quilvyn.aboutWindow = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
      Quilvyn.aboutWindow.document.write(
        '<html>\n',
        '<head>\n',
        '<title>About Quilvyn</title>\n',
        '</head>\n',
        '<body bgcolor="' + window.BACKGROUND + '">\n',
        ABOUT_TEXT.replace(/\n/g, '<br/>\n<br/>\n'),
        '\n</body>\n',
        '</html>\n'
      );
      Quilvyn.aboutWindow.document.close();
    }
    Quilvyn.aboutWindow.focus();
  } else if(name.match(/^(extras|hidden|italics)$/)) {
    persistentInfo[name] = value ? '1' : '0';
    Quilvyn.storePersistentInfo();
    Quilvyn.refreshSheet();
  } else if(name == 'character') {
    input.selectedIndex = 0;
    if(value == '---select one---')
      ; /* empty--Safari bug workaround */
    else if(value == 'Delete...')
      Quilvyn.deleteCharacter();
    else if(value == 'Save')
      Quilvyn.saveCharacter(characterPath);
    else if(value == 'Save As...')
      Quilvyn.saveCharacter('');
    else if(value == 'Export')
      Quilvyn.exportCharacters();
    else if(value == 'Summary')
      Quilvyn.summarizeCachedAttrs();
    else if(value == 'HTML')
      Quilvyn.showHtml(Quilvyn.sheetHtml(character));
    else if(window.WARN_ABOUT_DISCARD &&
       !QuilvynUtils.clones(character, characterCache[characterPath]) &&
       !editWindow.confirm("Discard changes to character?"))
      ; /* empty */
    else if(value == 'Import...')
      Quilvyn.importCharacters(true);
    else if(value == 'New')
      Quilvyn.newCharacter();
    else if(value == 'Random...')
      Quilvyn.randomizeCharacter(true);
    else
      Quilvyn.openCharacter(value);
  } else if(name == 'help') {
    if(Quilvyn.helpWindow == null || Quilvyn.helpWindow.closed) {
      Quilvyn.helpWindow =
        window.open(HELP_URL, '', FEATURES_OF_OTHER_WINDOWS);
    }
    Quilvyn.helpWindow.focus();
  } else if(name == 'randomize') {
    input.selectedIndex = 0;
    ruleSet.randomizeOneAttribute(character, value);
    Quilvyn.refreshEditor(false);
    Quilvyn.refreshSheet();
  } else if(name == 'rules') {
    ruleSet = ruleSets[value];
    Quilvyn.refreshEditor(true);
    Quilvyn.refreshSheet();
  } else if(name == 'rulesCustomize') {
    input.selectedIndex = 0;
    if(value == 'Add...')
      Quilvyn.customChoicesAdd(true);
    else if(value == 'Delete...')
      Quilvyn.customChoicesDelete();
    else if(value == 'Export')
      Quilvyn.customChoicesExport();
    else if(value == 'Import...')
      Quilvyn.customChoicesImport(true);
  } else if(name == 'rulesNotes') {
    if(Quilvyn.rulesNotesWindow == null || Quilvyn.rulesNotesWindow.closed) {
      Quilvyn.rulesNotesWindow = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
    }
    Quilvyn.rulesNotesWindow.document.write(
      '<html>\n',
      '<head>\n',
      '<title>Rule Notes for ' + InputGetValue(editForm.rules) + '</title>\n',
      '</head>\n',
      '<body bgcolor="' + window.BACKGROUND + '">\n',
      ruleSet.ruleNotes(),
      '\n</body>\n',
      '</html>\n'
    );
    Quilvyn.rulesNotesWindow.document.close();
    Quilvyn.rulesNotesWindow.focus();
  } else if(name == 'ruleRules') {
    var awin = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
    awin.document.write
      ('<html><head><title>RULES</title></head><body><pre>\n');
    awin.document.write(ruleSet.toHtml());
    awin.document.write('</pre></body></html>');
    awin.document.close();
    awin.focus();
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
    Quilvyn.refreshEditor(false);
    Quilvyn.refreshSheet();
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
    Quilvyn.refreshEditor(false);
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
    if(!value && (value === '' || input.type == 'checkbox'))
      delete character[name];
    else if(typeof(value) == 'string' &&
            value.match(/^\+-?\d+$/) &&
            (typeof(character[name]) == 'number' ||
             (typeof(character[name]) == 'string' &&
              character[name].match(/^\d+$/)))) {
      character[name] = (character[name] - 0) + (value.substring(1) - 0);
      InputSetValue(input, character[name]);
    }
    else
      character[name] = value;
    Quilvyn.refreshSheet();
    if(name.search(/^(levels|domains)\./) >= 0)
      Quilvyn.refreshEditor(false);
  }

};
