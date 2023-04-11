/*jshint esversion: 6 */
/* jshint forin: false */
"use strict";

var COPYRIGHT = 'Copyright 2022 James J. Hayes';
var VERSION = '2.3.19';
var ABOUT_TEXT =
'Quilvyn RPG Character Editor version ' + VERSION + '\n' +
'The Quilvyn RPG Character Editor is ' + COPYRIGHT + '\n' +
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
'All trademarks used by Quilvyn are the property of their respective ' +
'owners.\n' +
'Parchment background from <a href="http://www.myfreetextures.com">myfreetextures.com</a>, ' +
'used under the terms of the <a href="https://www.myfreetextures.com/use-license/">MyFreeTextures License</a>.\n' +
'See the individual rule set notes for additional copyright information.\n' +
'Quilvyn source files can be found on ' +
'<a href="http://www.github.com/jodaf">the Quilvyn github repository</a>. ' +
'Questions, bug reports, and change requests can be submitted on github or ' +
'emailed to quilvyn' + '@' + 'jodaf.com.\n' +
'Thanks to my dungeon crew, especially Rich Hakesley, Norm Jacobson, and ' +
'Caroline Rider, for patient testing of Quilvyn and for suggestions that have '+
'greatly improved it. Special thanks to Avalon Hayes for the name and logo artwork.';

var FEATURES_OF_EDIT_WINDOW =
  'height=750,width=500,menubar,resizable,scrollbars';
var FEATURES_OF_SHEET_WINDOW =
  'height=750,width=750,menubar,resizable,scrollbars,toolbar';
var FEATURES_OF_OTHER_WINDOWS =
  'height=750,width=750,menubar,resizable,scrollbars,toolbar';
var PERSISTENT_CHARACTER_PREFIX = 'QuilvynCharacter.';
var PERSISTENT_CUSTOM_PREFIX = 'QuilvynCustom.';
var PERSISTENT_CUSTOM_PLACEHOLDER = '_user';
var PERSISTENT_INFO_PREFIX = 'QuilvynInfo.';
var TIMEOUT_DELAY = 1000; // One second
// Use system dialog windows whenever possible?
// TODO: Googling indicates that user disable of system dialogs can be detected
// by timing how quickly confirm and alert return, in response to which we
// could fall back to using our generated dialogs.
var USE_SYSTEM_DIALOGS = true;
// HTML tags allowed in user input; 's' and 'u' allowed though HTML deprecated
const ALLOWED_TAGS = [
  'b', 'div', 'i', 'li', 'ol', 'p', 'sub', 'sup', 'table', 'td', 'th', 'tr',
  'ul', 's', 'u'
];

var character = {};     // Displayed character attrs
var characterCache = {};// Attrs of all displayed characters, indexed by path
var characterPath = ''; // Path to most-recently opened/generated character
var characterUndo = []; // Stack of copies of character for undoing changes
var customCollection = null; // Name of current custom item collection
var customCollections = {}; // Defined custom collections, indexed by name
var editWindow = null;  // iframe or window where editor is shown
var ruleSet = null;     // The rule set currently in use
var ruleSets = {};      // Registered rule sets, indexed by name
var quilvynWindow = null; // Quilvyn container window
var secondWindow = null;// Container window for separate editor
var sheetWindow = null; // iframe or window where character sheet is shown
var statusWindow = null;// iframe or window where character status is shown
var userOptions = {     // User-settable options
  bgColor: 'wheat',     // Window background color
  bgImage: 'Images/parchment.jpg', // URL for window background
  sheetImage: '',       // URL for character sheet background
  textColor: 'black',   // Window text color
  extras: 1,            // Show extra attributes on sheet?
  hidden: 0,            // Show information marked "hidden" on sheet?
  italics: 1,           // Show italicized notes on sheet?
  validation: 0,        // Show validation errors and warnings on sheet?
  separateEditor: 0,    // Display editor in separate window?
  spell: 'Slots',       // Display spell slots, points, or both
  style: 'Standard',    // Sheet style
  warnAboutDiscard: 1   // Warn before discarding character changes?
};

/* Launch routine called after all Quilvyn scripts are loaded. */
function Quilvyn(win) {

  if(InputGetValue == null || ObjectViewer == null || RuleEngine == null ||
     QuilvynRules == null || QuilvynUtils == null) {
    alert('JavaScript modules needed by Quilvyn are missing; exiting');
    return;
  }

  for(var a in userOptions) {
    var stored = STORAGE.getItem(PERSISTENT_INFO_PREFIX + a);
    if(stored)
      userOptions[a] = stored.match(/^\d+$/) ? stored - 0 : stored;
  }

  for(var path in STORAGE) {
    if(!path.startsWith(PERSISTENT_CUSTOM_PREFIX))
      continue;
    customCollections[path.split('.')[1].replaceAll('%2E', '.')] = '';
  }

  quilvynWindow = win;
  if(!Quilvyn.redrawUI())
    return;
  Quilvyn.refreshEditor(true);
  Quilvyn.newCharacter(true);

}

Quilvyn.confirmDialog = function(prmpt, callback) {

  if(USE_SYSTEM_DIALOGS) {
    if(confirm(prmpt))
      callback(true);
    return;
  }
  if(Quilvyn.confirmDialog.win == null) {
    var htmlBits = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<title>' + prmpt + '</title>',
      '</head>',
      '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
      LOGO_TAG + '<br/>',
      '<h3>' + prmpt + '</h3>',
      '<input type="button" name="ok" value="Ok" onclick="okay=true;"/>',
      '<input type="button" value="Cancel" onclick="canceled=true;"/>',
      '</body></html>'
    ];
    Quilvyn.confirmDialog.win = editWindow;
    Quilvyn.confirmDialog.win.document.write(htmlBits.join('\n') + '\n');
    Quilvyn.confirmDialog.win.document.close();
    Quilvyn.confirmDialog.win.canceled = false;
    Quilvyn.confirmDialog.win.okay = false;
    Quilvyn.confirmDialog.win.callback = callback;
    Quilvyn.confirmDialog.win.document.getElementsByName('ok')[0].focus();
    setTimeout('Quilvyn.confirmDialog(null)', TIMEOUT_DELAY);
    return;
  } else if(Quilvyn.confirmDialog.win.canceled) {
    // User cancel
    Quilvyn.confirmDialog.win = null;
    Quilvyn.refreshEditor(true);
    return;
  } else if(!Quilvyn.confirmDialog.win.okay) {
    // Try again later
    setTimeout('Quilvyn.confirmDialog(null)', TIMEOUT_DELAY);
    return;
  }

  callback = Quilvyn.confirmDialog.win.callback;
  Quilvyn.confirmDialog.win = null;
  Quilvyn.refreshEditor(true);
  callback(true);

};

/*
 * Interacts with the user to select a subset of available options. #prmpt#
 * labels the dialog and #choices# is a dictionary of items, the keys of which
 * are shown to the user for selection. Once the user has made selections, the
 * subset of #choices# selected by the user is passed to #callback#.
 */
Quilvyn.setDialog = function(prmpt, choices, callback) {

  if(Quilvyn.setDialog.win == null) {
    var htmlBits = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<title>' + prmpt + '</title>',
      '</head>',
      '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
      LOGO_TAG + '<br/>',
      '<h3>' + prmpt + '</h3>',
      '<form onsubmit="return false"><table>'
    ];
    var keys = Object.keys(choices).sort();
    for(var i = 0; i < keys.length; i++) {
      var choice = keys[i];
      htmlBits.push(
        '<tr><td>' + InputHtml(choices[choice], 'checkbox', [choice]) + '</td></tr>'
      );
    }
    htmlBits.push(
      '</table></form>',
      '<input type="button" name="ok" value="Ok" onclick="okay=true;"/>',
      '<input type="button" value="Cancel" onclick="canceled=true;"/>',
      '</body></html>'
    );
    Quilvyn.setDialog.win = editWindow;
    Quilvyn.setDialog.win.document.write(htmlBits.join('\n') + '\n');
    Quilvyn.setDialog.win.document.close();
    Quilvyn.setDialog.win.canceled = false;
    Quilvyn.setDialog.win.okay = false;
    Quilvyn.setDialog.win.callback = callback;
    Quilvyn.setDialog.win.document.getElementsByName('ok')[0].focus();
    setTimeout('Quilvyn.setDialog()', TIMEOUT_DELAY);
    return;
  } else if(Quilvyn.setDialog.win.canceled) {
    // User cancel
    Quilvyn.setDialog.win = null;
    Quilvyn.refreshEditor(true);
    return;
  } else if(!Quilvyn.setDialog.win.okay) {
    // Try again later
    setTimeout('Quilvyn.setDialog()', TIMEOUT_DELAY);
    return;
  }

  var form = Quilvyn.setDialog.win.document.forms[0];
  choices = {};
  for(var i = 0; i < form.elements.length; i++) {
    if(form.elements[i].checked)
      choices[form.elements[i].value] = form.elements[i].name;
  }

  callback = Quilvyn.setDialog.win.callback;
  Quilvyn.setDialog.win = null;
  Quilvyn.refreshEditor(true);
  callback(choices);

};

/*
 * Interacts with the user to input a single line of text. #prmpt# is used to
 * label the dialog, #defaultValue# is displayed as the default value for
 * the text, and #error#, if specified, is shown as an error in the default
 * value. If true, multiline indicates that a text box should be used for
 * the prompt rather than a single-line text input. Once the user has entered
 * text, it is passed as a parameter to #callback#.
 */
Quilvyn.textDialog = function(prmpt, multiline, defaultValue, error, callback) {

  if(Quilvyn.textDialog.win == null && USE_SYSTEM_DIALOGS && !multiline) {
    if(error)
      alert(error);
    var value = prompt(prmpt, defaultValue);
    if(value != null)
      callback(value);
    return;
  }
  if(Quilvyn.textDialog.win == null) {
    var htmlBits = [
      '<!DOCTYPE html>',
      '<html lang="en">' +
      '<head>' +
      '<title>' + prmpt + '</title></head>',
      '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
      LOGO_TAG + '<br/>',
      '<h3>' + prmpt + '</h3>',
      '<table>',
      multiline ?
        '<tr><td><textarea name="text" rows="20" cols="50">' + defaultValue + '</textarea></td></tr>' :
        '<tr><td><input name="text" type="text" value="' + defaultValue + '" size="50"/></td></tr>',
      '<tr><td style="color:red">' + (error ? error : '') + '</td></tr>',
      '</table>',
      '<input type="button" name="ok" value="Ok" onclick="okay=true;"/>',
      '<input type="button" value="Cancel" onclick="canceled=true;"/>',
      '</body>' +
      '</html>'
    ];
    Quilvyn.textDialog.win = editWindow;
    Quilvyn.textDialog.win.document.write(htmlBits.join('\n') + '\n');
    Quilvyn.textDialog.win.document.close();
    Quilvyn.textDialog.win.canceled = false;
    Quilvyn.textDialog.win.okay = false;
    Quilvyn.textDialog.win.callback = callback;
    Quilvyn.textDialog.win.document.getElementsByName('text')[0].focus();
    setTimeout('Quilvyn.textDialog()', TIMEOUT_DELAY);
    return;
  } else if(Quilvyn.textDialog.win.canceled) {
    // User cancel
    Quilvyn.textDialog.win = null;
    Quilvyn.refreshEditor(true);
    return;
  } else if(!Quilvyn.textDialog.win.okay) {
    // Try again later
    setTimeout('Quilvyn.textDialog()', TIMEOUT_DELAY);
    return;
  }

  callback = Quilvyn.textDialog.win.callback;
  defaultValue =
    Quilvyn.textDialog.win.document.getElementsByName('text')[0].value;
  Quilvyn.textDialog.win = null;
  Quilvyn.refreshEditor(true);
  callback(defaultValue);

};

/* Adds #rs# to Quilvyn's list of supported rule sets. */
Quilvyn.addRuleSet = function(rs) {
  // Add a rule for handling hidden information
  rs.defineRule('hiddenNotes', 'hidden', '?', null);
  ruleSets[rs.getName()] = rs;
  ruleSet = rs;
  customCollection = rs.getName();
  customCollections[customCollection] = '';
  var prefix =
    PERSISTENT_CUSTOM_PREFIX + customCollection.replaceAll('.', '%2E') + '.';
  for(var path in STORAGE) {
    if(!path.startsWith(prefix))
      continue;
    var pieces = path.split('.');
    ruleSet.choiceRules(
      ruleSet, pieces[2].replaceAll('%2E', '.'),
      pieces[3].replaceAll('%2E', '.'), STORAGE.getItem(path)
    );
  }
};

/* Returns HTML attributes for Quilvyn's windows body tags. */
Quilvyn.htmlBackgroundAttr = function() {
  var result = 'style="background-color:' + userOptions.bgColor;
  if(userOptions.bgImage) {
    result += '; background-image:url(' + userOptions.bgImage;
    if(!result.match(/\.\w+$/))
      result += '.jpg';
    result += ')';
  }
  result += '; color:' + userOptions.textColor + '"';
  return result;
};

/*
 * Returns #note#, rephrased and expanded using the dictionary #attrs#, into a
 * more user-readable form.
 */
Quilvyn.clarifiedValidationNote = function(name, note, attrs) {
  note = note.split('').reverse().join('')
             .replace('||', ' ro ')
             .replace('/', ' dna ')
             .split('').reverse().join('')
             .replace(/\s*(\|\||\/)\s*/g, ', ')
             .replaceAll('=~', ' matches ')
             .replaceAll('!~', ' does not match ')
             .replace(/\s+,\s*/g, ', ')
             .replace(/\s\s+/g, ' ')
             .replace('%V', attrs[name])
             .replace(/\s*(>\s*0|>=\s*1)\b/g, '');
  for(var i = 0; i < 9; i++)
    note = note.replace('%' + i, attrs[name + '.' + i]);
  var m = note.match(/[a-z]\w*(\.[A-Z]\w*([-\s]\(?[A-Z]\w+\)?)*)?/g);
  if(m) {
    for(var i = 0; i < m.length; i++) {
      var ref = m[i];
      var replacement = ref.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
      if(replacement.includes('.')) {
        replacement = replacement.split('.');
        replacement = replacement[1] + ' ' + replacement[0].replace(/s$/, '');
      }
      if(attrs[ref])
        replacement += ' (currently ' + attrs[ref] + ')';
      note = note.replace(ref, replacement);
    }
  }
  return note;
};

/* Interacts with the user to add custom items to the current collection. */
Quilvyn.customAddRules = function() {

  if(Quilvyn.customAddRules.win == null) {
    // New custom add
    var choices = QuilvynUtils.getKeys(ruleSet.getChoices('choices'));
    var htmlBits = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<title>Add House Rules</title></head>',
      '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
      LOGO_TAG + '<br/>',
      '<form onsubmit="return false"><table><tr>',
      '<th>Type</th><td>' + InputHtml('_type', 'select-one', choices).replace('>', ' onchange="update=true">') + '</td>',
      '</tr><tr>',
      '<th>Name</th><td>' + InputHtml('_name', 'text', [30]) + '</td>',
      '</tr></table>',
      '<hr style="width:25%;text-align:center"/>',
      '<table id="variableFields">',
      '</table>',
      '<input type="button" name="Add" value="Add" onclick="okay=true;"/>',
      '<input type="button" name="Close" value="Close" onclick="done=true;"/>',
      '<p id="message"> </p>',
      '</form>',
      '</body>',
      '</html>'
    ];
    Quilvyn.customAddRules.win = editWindow;
    Quilvyn.customAddRules.win.document.write(htmlBits.join('\n') + '\n');
    Quilvyn.customAddRules.win.document.close();
    Quilvyn.customAddRules.win.canceled = false;
    Quilvyn.customAddRules.win.done = false;
    Quilvyn.customAddRules.win.update = true;
    Quilvyn.customAddRules.win.document.getElementsByName('_type')[0].focus();
    Quilvyn.customAddRules();
    return;
  } else if(Quilvyn.customAddRules.win.done) {
    // User done making additions
    Quilvyn.customAddRules.win = null;
    Quilvyn.refreshEditor(true);
    return;
  } else if(!Quilvyn.customAddRules.win.okay) {
    // Try again later, after updating the input fields as necessary
    if(Quilvyn.customAddRules.win.update) {
      var typeInput =
        Quilvyn.customAddRules.win.document.getElementsByName('_type')[0];
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
      Quilvyn.customAddRules.win.document.getElementById('variableFields').innerHTML = htmlBits.join('\n');
      Quilvyn.customAddRules.win.update = false;
    }
    setTimeout('Quilvyn.customAddRules()', TIMEOUT_DELAY);
    return;
  }

  // Ready to add a custom item
  var inputForm = Quilvyn.customAddRules.win.document.forms[0];
  var attrs = [];
  var name = '';
  var type = '';
  for(i = 0; i < inputForm.elements.length; i++) {
    var input = inputForm.elements[i];
    var inputName = input.name;
    var inputValue = InputGetValue(input);
    if(inputName == '_name')
      // For consistency with text attrs, allow optional quotes around name
      name = inputValue.replace(/^(['"])(.*)\1$/, '$2');
    else if(inputName == '_type')
      type = inputValue;
    else if(inputName == 'Add' || inputName == 'Close')
      continue;
    else {
      // Quote values that contain spaces.
      var tokens = (inputValue + '').match(/'[^']*'|"[^"]*"|[^,]+|,/g);
      if(tokens) {
        inputValue = '';
        for(var j = 0; j < tokens.length; j++) {
          var token = tokens[j];
          if(token.charAt(0) == '"' || token.charAt(0) == "'" ||
             token.indexOf(' ') < 0)
            inputValue += tokens[j];
          else if(token.indexOf('"') >= 0)
            inputValue += "'" + token + "'";
          else
            inputValue += '"' + token + '"';
        }
      }
      if(inputValue != '')
        attrs.push(inputName + '=' + inputValue);
    }
  }
  attrs = attrs.join(' ');
  STORAGE.setItem(
    PERSISTENT_CUSTOM_PREFIX +
    customCollection.replaceAll('.', '%2E') + '.' +
    type.replaceAll('.', '%2E') + '.' +
    name.replaceAll('.', '%2E'), attrs
  );
  Quilvyn.customAddRules.win.document.getElementById('message').innerHTML =
    'Added ' + type + ' ' + name + ' to custom collection ' + customCollection;

  Quilvyn.customAddRules.win.okay = false;
  if(customCollection == ruleSet.getName()) {
    ruleSet.choiceRules(ruleSet, type, name, attrs);
  }
  setTimeout('Quilvyn.customAddRules()', TIMEOUT_DELAY);
  return;

};

/* Applies the current custom collection to the current rule set. */
Quilvyn.customApplyCollection = function() {
  var prefix =
    PERSISTENT_CUSTOM_PREFIX + customCollection.replaceAll('.', '%2E') + '.';
  for(var path in STORAGE) {
    if(!path.startsWith(prefix))
      continue;
    var pieces = path.split('.');
    if(pieces[2] != PERSISTENT_CUSTOM_PLACEHOLDER)
      ruleSet.choiceRules(ruleSet, pieces[2].replaceAll('%2E', '.'), pieces[3].replaceAll('%2E', '.'), STORAGE.getItem(path));
  }
  Quilvyn.refreshEditor(true);
};

/*
 * Interacts with the user to remove one or more custom collections and all
 * items in them.
 */
Quilvyn.customDeleteCollections = function(collections) {

  if(!collections) {
    Quilvyn.setDialog(
      'Select collections to delete', customCollections,
       Quilvyn.customDeleteCollections
    );
    return;
  }

  for(var c in collections) {
    var prefix = PERSISTENT_CUSTOM_PREFIX + c.replaceAll('.', '%2E') + '.';
    for(var path in STORAGE) {
      if(path.startsWith(prefix))
        STORAGE.removeItem(path);
    }
    if(!(c in ruleSets))
      delete customCollections[c];
    if(customCollection == c)
      customCollection = ruleSet.getName();
  }

  Quilvyn.refreshEditor(true);

};

/*
 * Interacts with the user to delete one or more custom items from the current
 * collection.
 */
Quilvyn.customDeleteRules = function(items) {

  var path;
  var prefix =
    PERSISTENT_CUSTOM_PREFIX + customCollection.replaceAll('.', '%2E') + '.';

  if(!items) {
    items = {};
    for(path in STORAGE) {
      if(path.startsWith(prefix) &&
         path.split('.')[2] != PERSISTENT_CUSTOM_PLACEHOLDER)
        items[path.substring(prefix.length).replace('.', ' ').replaceAll('%2E', '.')] = path;
    }
    Quilvyn.setDialog
      ('Select items to delete', items, Quilvyn.customDeleteRules);
    return;
  }

  for(path in items)
    STORAGE.removeItem(items[path]);

  Quilvyn.refreshEditor(true);

};

/*
 * Displays all custom items in a format that can be imported into Quilvyn.
 */
Quilvyn.customExportCollections = function() {
  var htmlBits = [];
  for(var path in STORAGE) {
    if(!path.startsWith(PERSISTENT_CUSTOM_PREFIX))
      continue;
    var pieces = path.split('.');
    for(var i = 1; i <= 3; i++) {
      var quote = pieces[i].indexOf(' ') < 0 ? '' : pieces[i].indexOf('"') < 0 ? '"' : "'";
      pieces[i] = quote + pieces[i].replaceAll('%2E', '.') + quote;
    }
    var text = '_collection=' + pieces[1] + ' _type=' + pieces[2] + ' _name=' + pieces[3] + ' ' + STORAGE.getItem(path).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    htmlBits.push(text);
  }
  htmlBits.sort();
  htmlBits.unshift(
    '<!DOCTYPE html>',
    '<html lang="en">' +
    '<head>' +
    '<title>Export House Rules</title>' +
    '</head>',
    '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
    LOGO_TAG + '<br/>',
    '<pre>'
  );
  htmlBits.push('</pre>', '</body>', '</html>');
  var exportPopup = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
  exportPopup.document.write(htmlBits.join('\n') + '\n');
  exportPopup.document.close();
  exportPopup.focus();
};

/*
 * Interacts with the user to import a set of custom items into the current
 * collection.
 */
Quilvyn.customImportCollections = function(collections) {

  if(!collections) {
    Quilvyn.textDialog(
      'Enter item definitions from export', true, '', '',
      Quilvyn.customImportCollections
    );
    return;
  }

  var lines = collections.split('\n');

  while(lines.length > 0) {
    var line = lines.pop();
    if(line.match(/^\s*$/))
      continue;
    var collection = QuilvynUtils.getAttrValue(line, '_collection');
    var name = QuilvynUtils.getAttrValue(line, '_name');
    var type = QuilvynUtils.getAttrValue(line, '_type');
    if(!collection || !name || !type) {
      Quilvyn.textDialog(
        'Enter item definitions from export', true,
        line + '\n' + lines.join('\n'), 'Bad format for item "' + line + '"',
        Quilvyn.customImportCollections
      );
      return;
    }
    line = line.replace
      (new RegExp('_collection=["\']?' + collection + '["\']?'), '');
    line = line.replace(new RegExp('_name=["\']?' + name + '["\']?'), '');
    line = line.replace(new RegExp('_type=["\']?' + type + '["\']?'), '');
    line = line.replace(/^\s+|\s+$/g, '');
    STORAGE.setItem(
      PERSISTENT_CUSTOM_PREFIX +
      collection.replaceAll('.', '%2E') + '.' +
      type.replaceAll('.', '%2E') + '.' +
      name.replaceAll('.', '%2E'), line
    );
    customCollections[collection] = '';
    if(collection in ruleSets)
      ruleSets[collection].choiceRules(ruleSets[collection], type, name, line);
  }

  Quilvyn.refreshEditor(true);

};

/* Interacts with the user to define a new custom item collection. */
Quilvyn.customNewCollection = function(name) {

  if(!name) {
    Quilvyn.textDialog
      ('Enter new collection name', false ,'', '', Quilvyn.customNewCollection);
    return;
  }

  if(!(name in customCollections)) {
    customCollection = name;
    customCollections[name] = '';
    STORAGE.setItem(
      PERSISTENT_CUSTOM_PREFIX +
      name.replaceAll('.', '%2E') + '.' +
      PERSISTENT_CUSTOM_PLACEHOLDER + '.' +
      name.replaceAll('.', '%2E'), ''
    );
  }
  Quilvyn.refreshEditor(true);

};

/* Interacts with the user to delete characters from persistent storage. */
Quilvyn.deleteCharacters = function(characters) {

  var path;

  if(!characters) {
    characters = {};
    for(var path in STORAGE) {
      if(path.startsWith(PERSISTENT_CHARACTER_PREFIX))
        characters[path.substring(PERSISTENT_CHARACTER_PREFIX.length)] = path;
    }
    Quilvyn.setDialog
      ('Select characters to delete', characters, Quilvyn.deleteCharacters);
    return;
  }

  for(var c in characters)
    STORAGE.removeItem(PERSISTENT_CHARACTER_PREFIX + c);
  Quilvyn.refreshEditor(true);

};

/* Returns HTML for the character editor form. */
Quilvyn.editorHtml = function() {
  var quilvynElements = [
    ['about', ' ', 'button', ['About']],
    ['help', '', 'button', ['Help']],
    ['options', '', 'button', ['Options']],
    ['rules', 'Rules', 'select-one', []],
    ['rulesNotes', '', 'button', ['Notes']],
    ['custom', 'House Rules', 'select-one', [
      'New Collection...', 'Delete Collections...', 'View/Export All',
      'Import...', 'Add Rules...', 'Delete Rules...', 'Apply Collection'
    ]],
    ['character', 'Character', 'select-one', []],
    ['clear', 'Clear', 'select-one', 'bags'],
    ['randomize', 'Randomize', 'select-one', 'random']
  ];
  if(window.location.href.includes('RulesButton')) {
    quilvynElements.splice(5, 0, ['ruleRules', '', 'button', ['Rules']]);
  }
  var elements = quilvynElements.concat(ruleSet.getEditorElements());
  var htmlBits = ['<form name="editor"><table>'];
  var i;
  var bagNames = [];
  for(i = 0; i < elements.length; i++)
    if(elements[i][2].match(/bag|set/))
      // Set options to combined attr and label; refreshEditor will split them
      // once the widget is created.
      bagNames.push(elements[i][0] + ',' + elements[i][1]);
  bagNames.sort();
  for(i = 0; i < elements.length; i++) {
    var element = elements[i];
    var label = element[1];
    var name = element[0];
    var params = element[3];
    var type = element[2];
    if(params == 'bags') {
      params = ['---choose one---'].concat(bagNames);
    } else if(typeof(params) == 'string') {
      if(ruleSet.getChoices(params) == null)
        continue;
      params = QuilvynUtils.getKeys(ruleSet.getChoices(params));
      if(name == 'randomize') {
        // Set options to combined attr and label; refreshEditor will split
        // them once the widget is created.
        for(var j = 0; j < params.length; j++)
          params[j] += ',' + params[j].charAt(0).toUpperCase() + params[j].substring(1).replace(/([a-z])([A-Z])/g, '$1 $2');
        params = ['---choose one---'].concat(params);
      }
    }
    if(label != '' || i == 0) {
      if(i > 0) {
        htmlBits.push('</td></tr>');
      }
      if(name == 'character')
        htmlBits.push('<tr><td colspan=2><hr/></td></tr>');
      htmlBits.push('<tr><th>' + label + '</th><td>');
    }
    if(type.match(/bag|set/)) {
      var widget = type.match(/bag/) ?
        InputHtml(name, 'text', [3, '(\\+?\\d+)?']) :
        InputHtml(name, 'checkbox', null);
      var needSub = params.filter(x => x.includes('(')).length > 0;
      // Intially put full parameter list, including sub-options, into _sel.
      // refreshEditor will handle splitting the values later.
      // Note: Inner table needed to prevent line break between _sel and _sub?!?
      htmlBits.push(
        '  <table><tr><td>' +
        InputHtml(name + '_sel', 'select-one', params) +
        (needSub ? '</td><td>' + InputHtml(name + '_sub', 'select-one', ['...']) : '') +
        (type.match(/setbag/) ? '</td><td>' + InputHtml(name+'_chk', 'checkbox', null) : '') +
        '</td><td>' + widget + '</td></tr></table>' +
        (type.charAt(0)=='f' ? '</td></tr><tr><th>Filter</th><td>' + InputHtml(name + '_filter', 'text', [15]) : '')
      );
    } else {
      htmlBits.push('  ' + InputHtml(name, type, params));
    }
  }
  htmlBits.push('</td></tr>', '</table>', '</form>');
  return htmlBits.join('\n');
};

/* Pops a window containing the attribues of all stored characters. */
Quilvyn.exportCharacters = function() {
  var htmlBits = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<title>Export Characters</title>',
    '<style>',
    '  table {border-spacing:0}',
    '  td {padding:0}',
    '</style>',
    '</head>',
    '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
    LOGO_TAG + '<br/>'];
  for(var path in STORAGE) {
    if(!path.startsWith(PERSISTENT_CHARACTER_PREFIX))
      continue;
    var toExport = Quilvyn.retrieveCharacterFromStorage(path);
    // In case character saved before _path attr use
    toExport['_path'] = path.substring(PERSISTENT_CHARACTER_PREFIX.length);
    var text = ObjectViewer.toCode(toExport).
      replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    htmlBits.push('<pre>\n' + text + '\n</pre><br/>\n');
  }
  htmlBits.push('</body>', '</html>');
  var exportPopup = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
  exportPopup.document.write(htmlBits.join('\n') + '\n');
  exportPopup.document.close();
  exportPopup.focus();
};

/* Interacts with the user to import characters from external sources. */
Quilvyn.importCharacters = function(attributes) {

 if(attributes == null &&
    userOptions.warnAboutDiscard &&
    !QuilvynUtils.clones(character, characterCache[characterPath])) {
    Quilvyn.confirmDialog
      ('Discard changes to character?', Quilvyn.importCharacters)
    return;
  }

  if(attributes == null || attributes === true) {
    Quilvyn.textDialog(
      'Enter attribute definition from character sheet source', true, '', '',
      Quilvyn.importCharacters
    );
    return;
  }

  var index = attributes.indexOf('{');

  if(index < 0) {
    Quilvyn.textDialog(
      'Enter attribute definition from character sheet source', true,
      attributes, 'Syntax error: missing {', Quilvyn.importCharacters
    );
    return;
  }

  while(index >= 0) {
    attributes = attributes.substring(index + 1);
    var attrPat = /^\s*"((?:\\"|[^"])*)"\s*:\s*(\d+|"((?:\\"|[^"])*)"|\{)/;
    var matchInfo;
    var nesting = '';
    var importedCharacter = {};
    while((matchInfo = attributes.match(attrPat)) != null) {
      attributes = attributes.substring(matchInfo[0].length);
      var attr = matchInfo[1];
      var value =
        typeof matchInfo[3] == "undefined" ? matchInfo[2] : matchInfo[3];
      value = value.replace(/\\"/g, '"').replace(/\\n/g, '\n');
      if(value == '{') {
        nesting += attr + '.';
      } else {
        importedCharacter[nesting + attr] = value;
      }
      while(nesting != '' && (matchInfo = attributes.match(/^\s*\}/)) != null) {
        attributes = attributes.substring(matchInfo[0].length);
        nesting = nesting.replace(/[^\.]*\.$/, '');
      }
      if((matchInfo = attributes.match(/^\s*,/)) != null) {
        attributes = attributes.substring(matchInfo[0].length);
      }
    }
    if(!attributes.match(/^\s*\}/)) {
      Quilvyn.textDialog(
        'Enter attribute definition from character sheet source', true,
        attributes, 'Syntax error: missing }', Quilvyn.importCharacters
      );
      return;
    }
    character = Object.assign({}, importedCharacter);
    characterPath = character['_path'] || '';
    characterUndo = [];
    characterCache[characterPath] = QuilvynUtils.clone(character);
    Quilvyn.saveCharacter(characterPath);
    index = attributes.indexOf('{');
  }

  Quilvyn.refreshEditor(true);
  Quilvyn.refreshSheet();
  Quilvyn.refreshStatus(false);

};

/* Interacts with the user to change display options. */
Quilvyn.modifyOptions = function() {

  if(Quilvyn.modifyOptions.win == null) {
    // New modify
    var htmlBits = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<title>Quilvyn Options</title>',
      '</head>',
      '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
      '<h2>Quilvyn Options</h2>',
      '<form name="frm" onsubmit="return false"><table>',
      '<tr style="display:none"><td><b>Background Color</b></td><td>' + InputHtml('bgColor', 'text', [20]) + '</td></tr>',
      '<tr><td><b>Editor Background Image URL</b></td><td>' + InputHtml('bgImage', 'text', [30]) + '</td></tr>',
      '<tr><td><b>Sheet Background Image URL</b></td><td>' + InputHtml('sheetImage', 'text', [30]) + '</td></tr>',
      '<tr style="display:none"><td><b>Text Color</b></td><td>' + InputHtml('textColor', 'text', [20]) + '</td></tr>',
      '<tr><td><b>Separate Editor</b></td><td>' + InputHtml('separateEditor', 'checkbox', null) + '</td></tr>',
      '<tr><td><b>Show Extras</b></td><td>' + InputHtml('extras', 'checkbox', null) + '</td></tr>',
      '<tr><td><b>Show Hidden</b></td><td>' + InputHtml('hidden', 'checkbox', null) + '</td></tr>',
      '<tr><td><b>Show Italic Notes</b></td><td>' + InputHtml('italics', 'checkbox', null) + '</td></tr>',
      '<tr><td><b>Show Validation Notes</b></td><td>' + InputHtml('validation', 'checkbox', null) + '</td></tr>',
      '<tr><td><b>Show Spell</b></td><td>' + InputHtml('spell', 'select-one', ['Points', 'Slots', 'Both']) + '</td></tr>',
      '<tr><td><b>Sheet Style</b></td><td>' + InputHtml('style', 'select-one', ruleSet.getViewerNames()) + '</td></tr>',
      '<tr><td><b>Warn About Discard</b></td><td>' + InputHtml('warnAboutDiscard', 'checkbox', null) + '</td></tr>',
      '</table></form>',
      '<input type="button" name="ok" value="Ok" onclick="okay=true;"/>',
      '<input type="button" value="Cancel" onclick="canceled=true;"/>',
      '</body>',
      '</html>'
    ];
    Quilvyn.modifyOptions.win = editWindow;
    Quilvyn.modifyOptions.win.document.write(htmlBits.join('\n') + '\n');
    Quilvyn.modifyOptions.win.document.close();
    Quilvyn.modifyOptions.win.canceled = false;
    Quilvyn.modifyOptions.win.okay = false;
    Quilvyn.modifyOptions.win.document.getElementsByName('ok')[0].focus();
    for(var opt in userOptions) {
      InputSetValue
        (Quilvyn.modifyOptions.win.document.frm[opt], userOptions[opt]);
    }
    setTimeout('Quilvyn.modifyOptions()', TIMEOUT_DELAY);
    return;
  } else if(Quilvyn.modifyOptions.win.canceled) {
    // User cancel
    Quilvyn.modifyOptions.win = null;
    Quilvyn.refreshEditor(true);
    return;
  } else if(!Quilvyn.modifyOptions.win.okay) {
    // Try again later
    setTimeout('Quilvyn.modifyOptions()', TIMEOUT_DELAY);
    return;
  }

  // Ready to modify
  var oldSeparateEditor = userOptions.separateEditor;
  var form = Quilvyn.modifyOptions.win.document.frm;
  for(var option in userOptions) {
    var value = InputGetValue(form[option]);
    userOptions[option] = value === true ? 1 : value === false ? 0 : value;
  }
  Quilvyn.modifyOptions.win = null;
  Quilvyn.storePersistentInfo();
  if(userOptions.separateEditor != oldSeparateEditor)
    Quilvyn.redrawUI();
  Quilvyn.refreshEditor(true);
  Quilvyn.refreshSheet();
  Quilvyn.refreshStatus(false);

};

/* Loads character specified by #path# from persistent storage. */
Quilvyn.openCharacter = function(path) {
  if(path === true) {
    path = Quilvyn.openCharacter.savedPath;
  } else if(
    userOptions.warnAboutDiscard &&
    !QuilvynUtils.clones(character, characterCache[characterPath])) {
    Quilvyn.openCharacter.savedPath = path;
    Quilvyn.confirmDialog
      ('Discard changes to character?', Quilvyn.openCharacter);
    return;
  }
  character =
    Quilvyn.retrieveCharacterFromStorage(PERSISTENT_CHARACTER_PREFIX + path);
  character['_path'] = path; // In case character saved before _path attr use
  characterPath = path;
  characterUndo = [];
  characterCache[characterPath] = QuilvynUtils.clone(character);
  Quilvyn.refreshEditor(false);
  Quilvyn.refreshSheet();
  Quilvyn.refreshStatus(false);
};

/* Replaces the current character with one with empty attributes. */
Quilvyn.newCharacter = function(prompted) {
 if(prompted == null &&
    userOptions.warnAboutDiscard &&
    !QuilvynUtils.clones(character, characterCache[characterPath])) {
    Quilvyn.confirmDialog('Discard changes to character?', Quilvyn.newCharacter)
    return;
  }
  var editForm = editWindow.editor;
  character = {};
  characterPath = '';
  characterUndo = [];
  var i;
  // Skip to first character-related editor input
  for(i = 0;
      i < editForm.elements.length && editForm.elements[i].name != 'name';
      i++)
    ; /* empty */
  for( ; i < editForm.elements.length; i++) {
    var input = editForm.elements[i];
    var name = input.name;
    var type = input.type;
    if(type == 'select-one' && !name.match(/_sel|_sub/)) {
      character[name] = input.options[0].text;
      for(var j = 1; j < input.options.length; j++)
        if(input.options[j].text == 'None')
          character[name] = 'None';
    } else if(name == 'experience' || name == 'hitPoints') {
      character[name] = 0;
    }
  }
  characterCache[characterPath] = QuilvynUtils.clone(character);
  Quilvyn.refreshEditor(false);
  Quilvyn.refreshSheet();
  Quilvyn.refreshStatus(false);
};

/*
 * Interacts w/user to replace the current character with one that has all
 * randomized attributes.
 */
Quilvyn.randomizeCharacter = function(prompted) {

 if(prompted == null &&
    userOptions.warnAboutDiscard &&
    !QuilvynUtils.clones(character, characterCache[characterPath])) {
    Quilvyn.confirmDialog
      ('Discard changes to character?', Quilvyn.randomizeCharacter)
    return;
  }

  var presets = ruleSet.getChoices('preset');

  if(presets == null) {
    // No window needed
  } else if(Quilvyn.randomizeCharacter.win == null) {
    // New randomize
    var htmlBits = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<title>Random Character</title>',
      '</head>',
      '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
      LOGO_TAG + '<br/>',
      '<h2>Character Attributes</h2>',
      '<form name="frm" onsubmit="return false"><table>'];
    for(var preset in presets) {
      var label;
      var presetHtml = '';
      if(presets[preset]) {
        var pieces = presets[preset].split(',');
        label = pieces[0];
        presetHtml =
          pieces[1].match(/bag|set/) ?
            InputHtml(preset + '_sel', 'select-one',
                      QuilvynUtils.getKeys(ruleSet.getChoices(pieces[2]))) +
            '</td><td>' +
            InputHtml(preset, 'text', [2, '(\\+?\\d+)?'])
          : pieces[1] == 'select-one' ?
            InputHtml(preset, 'select-one',
                      QuilvynUtils.getKeys(ruleSet.getChoices(pieces[2])))
          : InputHtml(preset, pieces[1], [pieces[2]]);
      } else {
        console.log('No formatting specified for preset "' + preset + '"');
        continue;
      }
      presetHtml =
        '<tr><td><b>' + label + '</b></td><td>' + presetHtml + '</td></tr>';
      htmlBits[htmlBits.length] = presetHtml;
    }
    htmlBits = htmlBits.concat([
      '</table></form>',
      '<input type="button" name="ok" value="Ok" onclick="okay=true;"/>',
      '<input type="button" value="Cancel" onclick="canceled=true;"/>',
      '</body>',
      '</html>'
    ]);
    Quilvyn.randomizeCharacter.win = editWindow;
    Quilvyn.randomizeCharacter.win.document.write(htmlBits.join('\n') + '\n');
    Quilvyn.randomizeCharacter.win.document.close();
    // Add callbacks that store user input in a property named attrs for
    // retrieval once the user hits Ok.
    var callbackForSetSel =
      function() {InputSetValue(this.val, this.form.attrs[this.name.replace('_sel', '') + '.' + InputGetValue(this)])};
    var callbackForSetVal =
      function() {this.form.attrs[this.name + '.' + InputGetValue(this.sel)] = InputGetValue(this)};
    var callbackForNonSet =
      function() {this.form.attrs[this.name] = InputGetValue(this);};
    var form = Quilvyn.randomizeCharacter.win.document.frm;
    form.attrs = {};
    for(var i = 0; i < form.elements.length; i++) {
      var widget = form.elements[i];
      if(widget.name.match(/_sel/))
        continue; // Callback set at the same time as the value widget
      InputSetCallback(widget, callbackForNonSet);
      if(form[widget.name + '_sel'] != null) {
        var selWidget = form[widget.name + '_sel'];
        InputSetCallback(widget, callbackForSetVal);
        InputSetCallback(selWidget, callbackForSetSel);
        // Give set widgets references to each other for callback use
        widget.sel = selWidget;
        selWidget.val = widget;
      } else if(widget.type == 'select-one') {
        // Set to a random choice
        widget.selectedIndex = QuilvynUtils.random(0, widget.options.length-1);
        form.attrs[widget.name] = InputGetValue(widget);
      }
    }
    Quilvyn.randomizeCharacter.win.okay = false;
    Quilvyn.randomizeCharacter.win.canceled = false;
    Quilvyn.randomizeCharacter.win.document.getElementsByName('ok')[0].focus();
    setTimeout('Quilvyn.randomizeCharacter(true)', TIMEOUT_DELAY);
    return;
  } else if(Quilvyn.randomizeCharacter.win.canceled) {
    Quilvyn.randomizeCharacter.win = null;
    Quilvyn.refreshEditor(true);
    return;
  } else if(!Quilvyn.randomizeCharacter.win.okay) {
    // Try again later
    setTimeout('Quilvyn.randomizeCharacter(true)', TIMEOUT_DELAY);
    return;
  }

  // Ready to generate
  var fixedAttributes = {};
  if(Quilvyn.randomizeCharacter.win != null) {
    var form = Quilvyn.randomizeCharacter.win.document.frm;
    for(var a in form.attrs) {
      var value = form.attrs[a];
      if(typeof(value) == 'string' && value.match(/^[\+\-]?\d+$/))
        value -= 0;
      if(value)
        fixedAttributes[a] = value;
    }
    // Quilvyn.randomizeCharacter.win.close();
    Quilvyn.randomizeCharacter.win = null;
  }
  character = ruleSet.randomizeAllAttributes(fixedAttributes);
  characterPath = '';
  characterUndo = [];
  characterCache[characterPath] = QuilvynUtils.clone(character);
  Quilvyn.refreshEditor(true);
  Quilvyn.refreshSheet();
  Quilvyn.refreshStatus(false);

};

/*
 * (Re)opens the editor and sheet windows as appropriate. Returns false if
 * window opening fails; otherwise, true.
 */
Quilvyn.redrawUI = function() {
  if(secondWindow) {
    secondWindow.close();
    secondWindow = null;
  }
  if(userOptions.separateEditor) {
    try {
      secondWindow = window.open('', '', FEATURES_OF_EDIT_WINDOW);
    } catch(err) {
      // empty
    }
    if(!secondWindow) {
      alert('Window open failed.\nPlease enable popup windows in your browser settings, then try running Quilvyn again.');
      return false;
    }
    secondWindow.document.write(
      '<DOCTYPE html>\n' +
      '<html lang="en">\n' +
      '<head>\n' +
      '  <title>Quilvyn</title>\n' +
      '  <style>\n' +
      '    .edit {\n' +
      '      position: absolute;\n' +
      '      top: 0;\n' +
      '      left: 0;\n' +
      '      width: 99%;\n' +
      '      height: 94%;\n' +
      '    }\n' +
      '    .status {\n' +
      '      position: absolute;\n' +
      '      bottom: 0;\n' +
      '      left: 0;\n' +
      '      width: 99%;\n' +
      '      height: 5%;\n' +
      '    }\n' +
      '  </style>\n' +
      '</head>\n' +
      '<body>\n' +
      '  <iframe class="edit"></iframe>\n' +
      '  <iframe class="status"></iframe>\n' +
      '</body>\n' +
      '</html>\n'
    );
    secondWindow.document.close();
    secondWindow.focus();
    editWindow = secondWindow.frames[0];
    sheetWindow = quilvynWindow;
    statusWindow = secondWindow.frames[1];
  } else {
    quilvynWindow.document.write(
      '<!DOCTYPE html>\n' +
      '<html lang="en">\n' +
      '<head>\n' +
      '  <title>Quilvyn</title>\n' +
      '  <style>\n' +
      '    .edit {\n' +
      '      position: absolute;\n' +
      '      top: 0;\n' +
      '      left: 0;\n' +
      '      width: 35%;\n' +
      '      height: 94%;\n' +
      '    }\n' +
      '    .sheet {\n' +
      '      position: absolute;\n' +
      '      top: 0;\n' +
      '      right: 0;\n' +
      '      width: 64%;\n' +
      '      height: 99%;\n' +
      '    }\n' +
      '    .status {\n' +
      '      position: absolute;\n' +
      '      bottom: 0;\n' +
      '      left: 0;\n' +
      '      width: 35%;\n' +
      '      height: 5%;\n' +
      '    }\n' +
      '  </style>\n' +
      '</head>\n' +
      '<body>\n' +
      '  <iframe class="edit"></iframe>\n' +
      '  <iframe class="sheet"></iframe>\n' +
      '  <iframe class="status"></iframe>\n' +
      '  <form name="statusDisplay"></form>\n' +
      '</body>\n' +
      '</html>\n'
    );
    quilvynWindow.document.close();
    quilvynWindow.focus();
    editWindow = quilvynWindow.frames[0];
    sheetWindow = quilvynWindow.frames[1];
    statusWindow = quilvynWindow.frames[2];
  }
  return true;
};

/*
 * Resets the editing window fields to the values of the current character.
 * First redraws the editor if #redraw# is true.
 */
Quilvyn.refreshEditor = function(redraw) {

  var i;

  if(redraw) {
    var htmlBits = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<title>Quilvyn Editor Window</title>',
      '</head>',
      '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
      '<div style="text-align:center">',
      LOGO_TAG + '<br/>',
      '<i>Version ' + VERSION + '</i>',
     '</div><br/>',
      Quilvyn.editorHtml(),
      '</body>',
      '</html>'
    ];
    editWindow.document.write(htmlBits.join('\n') + '\n');
    editWindow.document.close();
    var updateListener = function() {Quilvyn.update(this);};
    var selectSpellsListener = function(e) {
      if(event.code == 'KeyY' && (event.ctrlKey || event.metaKey)) {
        Quilvyn.selectSpells();
      }
    }
    var undoListener = function(e) {
      if(event.code == 'KeyZ' && (event.ctrlKey || event.metaKey)) {
        Quilvyn.undo();
      }
    };
    for(i = 0; i < editWindow.editor.elements.length; i++) {
      InputSetCallback(editWindow.editor.elements[i], updateListener);
    }
    editWindow.document.addEventListener('keydown', selectSpellsListener);
    editWindow.document.addEventListener('keydown', undoListener);
    // Split attr,label pairs editorHtml set as params for Clear and Randomize
    // menus, storing the attrs in a field of the widget
    var widget = editWindow.editor.clear;
    widget.attrs = InputGetParams(widget).map(x=>x.replace(/,.*/, ''));
    InputSetOptions
      (widget, InputGetParams(widget).map(x => x.replace(/.*,/, '')));
    widget = editWindow.editor.randomize;
    widget.attrs = InputGetParams(widget).map(x=>x.replace(/,.*/, ''));
    InputSetOptions
      (widget, InputGetParams(widget).map(x=>x.replace(/.*,/, '')));
  }

  var characterOpts = [];
  var editForm = editWindow.editor;
  for(var path in STORAGE) {
    if(path.startsWith(PERSISTENT_CHARACTER_PREFIX))
      characterOpts.push(path.substring(PERSISTENT_CHARACTER_PREFIX.length));
  }
  characterOpts = characterOpts.sort();
  characterOpts.unshift(
    '---choose one---', 'New', 'Random...', 'Save', 'Save As...', 'Print...',
    'Delete...', 'HTML', 'Import...', 'Export', 'Summary'
  );
  var customOpts = QuilvynUtils.getKeys(customCollections).sort();
  customOpts.unshift(
    'New Collection...', 'Delete Collections...', 'View/Export All',
    'Import...', 'Add Rules...', 'Delete Rules...', 'Apply Collection'
  );
  InputSetOptions(editForm.rules, QuilvynUtils.getKeys(ruleSets));
  InputSetOptions(editForm.custom, customOpts);
  InputSetValue(editForm.custom, customCollection);
  InputSetOptions(editForm.character, characterOpts);
  if(characterPath)
    InputSetValue(editForm.character, characterPath);

  // Skip to first character-related editor input
  for(i = 0;
      i < editForm.elements.length && editForm.elements[i].name != 'name';
      i++)
    ; /* empty */
  for( ; i < editForm.elements.length; i++) {
    var input = editForm.elements[i];
    var name = input.name;
    var chk = editForm[name + '_chk'];
    var sel = editForm[name + '_sel'];
    var value = null;
    if(name.match(/_sel|_sub/)) {
      if(name.includes('_sel') && !input.allOpts)
        // editorHtml gave us the full options in _sel; save for later filtering
        input.allOpts = InputGetParams(input);
      var prefix = name.substring(0, name.indexOf('_s'));
      sel = name.includes('_sel') ? input : editForm[prefix + '_sel'];
      var filter = character[prefix + '_filter'] || '';
      var options = sel.allOpts.filter(x => x.includes(filter));
      // Seek an option for which character contains a non-null value
      for(var a in character) {
        if(a.startsWith(prefix) &&
           options.includes(a.replace(prefix + '.', ''))) {
          value = a;
          break;
        }
      }
      if(name.includes('_sel')) {
        // Strip sub-selections and use Set to determine unique options
        options =
          Array.from(new Set(options.map(x => x.replace(/\(.*\)$/, ''))));
        if(options.length == 0)
          options.push('--- empty ---');
        InputSetOptions(input, options);
        value = value ? value.replace(prefix + '.', '').replace(/\(.*\)$/, '') : options[0];
      } else {
        // Grab any sub-options of the current value of _sel
        var selValue = InputGetValue(sel);
        options = options.filter(x => x.startsWith(selValue + '(')).map(x => x.replace(/^[^(]*\(|\)$/g, ''));
        InputSetOptions(input, options);
        if(options.length > 0) {
          input.style.display = 'block';
          value = value ? value.replace(/^[^(]*\(|\)$/g, '') : options[0];
        } else {
          // Remove the sub-menu from the display
          input.style.display = 'none';
        }
      }
    } else if(sel == null) {
      value = character[name];
    } else {
      var sub = editForm[name + '_sub'];
      // Construct full attr name from the current sel value and any sub value
      var attrName = name + '.' + InputGetValue(sel) + (sub && sub.options.length > 0 ? '(' + InputGetValue(sub) + ')' : '');
      value = character[attrName];
    }
    InputSetValue(input, value);
    if(chk != null)
      InputSetValue(chk, value);
  }

  InputSetValue(editForm.rules, ruleSet.getName());
  editWindow.focus();

};

/* Draws the sheet for the current character in the character sheet window. */
Quilvyn.refreshSheet = function() {
  sheetWindow.document.write(Quilvyn.sheetHtml(character));
  sheetWindow.document.close();
  sheetWindow.document.title = character.name;
  window.document.title = 'Quilvyn - ' + character.name;
  sheetWindow.focus();
};

/*
 * Reports character modification, errors, and warnings in the status window.
 * If #showDetail# is true, shows error details in a separate popup.
 */
Quilvyn.refreshStatus = function(showDetail) {

  var a;
  var computed = ruleSet.applyRules(character);
  var differences = [];
  var errors = 0;
  var original = characterCache[characterPath];
  var warnings = 0;

  for(a in Object.assign({}, original, character)) {
    if(original[a] == character[a])
      continue;
    var attr = a;
    if(attr.includes('.')) {
      attr = attr.split('.');
      attr = attr[1] + ' ' + attr[0].replace(/s$/, '').replace(/([a-z])([A-Z])/g, '$1 ' + '$2'.toLowerCase());
    }
    attr = attr.charAt(0).toUpperCase() + attr.substring(1);
    differences.push('<li>' + attr + ' changed from ' + (original[a] != null ? original[a] : '(none)') + ' to ' + (character[a] != null ? character[a] : '(none)') + '</li>');
  }

  for(a in computed) {
    if(a.startsWith('validationNotes') && computed[a] && !a.match(/\.\d+$/))
      errors++;
    else if(a.startsWith('sanityNotes') && computed[a] && !a.match(/\.\d+$/))
      warnings++;
  }

  var htmlBits = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<title>Quilvyn Character Status</title>',
    '</head><body><table style="width:100%"><tr style="font-style:italic">',
    '  <td style="text-align:left">' + differences.length + ' changes' + '</td>',
    '  <td style="text-align:center">' + errors + ' Errors</td>',
    '  <td style="text-align:right">' + warnings + ' Warnings</td>',
    '  <td style="text-align:right"><button title="Details" name="details">...</button></td>',
    '</tr></table></body>',
    '</html>'
  ];
  statusWindow.document.write(htmlBits.join('\n') + '\n');
  statusWindow.document.close();
  statusWindow.document.getElementsByName("details")[0].onclick =
    function() {Quilvyn.refreshStatus(true);};

  if(Quilvyn.refreshStatus.win == null || Quilvyn.refreshStatus.win.closed) {
    if(!showDetail)
      return;
    Quilvyn.refreshStatus.win = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
  }

  errors = [];
  warnings = [];

  var notes = ruleSet.getChoices('notes');
  var htmlBits = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<title>Errors</title>',
    '</head>' +
    '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
  ];
  for(var a in computed) {
    if(!a.match('^validation|^sanity') || !computed[a] || a.match(/\.\d+$/))
      continue;
    var name = a.replace(/^.*Notes./, '');
    name = name.charAt(0).toUpperCase() + name.substring(1).replace(/([a-z\)])([A-Z\(])/g, '$1 $2');
    var note =
      Quilvyn.clarifiedValidationNote(a, notes[a] || computed[a], computed);
    (a.startsWith('sanity') ? warnings : errors).push('<li>' + name + ': ' + note + '</li>');
  }
  htmlBits.push(differences.length + ' Changes');
  htmlBits.push('<ul>');
  htmlBits = htmlBits.concat(differences);
  htmlBits.push('</ul>');
  htmlBits.push(errors.length + ' Errors');
  htmlBits.push('<ul>');
  htmlBits = htmlBits.concat(errors);
  htmlBits.push('</ul>');
  htmlBits.push(warnings.length + ' Warnings<br/>');
  htmlBits.push('<ul>');
  htmlBits = htmlBits.concat(warnings);
  htmlBits.push('</ul>', '</body>', '</html>');
  Quilvyn.refreshStatus.win.document.write(htmlBits.join('\n'));
  Quilvyn.refreshStatus.win.document.close();
  if(showDetail)
    Quilvyn.refreshStatus.win.focus();

};

/* Creates and returns a character from the contents of a storage path. */
Quilvyn.retrieveCharacterFromStorage = function(path) {
  var result = {};
  var attrs = STORAGE.getItem(path).split('\t');
  for(var i = 0; i < attrs.length; i++) {
    var pieces = attrs[i].split('=', 2);
    if(pieces.length == 2)
      result[pieces[0]] =
        pieces[1].match(/^[-+]?\d+$/) ? +pieces[1] : pieces[1];
  }
  return result;
};

/* Interacts w/user to preserve current character in persistent storage. */
Quilvyn.saveCharacter = function(path) {

  if(!path) {
    var defaultPath = character['_path'] || character.name || 'Noname';
    Quilvyn.textDialog(
      'Save ' + character.name + ' as', false, defaultPath, '',
      Quilvyn.saveCharacter
    );
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
  characterUndo = [];
  Quilvyn.refreshEditor(true);

};

// Selects all spells that match the character's spell filter
Quilvyn.selectSpells = function() {
  var filter = character['spells_filter'] || '';
  for(var spell in ruleSet.getChoices('spells')) {
    if(spell.includes(filter))
      character['spells.' + spell] = 1;
  }
  Quilvyn.refreshEditor(true);
  Quilvyn.refreshSheet();
  Quilvyn.refreshStatus(false);
  editWindow.focus();
};

/* Returns the character sheet HTML for the current character. */
Quilvyn.sheetHtml = function(attrs) {

  var a;
  var computedAttributes;
  var enteredAttributes = QuilvynUtils.clone(attrs);
  var i;
  var rulesExtras = ruleSet.getChoices('extras') || {};
  var sheetAttributes = {};

  enteredAttributes.hidden = userOptions.hidden;
  for(a in enteredAttributes) {
    if(typeof(enteredAttributes[a]) == 'string') {
      enteredAttributes[a] = enteredAttributes[a].replaceAll('<', '&lt;').
        replace(new RegExp('&lt;(?=/?(' + ALLOWED_TAGS.join('|') + ')\\b)', 'g'), '<');
    }
  }
  computedAttributes = ruleSet.applyRules(enteredAttributes);
  var formats = ruleSet.getFormats(ruleSet, userOptions.style);
  for(a in computedAttributes) {
    if(a.match(/\.\d+$/))
      continue; // Ignore format multi-values
    if(a.match(/^sanity|^validation/) && !userOptions.validation)
      continue; // Sheet validation reporting replaced by editor status line
    var isNote = a.indexOf('Notes') > 0;
    var name = a.replace(/([a-z\)])([A-Z\(])/g, '$1 $2')
                .replace(/([A-Z])\(/, '$1 (');
    name = name.substring(0, 1).toUpperCase() + name.substring(1);
    var value = computedAttributes[a];
    if(isNote && value == 0)
      continue; // Suppress notes with zero value
    if((a.match(/^spellSlots/) && userOptions.spell == 'Points') ||
       (a == 'spellPoints' && userOptions.spell == 'Slots'))
      continue;
    if(formats[a] != null) {
      value = formats[a].replace(/%V/g, value)
                        .replace(/%S/g, value>=0 ? '+' + value : value);
      for(var j = 1; computedAttributes[a + '.' + j] != null; j++) {
        value = value.replace(new RegExp('%' + j, 'g'), computedAttributes[a + '.' + j]);
      }
      var interpolations = value.match(/%\{[^}]+\}/g);
      if(interpolations) {
        for(var i = 0; i < interpolations.length; i++) {
          var interp = interpolations[i];
          var expr = new Expr(interp.substring(2, interp.length - 1));
          value = value.replace(interp, expr.eval(computedAttributes));
        }
      }
    } else if(isNote && typeof(value) == 'number') {
      value = QuilvynUtils.signed(value);
    }
    if(!userOptions.extras &&
       (a in rulesExtras || a.split('.')[0] in rulesExtras))
      continue;
    sheetAttributes[name] = value;
    if((i = name.indexOf('.')) >= 0) {
      var object = name.substring(0, i);
      if(object == 'Validation Notes' || object == 'Sanity Notes')
        value =
          Quilvyn.clarifiedValidationNote(name, value, computedAttributes);
      name = name.substring(i + 1, i + 2).toUpperCase() + name.substring(i + 2);
      if((value + '').includes('%N'))
        value = value.replaceAll('%N', name);
      else
        value = name + ': ' + value;
      // Some plugins use Infinity for characters who receive immunity at
      // higher levels so that it can be numerically compared to resistance.
      // It would be nice to replace this hard-coding with something elegant.
      value = value.replaceAll('Infinity', 'immune');
      if(isNote && ruleSet.isSource(a)) {
        if(userOptions.italics)
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
      // If all values in the array are 1, assume that it's a set and suppress
      // display of the values
      if(a.indexOf('Note') < 0 &&
         attr.join(',').replace(/: 1\b/g, '').indexOf(':') < 0)
        for(i = 0; i < attr.length; i++)
          attr[i] = attr[i].replace(/: 1/, '');
      sheetAttributes[a] = attr;
    }
  }

  var attrImage = 'var attributes = ' + ObjectViewer.toCode(attrs) + ';\n';
  if(attrs.notes && attrs.notes.indexOf('+COMPUTE') >= 0) {
    attrImage +=
      'var computed = ' + ObjectViewer.toCode(computedAttributes) + ';\n';
  }

  var versions =
    'Quilvyn version ' + VERSION + '; ' + [ruleSet.getName() + ' version ' + ruleSet.getVersion()].concat(ruleSet.getPlugins().map(x => x.name + ' version ' + x.VERSION)).join('; ');

  var bodyBackgroundAttr = userOptions.sheetImage ?
    ' style="background-image:url(' + userOptions.sheetImage +
    (userOptions.sheetImage.match(/\.\w+$/) ? '' : '.jpg') + ')"' : '';
  var viewer = ruleSet.getViewer(userOptions.style) ||
               ruleSet.getViewer('Standard');
  var result =
    '<!DOCTYPE html>\n' +
    '<' + '!' + '-- Generated ' + new Date().toString() +
      ' by ' + versions + ' --' + '>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>\n' +
    '  <title>' + sheetAttributes.Name + '</title>\n' +
    '  <script>\n' +
    attrImage +
    // Careful: don't want to close quilvyn.html's script tag here!
    '  </' + 'script>\n' +
    '</head>\n' +
    '<body' + bodyBackgroundAttr + '>\n' +
    viewer.getHtml(sheetAttributes, '_top') + '\n' +
    '</body>\n' +
    '</html>\n';

  result = result.replace('Validation Notes', 'Validation Errors')
                 .replace('Sanity Notes', 'Validation Warnings');
  return result;

};

Quilvyn.showGroupHtml = function(group) {
  if(group == null) {
    Quilvyn.textDialog('Group?', false, '', '', Quilvyn.showGroupHtml);
    return;
  }
  if(group == '') {
    Quilvyn.showHtml(Quilvyn.sheetHtml(character));
    return;
  }
  var html = '';
  for(var path in STORAGE) {
    if(path.startsWith(PERSISTENT_CHARACTER_PREFIX) && path.includes(group))
      html += Quilvyn.sheetHtml(Quilvyn.retrieveCharacterFromStorage(path));
  }
  Quilvyn.showHtml(html);
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
    '<!DOCTYPE html><html lang="en"><head><title>HTML</title></head>\n' +
    '<body><pre>' + html + '</pre></body></html>\n'
  );
  Quilvyn.showHtml.htmlWindow.document.close();
  Quilvyn.showHtml.htmlWindow.focus();
};

/* Stores the current values of options in the browser. */
Quilvyn.storePersistentInfo = function() {
  for(var a in userOptions) {
    STORAGE.setItem(PERSISTENT_INFO_PREFIX + a, userOptions[a] + '');
  }
};

/*
 * Opens a window that displays a summary of the attributes of all characters
 * that have been loaded into the editor.
 */
Quilvyn.summarizeCachedAttrs = function() {
  var combinedAttrs = { };
  var htmlBits = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<title>Quilvyn Character Attribute Summary</title>',
    '<style>',
    '  table, td, th {border:1px solid black}',
    '</style>',
    '</head>',
    '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
    '<h1>Quilvyn Character Attribute Summary</h1>',
    '<table>'
  ];
  var formats = ruleSet.getFormats(ruleSet, userOptions.style);
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
    htmlBits.push(
      '<tr><th>' + attr + '</th><td>' + unique.join(',') + '</td></tr>'
    );
  }
  htmlBits.push('</table>', '</body>', '</html>');
  if(Quilvyn.summarizeCachedAttrs.win == null ||
     Quilvyn.summarizeCachedAttrs.win.closed)
    Quilvyn.summarizeCachedAttrs.win =
      window.open('', '', FEATURES_OF_OTHER_WINDOWS);
  else
    Quilvyn.summarizeCachedAttrs.win.focus();
  Quilvyn.summarizeCachedAttrs.win.document.write(htmlBits.join('\n') + '\n');
  Quilvyn.summarizeCachedAttrs.win.document.close();
  Quilvyn.summarizeCachedAttrs.win.focus();
};

/* Undoes the most recent change to the the displayed character. */
Quilvyn.undo = function() {
  if(characterUndo.length > 0) {
    character = characterUndo.pop();
    Quilvyn.refreshEditor(true);
    Quilvyn.refreshSheet();
    Quilvyn.refreshStatus(false);
    editWindow.focus();
  }
};

/* Callback invoked when the user changes the editor value of Input #input#. */
Quilvyn.update = function(input) {

  var htmlBits;
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
      htmlBits = [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '<title>About Quilvyn</title>',
        '</head>',
        '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
        ABOUT_TEXT.replace(/\n/g, '<br/>\n<br/>\n'),
        '</body>',
        '</html>'
      ];
      Quilvyn.aboutWindow.document.write(htmlBits.join('\n') + '\n');
      Quilvyn.aboutWindow.document.close();
    }
    Quilvyn.aboutWindow.focus();
  } else if(name == 'help') {
    if(Quilvyn.helpWindow == null || Quilvyn.helpWindow.closed) {
      Quilvyn.helpWindow = window.open(HELP_URL, '');
      // NOTE: The following lines have no effect--url body properties override
      Quilvyn.helpWindow.document.body.style.background =
        userOptions.bgColor;
      if(userOptions.bgImage)
        Quilvyn.helpWindow.document.body.style.background =
          userOptions.bgImage;
    }
    Quilvyn.helpWindow.focus();
  } else if(name == 'options') {
    Quilvyn.modifyOptions();
  } else if(name == 'rules') {
    if(customCollection == ruleSet.getName()) {
      customCollection = value;
      InputSetValue(editWindow.editor.custom, customCollection);
    }
    ruleSet = ruleSets[value];
    Quilvyn.refreshEditor(true);
    Quilvyn.refreshSheet();
    Quilvyn.refreshStatus(false);
  } else if(name == 'rulesNotes') {
    if(Quilvyn.rulesNotesWindow == null || Quilvyn.rulesNotesWindow.closed) {
      Quilvyn.rulesNotesWindow = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
    }
    htmlBits = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<title>Rule Notes for ' + InputGetValue(editWindow.editor.rules) + '</title>',
      '</head>',
      '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
      ruleSet.ruleNotes()
    ];
    ruleSet.getPlugins().map(x => htmlBits.push(x.ruleNotes()));
    htmlBits.push(
      '</body>',
      '</html>'
    );
    Quilvyn.rulesNotesWindow.document.write(htmlBits.join('\n') + '\n');
    Quilvyn.rulesNotesWindow.document.close();
    Quilvyn.rulesNotesWindow.focus();
  } else if(name == 'ruleRules') {
    var awin = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
    htmlBits = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<title>RULES</title>',
      '</head>',
      '<body>',
      '<pre>',
      ruleSet.toHtml(),
      '</pre>',
      '</body>',
      '</html>'
    ];
    awin.document.write(htmlBits.join('\n') + '\n');
    awin.document.close();
    awin.focus();
  } else if(name == 'character') {
    input.selectedIndex = 0;
    if(value == '---choose one---')
      ; /* empty--Safari bug workaround */
    else if(value == 'Delete...')
      Quilvyn.deleteCharacters(null);
    else if(value == 'Print...')
      sheetWindow.print();
    else if(value == 'Save') {
      Quilvyn.saveCharacter(characterPath);
      Quilvyn.refreshStatus(false);
    } else if(value == 'Save As...') {
      Quilvyn.saveCharacter('');
      Quilvyn.refreshStatus(false);
    } else if(value == 'Export')
      Quilvyn.exportCharacters();
    else if(value == 'Summary')
      Quilvyn.summarizeCachedAttrs();
    else if(value == 'HTML') {
      if('DEBUG' in customCollections)
        Quilvyn.showGroupHtml(null);
      else
        Quilvyn.showHtml(Quilvyn.sheetHtml(character));
    } else if(value == 'Import...')
      Quilvyn.importCharacters(null);
    else if(value == 'New')
      Quilvyn.newCharacter(null);
    else if(value == 'Random...')
      Quilvyn.randomizeCharacter(null);
    else
      Quilvyn.openCharacter(value);
  } else if(name == 'custom') {
    InputSetValue(input, customCollection);
    if(value == 'Add Rules...')
      Quilvyn.customAddRules();
    else if(value == 'Apply Collection')
      Quilvyn.customApplyCollection();
    else if(value == 'Delete Collections...')
      Quilvyn.customDeleteCollections(null);
    else if(value == 'Delete Rules...')
      Quilvyn.customDeleteRules(null);
    else if(value == 'Import...')
      Quilvyn.customImportCollections(null);
    else if(value == 'New Collection...')
      Quilvyn.customNewCollection();
    else if(value == 'View/Export All')
      Quilvyn.customExportCollections(null);
    else {
      customCollection = value;
      InputSetValue(input, customCollection);
    }
  } else if(name == 'randomize') {
    value = input.attrs[input.selectedIndex]; // Get attr for selected label
    input.selectedIndex = 0;
    characterUndo.push(QuilvynUtils.clone(character));
    ruleSet.randomizeOneAttribute(character, value);
    Quilvyn.refreshEditor(false);
    Quilvyn.refreshSheet();
    Quilvyn.refreshStatus(false);
  } else if(name == 'clear') {
    value = input.attrs[input.selectedIndex]; // Get attr for selected label
    input.selectedIndex = 0;
    characterUndo.push(QuilvynUtils.clone(character));
    for(var a in character) {
      if(a.indexOf(value + '.') == 0)
        delete character[a];
    }
    Quilvyn.refreshEditor(false);
    Quilvyn.refreshSheet();
    Quilvyn.refreshStatus(false);
  } else if(name.indexOf('_filter') >= 0) {
    if(!value)
      delete character[name];
    else
      character[name] = value;
    Quilvyn.refreshEditor(false);
  } else if(name.indexOf('_sel') >= 0) {
    name = name.replace('_sel', '');
    var sub = editWindow.editor[name + '_sub'];
    if(sub) {
      // Update the sub-menu any suboptions of the new _sel value
      var filter = character[name + '_filter'] || '';
      var subOpts = input.allOpts
          .filter(x => x.startsWith(value + '(') && x.includes(filter))
          .map(x => x.replace(/^[^(]*\(|\)$/g, ''));
      InputSetOptions(sub, subOpts);
      if(subOpts.length > 0) {
        sub.style.display = 'block';
        value += '(' + subOpts[0] + ')';
      } else {
        // Remove the sub-menu from the display
        sub.style.display = 'none';
      }
    }
    value = character[name + '.' + value];
    if(editWindow.editor[name] != null)
      InputSetValue(editWindow.editor[name], value);
    if(editWindow.editor[name + '_chk'] != null)
      InputSetValue(editWindow.editor[name + '_chk'], value);
  } else if(name.indexOf('_sub') >= 0) {
    name = name.replace(/_sub/, '');
    value = character[name + '.' + InputGetValue(editWindow.editor[name + '_sel']) + '(' + value + ')'];
    if(editWindow.editor[name] != null)
      InputSetValue(editWindow.editor[name], value);
    if(editWindow.editor[name + '_chk'] != null)
      InputSetValue(editWindow.editor[name + '_chk'], value);
  } else {
    if(name.indexOf('_chk') >= 0) {
      name = name.replace('_chk', '');
      input = editWindow.editor[name];
      value = value ? 1 : '';
      InputSetValue(input, value);
    }
    var selector = editWindow.editor[name + '_sel'];
    var attr = name;
    if(selector != null) {
      var subselector = editWindow.editor[name + '_sub'];
      attr += '.' + InputGetValue(selector) + (subselector && subselector.options.length > 0 ? '(' + InputGetValue(subselector) + ')' : '');
    }
    characterUndo.push(QuilvynUtils.clone(character));
    if(!value && (value === '' || input.type == 'checkbox'))
      delete character[attr];
    else if(typeof(value) == 'string' &&
            value.match(/^\+-?\d+$/) &&
            (typeof(character[attr]) == 'number' ||
             (typeof(character[attr]) == 'string' &&
              character[attr].match(/^\d+$/)))) {
      character[attr] = (character[attr] - 0) + (value.substring(1) - 0);
      InputSetValue(input, character[attr]);
    }
    else
      character[attr] = value;
    if(editWindow.editor[name + '_chk'] != null) {
      input = editWindow.editor[name + '_chk'];
      InputSetValue(input, value);
    }
    Quilvyn.refreshSheet();
    Quilvyn.refreshStatus(false);
  }

};
