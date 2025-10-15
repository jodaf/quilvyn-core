/*jshint esversion: 6 */
/* jshint forin: false */
"use strict";

let COPYRIGHT = 'Copyright 2023 James J. Hayes';
let VERSION = '2.4.8';
let ABOUT_TEXT =
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

let FEATURES_OF_EDIT_WINDOW =
  'height=750,width=500,menubar,resizable,scrollbars';
let FEATURES_OF_SHEET_WINDOW =
  'height=750,width=750,menubar,resizable,scrollbars,toolbar';
let FEATURES_OF_OTHER_WINDOWS =
  'height=750,width=750,menubar,resizable,scrollbars,toolbar';
let PERSISTENT_CHARACTER_PREFIX = 'QuilvynCharacter.';
let PERSISTENT_HOMEBREW_PREFIX = 'QuilvynCustom.';
let PERSISTENT_INFO_PREFIX = 'QuilvynInfo.';
let TIMEOUT_DELAY = 1000; // One second
// Use system dialog windows whenever possible?
// TODO: Googling indicates that user disable of system dialogs can be detected
// by timing how quickly confirm and alert return, in response to which we
// could fall back to using our generated dialogs.
let USE_SYSTEM_DIALOGS = true;
// HTML tags allowed in user input; 's' and 'u' allowed though HTML deprecated
const ALLOWED_TAGS = [
  'b', 'div', 'i', 'li', 'ol', 'p', 'sub', 'sup', 'table', 'td', 'th', 'tr',
  'ul', 's', 'u'
];

let character = {};     // Displayed character attrs
let characterCache = {};// Attrs of all displayed characters, indexed by path
let characterPath = ''; // Path to most-recently opened/generated character
let characterUndo = []; // Stack of copies of character for undoing changes
let editWindow = null;  // iframe or window where editor is shown
let ruleSet = null;     // The rule set currently in use
let ruleSets = {};      // Registered rule sets, indexed by name
let quilvynWindow = null; // Quilvyn container window
let secondWindow = null;// Container window for separate editor
let sheetWindow = null; // iframe or window where character sheet is shown
let statusWindow = null;// iframe or window where character status is shown
let userOptions = {     // User-settable options
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

  for(let a in userOptions) {
    let stored = STORAGE.getItem(PERSISTENT_INFO_PREFIX + a);
    if(stored)
      userOptions[a] = stored.match(/^\d+$/) ? stored - 0 : stored;
  }

  quilvynWindow = win;
  if(!Quilvyn.redrawUI())
    return;
  Quilvyn.refreshEditor(true);
  Quilvyn.newCharacter(true);

}

/*
 * Displays #prmpt# to the user, allowing a response of Ok or Cancel. Calls
 * #callback#, passing true, if the user selects Ok.
 */
Quilvyn.confirmDialog = function(prmpt, callback) {

  if(USE_SYSTEM_DIALOGS) {
    if(confirm(prmpt))
      callback(true);
    return;
  }
  if(Quilvyn.confirmDialog.win == null) {
    let htmlBits = [
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
 * subset of #choices# selected by the user is passed to #callback#. #selected#
 * and #disabled#, if provided, are arrays of keys from #choices# that should
 * be pre-checked and/or disabled.
 */
Quilvyn.setDialog = function(prmpt, choices, callback, selected, disabled) {

  if(Quilvyn.setDialog.win == null) {
    let htmlBits = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<title>' + prmpt + '</title>',
      '</head>',
      '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
      LOGO_TAG + '<br/>',
      '<h3>' + prmpt + '</h3>',
      '<form onsubmit="return false"><table>',
      '<tr><td><b>Filter </b>' + InputHtml('_filter', 'text', [20]).replace('>', ' onchange="refilter=true">') + '</td></tr>',
      '<tr><td>' + InputHtml('_all', 'checkbox', ['all shown']).replace('>', ' onchange="reall=true"') + '</td></tr>',
      '<tr><td><hr></td></th>'
    ];
    Object.keys(choices).sort().forEach(c => {
      let input = InputHtml(choices[c], 'checkbox', [c]);
      if(selected != null && selected.includes(c))
        input = input.replace('>', ' checked="1">');
      if(disabled != null && disabled.includes(c))
        input = input.replace('>', ' disabled="disabled">');
      htmlBits.push('<tr name="' + c + 'Row"><td>' + input + '</td></tr>');
    });
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
    Quilvyn.setDialog.win.reall = false;
    Quilvyn.setDialog.win.refilter = false;
    Quilvyn.setDialog.win.callback = callback;
    setTimeout('Quilvyn.setDialog()', TIMEOUT_DELAY);
    return;
  } else if(Quilvyn.setDialog.win.canceled) {
    // User cancel
    Quilvyn.setDialog.win = null;
    Quilvyn.refreshEditor(true);
    return;
  } else if(!Quilvyn.setDialog.win.okay) {
    // Try again later, after redisplaying as necessary
    if(Quilvyn.setDialog.win.reall || Quilvyn.setDialog.win.refilter) {
      let form = Quilvyn.setDialog.win.document.forms[0];
      let checkAll =
        InputGetValue(Quilvyn.setDialog.win.document.getElementsByName('_all')[0]);
      let filter =
        InputGetValue(Quilvyn.setDialog.win.document.getElementsByName('_filter')[0]).toUpperCase();
      for(let i = 0; i < form.elements.length; i++) {
        let name = form.elements[i].name;
        if(name=='_filter' || name=='_all')
          continue;
        let value = form.elements[i].value;
        let tr =
          Quilvyn.setDialog.win.document.getElementsByName(value + 'Row')[0];
        let hide = filter != '' && !value.toUpperCase().includes(filter);
        if(tr)
          tr.hidden = hide;
        if(!hide && Quilvyn.setDialog.win.reall)
          form.elements[i].checked = checkAll;
      }
      Quilvyn.setDialog.win.reall = false;
      Quilvyn.setDialog.win.refilter = false;
    }
    setTimeout('Quilvyn.setDialog()', TIMEOUT_DELAY);
    return;
  }

  let form = Quilvyn.setDialog.win.document.forms[0];
  choices = {};
  for(let i = 0; i < form.elements.length; i++) {
    if(form.elements[i].checked && form.elements[i].name != '_all')
      choices[form.elements[i].value] = form.elements[i].name;
  }

  callback = Quilvyn.setDialog.win.callback;
  Quilvyn.setDialog.win = null;
  Quilvyn.refreshEditor(true);
  callback(choices);

};

/*
 * Interacts with the user to enter a single line of text. #prmpt# is used to
 * label the dialog, #defaultValue# is displayed as the default value for
 * the text, and #error#, if specified, is shown as an error in the default
 * value. If true, #multiline# indicates that a text box should be used for
 * the prompt rather than a single-line text input. Once the user has entered
 * text, it is passed as a parameter to #callback#.
 */
Quilvyn.textDialog = function(prmpt, multiline, defaultValue, error, callback) {

  if(Quilvyn.textDialog.win == null && USE_SYSTEM_DIALOGS && !multiline) {
    if(error)
      alert(error);
    let value = prompt(prmpt, defaultValue);
    if(value != null)
      callback(value);
    return;
  }
  if(Quilvyn.textDialog.win == null) {
    let htmlBits = [
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
  let prefix =
    PERSISTENT_HOMEBREW_PREFIX + rs.getName().replaceAll('.','%2E') + '.';
  for(let path in STORAGE) {
    if(!path.startsWith(prefix))
      continue;
    if(!QuilvynUtils.getAttrValue(STORAGE.getItem(path), '_tags')) {
      let pieces = path.split('.').map(x => x.replaceAll('%2E', '.'));
      ruleSet.choiceRules(ruleSet, pieces[2], pieces[3], STORAGE.getItem(path));
    }
  }
};

/* Returns HTML attributes for Quilvyn's windows body tags. */
Quilvyn.htmlBackgroundAttr = function() {
  let result = 'style="background-color:' + userOptions.bgColor;
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
  for(let i = 0; i < 9; i++)
    note = note.replace('%' + i, attrs[name + '.' + i]);
  let m = note.match(/[a-z]\w*(\.[A-Z][\w']*([-\s]\(?[A-Z][\w']+\)?)*\+?)?/g);
  if(m) {
    for(let i = 1; i < m.length; i++) {
      let ref = m[i];
      let replacement = ref.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
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

/*
 * Interacts with the user to incorporate homebrew choices into the current
 * rule set.
 */
Quilvyn.homebrewEnableChoices = function(items) {

  let prefix =
    PERSISTENT_HOMEBREW_PREFIX + ruleSet.getName().replaceAll('.','%2E') + '.';
  let homebrewChoices = {};
  let checked = [];

  for(let path in STORAGE) {
    if(!path.startsWith(prefix))
      continue;
    let pieces = path.split('.').map(x => x.replaceAll('%2E', '.'));
    let type = pieces[2];
    let name = pieces[3];
    let tags = QuilvynUtils.getAttrValueArray(STORAGE.getItem(path), '_tags');
    let display =
      type + ': ' + name + (tags.length > 0 ? ' (' + tags.join(',') + ')' : '');
    homebrewChoices[display] = path;
    let group =
      type.charAt(0).toLowerCase() + type.substring(1).replaceAll(' ','') + 's';
    if(ruleSet.getChoices(group) &&
       ruleSet.getChoices(group)[name] == STORAGE.getItem(path))
      checked.push(display);
    else if(type == 'Spell') {
      // Check if any spell of the same name has matching attrs
      let spells = QuilvynUtils.getKeys(ruleSet.getChoices(group), name+'\\(');
      for(let i = 0; i < spells.length; i++) {
        if(ruleSet.getChoices(group)[spells[i]] == STORAGE.getItem(path)) {
          checked.push(display);
          break;
        }
      }
    }
  }

  if(!items) {
    Quilvyn.setDialog
      ('Select choices to enable<br/><small>(checked choices are currently enabled)</small>',
       homebrewChoices, Quilvyn.homebrewEnableChoices, checked);
    return;
  }

  for(let c in homebrewChoices) {
    let path = homebrewChoices[c];
    let pieces = path.split('.').map(x => x.replaceAll('%2E', '.'));
    let type = pieces[2];
    let group =
      type.charAt(0).toLowerCase() + type.substring(1).replaceAll(' ','') + 's';
    let name = pieces[3];
    let value = STORAGE.getItem(path);
    let choices = ruleSet.getChoices(group);
    let currentlyActive = choices && choices[name] == value;
    if(choices && type == 'Spell') {
      let spells = QuilvynUtils.getKeys(choices, '^' + name + '\\(');
      for(let i = 0; i < spells.length; i++) {
        if(choices[spells[i]] == value) {
          currentlyActive = true;
          break;
        }
      }
    }
    if(c in items && !currentlyActive) {
      ruleSet.choiceRules(ruleSet, type, name, value);
    } else if(!(c in items) && currentlyActive) {
      if(ruleSet.removeChoice)
        ruleSet.removeChoice(ruleSet, type, name);
      else
        // Minimal fallback behavior for rule sets w/out removeChoice
        delete ruleSet.getChoices(group)[name];
    }
  }

  Quilvyn.refreshEditor(true);
  Quilvyn.refreshSheet();

};

/*
 * Interacts with the user to delete one or more homebrew choices from the
 * current rule set.
 */
Quilvyn.homebrewDeleteChoices = function(items) {

  let path;
  let prefix =
    PERSISTENT_HOMEBREW_PREFIX + ruleSet.getName().replaceAll('.','%2E') + '.';

  if(!items) {
    items = {};
    for(path in STORAGE) {
      if(path.startsWith(prefix)) {
        let item =
          path.substring(prefix.length).replace('.',': ').replaceAll('%2E','.');
        let tags =
          QuilvynUtils.getAttrValueArray(STORAGE.getItem(path), '_tags');
        if(tags.length > 0)
          item += ' (' + tags.join(',') + ')';
        items[item] = path;
      }
    }
    Quilvyn.setDialog
      ('Select choices to delete', items, Quilvyn.homebrewDeleteChoices);
    return;
  }

  for(let item in items) {
    let path = items[item];
    STORAGE.removeItem(path);
    let pieces = path.split('.');
    let type = pieces[2];
    let name = pieces[3];
    let group =
      type.charAt(0).toLowerCase() + type.substring(1).replaceAll(' ','') + 's';
    if(ruleSet.removeChoice)
      ruleSet.removeChoice(ruleSet, type, name);
    else if(ruleSet.getChoices(group))
      // Minimal fallback behavior for rule sets w/out removeChoice
      delete ruleSet.getChoices(group)[name];
  }

  Quilvyn.refreshEditor(true);
  Quilvyn.refreshSheet();

};

/*
 * Displays all homebrew choices in a format that can be imported into Quilvyn.
 */
Quilvyn.homebrewExportChoices = function() {
  let htmlBits = [];
  for(let path in STORAGE) {
    if(!path.startsWith(PERSISTENT_HOMEBREW_PREFIX))
      continue;
    let pieces = path.split('.');
    for(let i = 1; i <= 3; i++) {
      let quote = pieces[i].indexOf(' ') < 0 ? '' : pieces[i].indexOf('"') < 0 ? '"' : "'";
      pieces[i] = quote + pieces[i].replaceAll('%2E', '.') + quote;
    }
    let text = '_collection=' + pieces[1] + ' _type=' + pieces[2] + ' _name=' + pieces[3] + ' ' + STORAGE.getItem(path).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    htmlBits.push(text);
  }
  htmlBits.sort();
  htmlBits.unshift(
    '<!DOCTYPE html>',
    '<html lang="en">' +
    '<head>' +
    '<title>Export Homebrew Choices</title>' +
    '</head>',
    '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
    LOGO_TAG + '<br/>',
    '<pre>'
  );
  htmlBits.push('</pre>', '</body>', '</html>');
  let exportPopup = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
  exportPopup.document.write(htmlBits.join('\n') + '\n');
  exportPopup.document.close();
  exportPopup.focus();
};

/* Interacts with the user to import a set of homebrew choices */
Quilvyn.homebrewImportChoices = function(choices) {

  if(!choices) {
    Quilvyn.textDialog(
      'Enter choice definitions from export', true, '', '',
      Quilvyn.homebrewImportChoices
    );
    return;
  }

  let lines = choices.split('\n');

  while(lines.length > 0) {
    let line = lines.pop();
    if(line.match(/^\s*$/))
      continue;
    let ruleSet = QuilvynUtils.getAttrValue(line, '_collection');
    let name = QuilvynUtils.getAttrValue(line, '_name');
    let type = QuilvynUtils.getAttrValue(line, '_type');
    if(!ruleSet || !name || !type) {
      Quilvyn.textDialog(
        'Enter choice definitions from export', true,
        line + '\n' + lines.join('\n'), 'Bad format for item "' + line + '"',
        Quilvyn.homebrewImportChoices
      );
      return;
    }
    line = line.replace
      (new RegExp('_collection=["\']?' + ruleSet + '["\']?'), '');
    line = line.replace(new RegExp('_name=["\']?' + name + '["\']?'), '');
    line = line.replace(new RegExp('_type=["\']?' + type + '["\']?'), '');
    line = line.replace(/^\s+|\s+$/g, '');
    STORAGE.setItem(
      PERSISTENT_HOMEBREW_PREFIX +
      [ruleSet, type, name].map(x=>x.replaceAll('.', '%2E')).join('.'),
      line
    );
    if(ruleSet in ruleSets && !QuilvynUtils.getAttrValue(line, '_tags'))
      ruleSets[ruleSet].choiceRules(ruleSets[ruleSet], type, name, line);
  }

  Quilvyn.refreshEditor(true);

};

/*
 * Interacts with the user to add and edit homebrew choices in the current rule
 * set.
 */
Quilvyn.homebrewModifyChoices = function() {

  let prefix =
    PERSISTENT_HOMEBREW_PREFIX + ruleSet.getName().replaceAll('.', '%2E') + '.';
  let w = Quilvyn.homebrewModifyChoices.win;

  if(w == null) {

    // New homebrew add
    let types = QuilvynUtils.getKeys(ruleSet.getChoices('choices'));
    let homebrewChoices = {};
    for(let key in STORAGE) {
      if(key.startsWith(prefix))
        homebrewChoices[key] = STORAGE.getItem(key);
    }
    let rulesChoices = [];
    for(let type in ruleSet.getChoices('choices')) {
      let choices =
        ruleSet.getChoices(
          type.charAt(0).toLowerCase() +
          type.substring(1).replaceAll(' ', '') + 's'
        );
      for(let c in choices) {
        let key = prefix + type + '.' + c;
        if(type=='Spell')
          // Small hack here--we have implicit knowledge that some plugins
          // (e.g., SRD35) expand spell definitions into multiple entries
          // by appending the level and school in parens to the name. We
          // want to show the unexpanded base, so undo that step.
          key = prefix + type + '.' + c.replace(/\([^\d]+\d [\w]+\)$/,'');
        rulesChoices[key] = choices[c];
      }
    }

    let htmlBits = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<title>Add Homebrew Choices</title></head>',
      '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
      '<table style="width:100%"><tr style="vertical-align:top">',
      '<td style="text-align:right; width=50%">',
        '<input type="button" name="_pmatch" value="<" onclick="searchStep=\'-\'" title="Previous match"/>',
        '<input type="text" list="homebrews" name="_search" size="20" onchange="searchStep=\'?\'"/>',
        '<datalist id="homebrews">'];
    let datalistOptions = [];
    for(let key in homebrewChoices) {
      let pieces = key.split('.').map(x => x.replaceAll('%2E', '.'));
      let tags = QuilvynUtils.getAttrValueArray(STORAGE.getItem(key), '_tags');
      datalistOptions.push(
        '  <option value="' + pieces[2] + ':' + pieces[3] + (tags ? ' (' + tags.join(',') + ')' : '') + '"></option>'
      );
    }
    htmlBits.push(...datalistOptions.sort());
    htmlBits.push(
        '</datalist>',
        '<input type="button" name="_searchh" value="&#x1F50D;&#xFE0E;" onclick="searchStep=\'H\';" title="Search"/>',
        '<input type="button" name="_nmatch" value=">" onclick="searchStep=\'+\'" title="Next match"/>',
      '</td>',
      '<td style="width:7%;text-align:center;font-size:11px"><input type="button" name="_searchr" value="&#x1F50D;&#xFE0E;" onclick="searchStep=\'R\'" title="Search rules"/><br/>Rules</td>',
      '<td style="width:21%"><span id="searchIndex">&nbsp;</span></td>',
      '</td><td style="text-align:right; width:7%">',
        '<input type="button" name="Close" value="x" onclick="done=true;" title="Close"/>',
      '</td>',
      '</tr></table>',
      '<br/>',
      '<form onsubmit="return false"><table><tr>',
      '<th>Type</th><td>' + InputHtml('_type', 'select-one', types).replace('>', ' onchange="update=true">') + '</td>',
      '</tr><tr>',
      '<th>Name</th><td>' + InputHtml('_name', 'text', [30]) + '</td>',
      '</tr><tr>',
      '<th>Tags</th><td>' + InputHtml('_tags', 'text', [30]) + '</td>',
      '</tr><tr>',
      // Blank line
      '</tr></table>',
      '<br/>',
      '<table id="variableFields">',
      '</table><br/>',
      '<input type="button" name="Save" value="Save" onclick="save=true;"/>',
      '<p id="message">&nbsp;</p>',
      '</form>',
      '</body>',
      '</html>'
    );
    w = editWindow;
    w.document.write(htmlBits.join('\n') + '\n');
    w.document.close();
    w.done = false;
    w.homebrewChoices = homebrewChoices;
    w.rulesChoices = rulesChoices;
    w.save = false;
    w.searchStep = '';
    w.update = true;
    w.document.getElementsByName('_name')[0].focus();
    Quilvyn.homebrewModifyChoices.win = w;
    Quilvyn.homebrewModifyChoices();
    return;

  } else if(w.done) {

    // User done making additions
    Quilvyn.homebrewModifyChoices.win = null;
    Quilvyn.refreshEditor(true);
    return;

  } else if(w.searchStep || w.update) {

    let nameInput = w.document.getElementsByName('_name')[0];
    let searchInput = w.document.getElementsByName('_search')[0];
    let tagsInput = w.document.getElementsByName('_tags')[0];
    let typeInput = w.document.getElementsByName('_type')[0];
    let newPathAttrs = null;

    if(w.searchStep) {

      let currentPath =
        prefix +
        InputGetValue(typeInput).replaceAll('.', '%2E') + '.' +
        InputGetValue(nameInput).replaceAll('.', '%2E');
      let newPath = null;

      // Search button pair toggles whether "rules:" is included in search text
      if(w.searchStep == 'R' && !searchInput.value.match(/^\s*rules\s*:/i))
        searchInput.value = 'Rules:' + searchInput.value;
      else if(w.searchStep == 'H' && searchInput.value.match(/^\s*rules\s*:/i))
        searchInput.value = searchInput.value.replace(/^[^:]*:/, '');

      let pieces = InputGetValue(searchInput).split(/\s*:\s*/);
      let searchChoices =
        pieces[0].match(/^\s*rules$/i) ? w.rulesChoices : w.homebrewChoices;
      let searchKeys = Object.keys(searchChoices);
      let searchText = pieces[pieces.length - 1].toUpperCase();
      let searchType =
        pieces.length > 2 ? pieces[1].toUpperCase() :
        pieces.length == 1 ? '' :
        pieces[0].match(/^\s*rules$/i) ? '' :
        pieces[0].toUpperCase();

      // Filter by type, if specified, then by text, which may match name or
      // tags. If type wasn't specified, text may also match type.
      if(searchType)
        searchKeys =
          searchKeys.filter(x => x.split('.')[2].toUpperCase() == searchType);
      searchKeys =
        searchKeys.filter(x => searchText == '' || ((!searchType ? x.split('.')[2] + ' ' : '') + x.split('.')[3] + ' (' + (QuilvynUtils.getAttrValueArray(searchChoices[x], '_tags') || []).join(',') + ')').toUpperCase().includes(searchText));
      searchKeys = searchKeys.sort((a,b) => a.localeCompare(b));
      if(w.searchStep == '-')
        newPath =
          searchKeys[searchKeys.indexOf(currentPath) - 1] ||
          searchKeys[searchKeys.length - 1];
      else if(w.searchStep == '+')
        newPath =
          searchKeys[searchKeys.indexOf(currentPath) + 1] || searchKeys[0];
      else
        newPath = searchKeys[0];

      // If that fails, give up
      if(newPath == null) {
        w.document.getElementById('message').innerHTML =
          'Search for "' + InputGetValue(searchInput) + '" failed';
        w.document.getElementById('searchIndex').innerHTML = '&nbsp;';
        w.searchStep = '';
        setTimeout('Quilvyn.homebrewModifyChoices()', TIMEOUT_DELAY / 2);
        return;
      }

      let newName = newPath.split('.')[3];
      let newType = newPath.split('.')[2];
      newPathAttrs = searchChoices[newPath];
      InputSetValue(typeInput, newType);
      newPathAttrs += ' _name="' + newName.replaceAll('%2E', '.') + '"';

      let newIndex = searchKeys.indexOf(newPath);
      w.document.getElementById('searchIndex').innerHTML =
        '&nbsp;#' + (newIndex + 1) + ' of ' + searchKeys.length;

    }

    InputSetValue(nameInput, '');
    InputSetValue(tagsInput, '');
    w.document.getElementById('message').innerHTML = '&nbsp;';

    // Display input fields appropriate to the chosen type
    let elements =
      ruleSet.choiceEditorElements(ruleSet, InputGetValue(typeInput));
    let htmlBits = [];
    elements.forEach(e => {
      let label = e[1];
      let name = e[0];
      let params = e[3];
      let type = e[2];
      htmlBits.push(
        '<tr><th>' + (label ? label : '&nbsp;') + '</th><td>' +
        InputHtml(name, type, params) + '</td></tr>'
      );
    });
    w.document.getElementById('variableFields').innerHTML = htmlBits.join('\n');

    if(newPathAttrs) {
      InputSetValue
        (nameInput, QuilvynUtils.getAttrValue(newPathAttrs, '_name'));
      InputSetValue
        (tagsInput, QuilvynUtils.getAttrValueArray(newPathAttrs, '_tags').join(','));
      elements.forEach(e => {
        let eValues = QuilvynUtils.getAttrValueArray(newPathAttrs, e[0]);
        if(eValues.length > 0) {
          let value = eValues.join(',');
          if(value == 'false')
            value = false;
          InputSetValue(w.document.getElementsByName(e[0])[0], value);
        }
      });
    }

    w.searchStep = '';
    w.unmodified = [];
    for(let i = 0; i < w.document.forms[0].elements.length; i++)
      w.unmodified[i] = InputGetValue(w.document.forms[0].elements[i]);
    w.update = false;
    setTimeout('Quilvyn.homebrewModifyChoices()', TIMEOUT_DELAY / 2);
    return;

  } else if(!w.save) {

    let modified = false;
    for(let i = 0; i < w.document.forms[0].elements.length; i++)
      if(InputGetValue(w.document.forms[0].elements[i]) != w.unmodified[i])
        modified = true;
    if(modified)
      w.document.getElementById('message').innerHTML = '* Modified';
    else if(w.document.getElementById('message').innerHTML.includes('Modified'))
      w.document.getElementById('message').innerHTML = '&nbsp';
    // Try again later
    setTimeout('Quilvyn.homebrewModifyChoices()', TIMEOUT_DELAY / 2);
    return;

  }

  // Ready to add a homebrew choice
  let inputForm = w.document.forms[0];
  let attrs = [];
  let name = '';
  let type = '';
  for(let i = 0; i < inputForm.elements.length; i++) {
    let input = inputForm.elements[i];
    let inputName = input.name;
    let inputValue = (InputGetValue(input) + '').trim();
    if(inputName == '_name')
      // For consistency with text attrs, allow unnecessary quotes around name
      name = inputValue.replace(/^(['"])(.*)\1$/, '$2').trim();
    else if(inputName == '_type')
      type = inputValue;
    else if(inputName == 'Save' || inputName == 'Close')
      continue;
    else {
      // Quote values that contain spaces.
      let tokens = inputValue.match(/'[^']*'|"[^"]*"|[^,]+|,/g);
      if(tokens) {
        inputValue = '';
        for(let j = 0; j < tokens.length; j++) {
          let token = tokens[j].trim();
          if('"\''.includes(token.charAt(0)) || token.indexOf(' ') < 0)
            inputValue += token;
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
  if(name == '') {
    w.document.getElementById('message').innerHTML = 'Empty name not allowed';
    w.save = false;
    setTimeout('Quilvyn.homebrewModifyChoices()', TIMEOUT_DELAY / 2);
    return;
  }
  attrs = attrs.join(' ');
  STORAGE.setItem(
    PERSISTENT_HOMEBREW_PREFIX +
    [ruleSet.getName(), type, name].map(x=>x.replaceAll('.', '%2E')).join('.'),
    attrs
  );
  for(let i = 0; i < w.document.forms[0].elements.length; i++)
    w.unmodified[i] = InputGetValue(w.document.forms[0].elements[i]);
  w.document.getElementById('message').innerHTML =
    'Saved homebrew ' + type + ' ' + name;
  w.homebrewChoices = {};
  for(let key in STORAGE) {
    if(key.startsWith(prefix))
      w.homebrewChoices[key] = STORAGE.getItem(key);
  }
  let datalistOptions = [];
  for(let key in w.homebrewChoices) {
    let pieces = key.split('.').map(x => x.replaceAll('%2E', '.'));
    let tags = QuilvynUtils.getAttrValueArray(w.homebrewChoices[key], '_tags');
    datalistOptions.push(
      '  <option value="' + pieces[2] + ':' + pieces[3] + (tags ? ' (' + tags.join(',') + ')' : '') + '"></option>'
    );
  }
  w.document.getElementById('homebrews').innerHTML =
    datalistOptions.sort().join('');

  w.save = false;
  if(!QuilvynUtils.getAttrValue(attrs, '_tags'))
    ruleSet.choiceRules(ruleSet, type, name, attrs);
  Quilvyn.refreshSheet();
  setTimeout('Quilvyn.homebrewModifyChoices()', TIMEOUT_DELAY / 2);
  return;

};

/* Interacts with the user to delete characters from persistent storage. */
Quilvyn.deleteCharacters = function(characters) {

  let path;

  if(!characters) {
    characters = {};
    for(let path in STORAGE) {
      if(path.startsWith(PERSISTENT_CHARACTER_PREFIX))
        characters[path.substring(PERSISTENT_CHARACTER_PREFIX.length)] = path;
    }
    Quilvyn.setDialog
      ('Select characters to delete', characters, Quilvyn.deleteCharacters);
    return;
  }

  for(let c in characters)
    STORAGE.removeItem(PERSISTENT_CHARACTER_PREFIX + c);
  Quilvyn.refreshEditor(true);

};

/* Returns HTML for the character editor form. */
Quilvyn.editorHtml = function() {
  let quilvynElements = [
    ['about', ' ', 'button', ['About']],
    ['help', '', 'button', ['Help']],
    ['options', '', 'button', ['Options']],
    ['rules', 'Rules', 'select-one', []],
    ['rulesNotes', '', 'button', ['Notes']],
    ['homebrew', 'Homebrew', 'select-one', [
      '---choose one---', 'Create/Edit Choices...', 'Delete Choices...',
      'Enable/Disable Choices...', 'Export All', 'Import...'
    ]],
    ['character', 'Character', 'select-one', []],
    ['clear', 'Clear', 'select-one', 'bags'],
    ['randomize', 'Randomize', 'select-one', 'random']
  ];
  if(window.location.href.includes('RulesButton')) {
    quilvynElements.splice(5, 0, ['ruleRules', '', 'button', ['Rules']]);
  }
  let elements = quilvynElements.concat(ruleSet.getEditorElements());
  let htmlBits = ['<form name="editor"><table>'];
  let i;
  let bagNames = [];
  for(i = 0; i < elements.length; i++)
    if(elements[i][2].match(/bag|set/))
      // Set options to combined attr and label; refreshEditor will split them
      // once the widget is created.
      bagNames.push(elements[i][0] + ',' + elements[i][1]);
  bagNames.sort();
  for(i = 0; i < elements.length; i++) {
    let element = elements[i];
    let label = element[1];
    let name = element[0];
    let params = element[3];
    let type = element[2];
    if(params == 'bags') {
      params = ['---choose one---'].concat(bagNames);
    } else if(typeof(params) == 'string') {
      if(ruleSet.getChoices(params) == null)
        continue;
      params = QuilvynUtils.getKeys(ruleSet.getChoices(params));
      if(name == 'randomize') {
        // Set options to combined attr and label; refreshEditor will split
        // them once the widget is created.
        for(let j = 0; j < params.length; j++)
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
      let widget = type.match(/bag/) ?
        InputHtml(name, 'text', [3, '(\\+?\\d+)?']) :
        InputHtml(name, 'checkbox', null);
      let needSub = params.filter(x => x.includes('(')).length > 0;
      // Initially put full parameter list, including sub-options, into _sel.
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

/* Pops a window containing the attributes of all stored characters. */
Quilvyn.exportCharacters = function() {
  let htmlBits = [
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
  for(let path in STORAGE) {
    if(!path.startsWith(PERSISTENT_CHARACTER_PREFIX))
      continue;
    let toExport = Quilvyn.retrieveCharacterFromStorage(path);
    // In case character saved before _path attr use
    toExport['_path'] = path.substring(PERSISTENT_CHARACTER_PREFIX.length);
    let text = ObjectViewer.toCode(toExport).
      replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    htmlBits.push('<pre>\n' + text + '\n</pre><br/>\n');
  }
  htmlBits.push('</body>', '</html>');
  let exportPopup = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
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
      ('Discard changes to character?', Quilvyn.importCharacters);
    return;
  }

  if(attributes == null || attributes === true) {
    Quilvyn.textDialog(
      'Enter attribute definition from character sheet source', true, '', '',
      Quilvyn.importCharacters
    );
    return;
  }

  let index = attributes.indexOf('{');

  if(index < 0) {
    Quilvyn.textDialog(
      'Enter attribute definition from character sheet source', true,
      attributes, 'Syntax error: missing {', Quilvyn.importCharacters
    );
    return;
  }

  while(index >= 0) {
    attributes = attributes.substring(index + 1);
    let attrPat = /^\s*"((?:\\"|[^"])*)"\s*:\s*(\d+|"((?:\\"|[^"])*)"|\{)/;
    let matchInfo;
    let nesting = '';
    let importedCharacter = {};
    while((matchInfo = attributes.match(attrPat)) != null) {
      attributes = attributes.substring(matchInfo[0].length);
      let attr = matchInfo[1];
      let value =
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
    Quilvyn.removeCharacterHomebrew(character);
    character = Object.assign({}, importedCharacter);
    characterPath = character['_path'] || '';
    characterUndo = [];
    characterCache[characterPath] = QuilvynUtils.clone(character);
    Quilvyn.saveCharacter(characterPath);
    index = attributes.indexOf('{');
  }

  Quilvyn.addCharacterHomebrew(character);
  Quilvyn.refreshEditor(true);
  Quilvyn.refreshSheet();
  Quilvyn.refreshStatus(false);

};

/* Interacts with the user to change display options. */
Quilvyn.modifyOptions = function() {

  if(Quilvyn.modifyOptions.win == null) {
    // New modify
    let htmlBits = [
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
    for(let opt in userOptions) {
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
  let oldSeparateEditor = userOptions.separateEditor;
  let form = Quilvyn.modifyOptions.win.document.frm;
  for(let option in userOptions) {
    let value = InputGetValue(form[option]);
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
  } else if(userOptions.warnAboutDiscard &&
            !QuilvynUtils.clones(character, characterCache[characterPath])) {
    Quilvyn.openCharacter.savedPath = path;
    Quilvyn.confirmDialog
      ('Discard changes to character?', Quilvyn.openCharacter);
    return;
  }
  Quilvyn.removeCharacterHomebrew(character);
  character =
    Quilvyn.retrieveCharacterFromStorage(PERSISTENT_CHARACTER_PREFIX + path);
  character['_path'] = path; // In case character saved before _path attr use
  characterPath = path;
  characterUndo = [];
  characterCache[characterPath] = QuilvynUtils.clone(character);
  Quilvyn.addCharacterHomebrew(character);
  Quilvyn.refreshEditor(false);
  Quilvyn.refreshSheet();
  Quilvyn.refreshStatus(false);
};

/* Replaces the current character with one with empty attributes. */
Quilvyn.newCharacter = function(prompted) {
  if(prompted == null &&
     userOptions.warnAboutDiscard &&
     !QuilvynUtils.clones(character, characterCache[characterPath])) {
    Quilvyn.confirmDialog
      ('Discard changes to character?', Quilvyn.newCharacter);
    return;
  }
  let editForm = editWindow.editor;
  Quilvyn.removeCharacterHomebrew(character);
  character = {};
  characterPath = '';
  characterUndo = [];
  let i;
  // Skip to first character-related editor input
  for(i = 0;
      i < editForm.elements.length && editForm.elements[i].name != 'name';
      i++)
    ; /* empty */
  for( ; i < editForm.elements.length; i++) {
    let input = editForm.elements[i];
    let name = input.name;
    let type = input.type;
    if(type == 'select-one' && !name.match(/_sel|_sub/)) {
      character[name] = input.options[0].text;
      for(let j = 1; j < input.options.length; j++)
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

  let presets = ruleSet.getChoices('preset');

  if(presets == null) {
    // No window needed
  } else if(Quilvyn.randomizeCharacter.win == null) {
    // New randomize
    let htmlBits = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<title>Random Character</title>',
      '</head>',
      '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
      LOGO_TAG + '<br/>',
      '<h2>Character Attributes</h2>',
      '<form name="frm" onsubmit="return false"><table>'];
    for(let preset in presets) {
      let label;
      let presetHtml = '';
      if(presets[preset]) {
        let pieces = presets[preset].split(',');
        label = pieces[0];
        presetHtml =
          pieces[1].match(/bag/) ?
            InputHtml(preset + '_sel', 'select-one',
                      QuilvynUtils.getKeys(ruleSet.getChoices(pieces[2]))) +
            '</td><td>' +
            InputHtml(preset, 'text', [2, '(\\+?\\d+)?'])
          : pieces[1].match(/set/) ?
            InputHtml(preset + '_sel', 'select-one',
                      QuilvynUtils.getKeys(ruleSet.getChoices(pieces[2]))) +
            '</td><td>' +
            InputHtml(preset, 'checkbox', null)
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
    let callbackForSetSel =
      function() {InputSetValue(this.val, this.form.attrs[this.name.replace('_sel', '') + '.' + InputGetValue(this)])};
    let callbackForSetVal =
      function() {this.form.attrs[this.name + '.' + InputGetValue(this.sel)] = InputGetValue(this)};
    let callbackForNonSet =
      function() {this.form.attrs[this.name] = InputGetValue(this);};
    let form = Quilvyn.randomizeCharacter.win.document.frm;
    form.attrs = {};
    for(let i = 0; i < form.elements.length; i++) {
      let widget = form.elements[i];
      if(widget.name.match(/_sel/))
        continue; // Callback set at the same time as the value widget
      InputSetCallback(widget, callbackForNonSet);
      if(form[widget.name + '_sel'] != null) {
        let selWidget = form[widget.name + '_sel'];
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
  let fixedAttributes = {};
  if(Quilvyn.randomizeCharacter.win != null) {
    let form = Quilvyn.randomizeCharacter.win.document.frm;
    for(let a in form.attrs) {
      let value = form.attrs[a];
      if(typeof(value) == 'string' && value.match(/^[\+\-]?\d+$/))
        value -= 0;
      if(value)
        fixedAttributes[a] = value === true ? 1 : value;
    }
    // Quilvyn.randomizeCharacter.win.close();
    Quilvyn.randomizeCharacter.win = null;
  }
  Quilvyn.removeCharacterHomebrew(character);
  character = ruleSet.randomizeAllAttributes(fixedAttributes);
  characterPath = '';
  characterUndo = [];
  characterCache[characterPath] = QuilvynUtils.clone(character);
  Quilvyn.refreshEditor(true);
  Quilvyn.refreshSheet();
  Quilvyn.refreshStatus(false);

};

/* Adds any homebrew definitions in #character# to the current rule set. */
Quilvyn.addCharacterHomebrew = function(character) {
  if(!character.notes)
    return;
  let homebrews = character.notes.match(/^\s*homebrew\s+.*/mig);
  if(!homebrews)
    return;
  homebrews.forEach(h => {
    let m =
      h.match(/^\s*\w+\s+(\w+|"[^"]+"|'[^']+')\s+(\w+|"[^"]+"|'[^']+')/i);
    let type = m ? m[1].replaceAll(/^['"]|["']$/g, '') : null;
    let name = m ? m[2].replaceAll(/^['"]|["']$/g, '') : null;
    if(!type)
      console.log('Missing type in homebrew "' + h + '"');
    else if(!name)
      console.log('Missing name in homebrew "' + h + '"');
    else
      ruleSet.choiceRules(ruleSet, type, name, h);
  });
  if(homebrews.length > 0)
    Quilvyn.refreshEditor(true);
};

/* Removes any homebrew definitions in #character# from the current rule set. */
Quilvyn.removeCharacterHomebrew = function(character) {
  if(!character.notes || !ruleSet.removeChoice)
    return;
  let homebrews = character.notes.match(/^\s*homebrew\s+.*/mig);
  if(!homebrews)
    return;
  homebrews.forEach(h => {
    let m =
      h.match(/^\s*\w+\s+(\w+|"[^"]+"|'[^']+')\s+(\w+|"[^"]+"|'[^']+')/i);
    let type = m ? m[1].replaceAll(/^['"]|["']$/g, '') : null;
    let name = m ? m[2].replaceAll(/^['"]|["']$/g, '') : null;
    if(!type)
      console.log('Missing type in homebrew "' + h + '"');
    else if(!name)
      console.log('Missing name in homebrew "' + h + '"');
    else
      ruleSet.removeChoice(ruleSet, type, name);
  });
  Quilvyn.refreshEditor(true);
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
  let controlWindow = quilvynWindow;
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
    controlWindow = secondWindow;
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
  controlWindow.onbeforeunload = (e) => {
    if(userOptions.warnAboutDiscard &&
       !QuilvynUtils.clones(character, characterCache[characterPath])) {
      e.preventDefault();
      e.returnValue = "Changes will be discarded";
      return e.returnValue;
    }
  };
  return true;
};

/*
 * Resets the editing window fields to the values of the current character.
 * First redraws the editor if #redraw# is true.
 */
Quilvyn.refreshEditor = function(redraw) {

  let i;

  if(redraw) {
    let htmlBits = [
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
    let updateListener = function() {Quilvyn.update(this);};
    let selectSpellsListener = function(e) {
      if(event.code == 'KeyY' && (event.ctrlKey || event.metaKey)) {
        Quilvyn.selectSpells();
      }
    }
    let undoListener = function(e) {
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
    let widget = editWindow.editor.clear;
    widget.attrs = InputGetParams(widget).map(x=>x.replace(/,.*/, ''));
    InputSetOptions
      (widget, InputGetParams(widget).map(x => x.replace(/.*,/, '')));
    widget = editWindow.editor.randomize;
    widget.attrs = InputGetParams(widget).map(x=>x.replace(/,.*/, ''));
    InputSetOptions
      (widget, InputGetParams(widget).map(x=>x.replace(/.*,/, '')));
  }

  let characterOpts = [];
  let editForm = editWindow.editor;
  for(let path in STORAGE) {
    if(path.startsWith(PERSISTENT_CHARACTER_PREFIX))
      characterOpts.push(path.substring(PERSISTENT_CHARACTER_PREFIX.length));
  }
  characterOpts = characterOpts.sort();
  characterOpts.unshift(
    '---choose one---', 'New', 'Random...', 'Save', 'Save As...', 'Print...',
    'Delete...', 'HTML', 'Import...', 'Export', 'Summary'
  );
  InputSetOptions(editForm.rules, QuilvynUtils.getKeys(ruleSets));
  InputSetOptions(editForm.character, characterOpts);
  if(characterPath)
    InputSetValue(editForm.character, characterPath);

  // Skip to first character-related editor input
  for(i = 0;
      i < editForm.elements.length && editForm.elements[i].name != 'name';
      i++)
    ; /* empty */
  for( ; i < editForm.elements.length; i++) {
    let input = editForm.elements[i];
    let name = input.name;
    let chk = editForm[name + '_chk'];
    let sel = editForm[name + '_sel'];
    let value = null;
    if(name.match(/_sel|_sub/)) {
      if(name.includes('_sel') && !input.allOpts)
        // editorHtml gave us the full options in _sel; save for later filtering
        input.allOpts = InputGetParams(input);
      let prefix = name.substring(0, name.indexOf('_s'));
      sel = name.includes('_sel') ? input : editForm[prefix + '_sel'];
      let filter = (character[prefix + '_filter'] || '').toUpperCase();
      let options = sel.allOpts.filter(x => x.toUpperCase().includes(filter));
      // Seek an option for which character contains a non-null value
      for(let a in character) {
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
        let selValue = InputGetValue(sel);
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
      let sub = editForm[name + '_sub'];
      // Construct full attr name from the current sel value and any sub value
      let attrName = name + '.' + InputGetValue(sel) + (sub && sub.options.length > 0 ? '(' + InputGetValue(sub) + ')' : '');
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

  let a;
  let computed = ruleSet.applyRules(character);
  let differences = [];
  let errors = 0;
  let original = characterCache[characterPath];
  let warnings = 0;

  for(a in Object.assign({}, original, character)) {
    if(original[a] == character[a])
      continue;
    let attr = a;
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

  let htmlBits = [
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

  let notes = ruleSet.getChoices('notes');
  htmlBits = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<title>Errors</title>',
    '</head>' +
    '<body ' + Quilvyn.htmlBackgroundAttr() + '>',
  ];
  for(let a in computed) {
    if(!a.match('^validation|^sanity') || !computed[a] || a.match(/\.\d+$/))
      continue;
    let name = a.replace(/^.*Notes./, '');
    name = name.charAt(0).toUpperCase() + name.substring(1).replace(/([a-z\)])([A-Z\(])/g, '$1 $2');
    let note =
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
  let result = {};
  STORAGE.getItem(path).split('\t').forEach(attr => {
    if(attr.includes('=')) {
      let name = attr.split('=', 1)[0];
      let value = attr.substring(name.length + 1);
      result[name] = value.match(/^[-+]?\d+$/) ? +value : value;
    }
  });
  return result;
};

/* Interacts w/user to preserve current character in persistent storage. */
Quilvyn.saveCharacter = function(path) {

  if(!path) {
    let defaultPath = character['_path'] || character.name || 'Noname';
    Quilvyn.textDialog(
      'Save ' + character.name + ' as', false, defaultPath, '',
      Quilvyn.saveCharacter
    );
    return;
  }

  character['_path'] = path;
  character['_timestamp'] = Date.now();
  let stringified = '';
  for(let attr in character) {
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
  let filter = (character['spells_filter'] || '').toUpperCase();
  for(let spell in ruleSet.getChoices('spells')) {
    if(spell.toUpperCase().includes(filter))
      character['spells.' + spell] = 1;
  }
  Quilvyn.refreshEditor(true);
  Quilvyn.refreshSheet();
  Quilvyn.refreshStatus(false);
  editWindow.focus();
};

/* Returns the character sheet HTML for the current character. */
Quilvyn.sheetHtml = function(attrs) {

  let a;
  let computedAttributes;
  let enteredAttributes = QuilvynUtils.clone(attrs);
  let i;
  let rulesExtras = ruleSet.getChoices('extras') || {};
  let sheetAttributes = {};

  enteredAttributes.hidden = userOptions.hidden;
  for(a in enteredAttributes) {
    if(typeof(enteredAttributes[a]) == 'string') {
      enteredAttributes[a] = enteredAttributes[a].replaceAll('<', '&lt;').
        replace(new RegExp('&lt;(?=/?(' + ALLOWED_TAGS.join('|') + ')\\b)', 'g'), '<');
    }
  }
  computedAttributes = ruleSet.applyRules(enteredAttributes);
  let formats = ruleSet.getFormats(ruleSet, userOptions.style);
  for(a in computedAttributes) {
    if(a.match(/\.\d+$/))
      continue; // Ignore format multi-values
    if(a.match(/^sanity|^validation/) && !userOptions.validation)
      continue; // Sheet validation reporting replaced by editor status line
    let isNote = a.indexOf('Notes') > 0;
    let name = a;
    // For readability, add spaces before capital letters in mixed-case portions
    // of the name, taking care not to split up trailing Roman numerals.
    name = name.replace(/([^IXV\s])([IXV]+)$/, '$1 $2');
    name = name.replaceAll(/\b(\w*[a-z]\w*)\b/g, x => x.charAt(0) + x.substring(1).replaceAll(/([A-Z])/g, ' $1'));
    name = name.replaceAll(/\)([A-Z\(])/g, ') $1');
    name = name.replaceAll(/([\w])\(/g, '$1 (');
    name = name.substring(0, 1).toUpperCase() + name.substring(1);
    let value = computedAttributes[a];
    if(isNote && value == 0)
      continue; // Suppress notes with zero value
    if((a.match(/^spellSlots/) && userOptions.spell == 'Points') ||
       (a == 'spellPoints' && userOptions.spell == 'Slots'))
      continue;
    if(formats[a] != null) {
      value = formats[a].replace(/%V/g, value)
                        .replace(/%S/g, value>=0 ? '+' + value : value);
      for(let j = 1; computedAttributes[a + '.' + j] != null; j++) {
        value = value.replace(new RegExp('%' + j, 'g'), computedAttributes[a + '.' + j]);
      }
      let interpolations = value.match(/%\{[^}]+\}/g);
      if(interpolations) {
        for(let i = 0; i < interpolations.length; i++) {
          let interp = interpolations[i];
          let expr = new Expr(interp.substring(2, interp.length - 1));
          value = value.replace(interp, expr.eval(computedAttributes));
        }
      }
      value = value.replaceAll('+-', '-');
    } else if(isNote && typeof(value) == 'number') {
      value = QuilvynUtils.signed(value);
    }
    if(!userOptions.extras &&
       (a in rulesExtras || a.split('.')[0] in rulesExtras))
      continue;
    sheetAttributes[name] = value;
    if((i = name.indexOf('.')) >= 0) {
      // For features that have multiple notes in a single section, remove
      // the trailing -N from the name
      if(isNote &&
         name.match(/\S-\d+$/) &&
         a.replace(/-\d+$/, '') in computedAttributes)
        name = name.replace(/-\d+$/, '');
      let object = name.substring(0, i);
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
      sheetAttributes[object].push(value);
    }
  }

  for(a in sheetAttributes) {
    let attr = sheetAttributes[a];
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

  let attrImage = 'var attributes = ' + ObjectViewer.toCode(attrs) + ';\n';
  if(attrs.notes && attrs.notes.indexOf('+COMPUTE') >= 0) {
    attrImage +=
      'var computed = ' + ObjectViewer.toCode(computedAttributes) + ';\n';
  }

  let versions =
    'Quilvyn version ' + VERSION + '; ' + [ruleSet.getName() + ' version ' + ruleSet.getVersion()].concat(ruleSet.getPlugins().map(x => x.name + ' version ' + x.VERSION)).join('; ');

  let bodyBackgroundAttr = userOptions.sheetImage ?
    ' style="background-image:url(' + userOptions.sheetImage +
    (userOptions.sheetImage.match(/\.\w+$/) ? '' : '.jpg') + ')"' : '';
  let viewer = ruleSet.getViewer(userOptions.style) ||
               ruleSet.getViewer('Standard');
  let result =
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
  let html = '';
  for(let path in STORAGE) {
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
  for(let a in userOptions) {
    STORAGE.setItem(PERSISTENT_INFO_PREFIX + a, userOptions[a] + '');
  }
};

/*
 * Opens a window that displays a summary of the attributes of all characters
 * that have been loaded into the editor.
 */
Quilvyn.summarizeCachedAttrs = function() {
  let combinedAttrs = { };
  let htmlBits = [
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
  let formats = ruleSet.getFormats(ruleSet, userOptions.style);
  for(let character in characterCache) {
    if(character == '')
      continue;
    let attrs = ruleSet.applyRules(characterCache[character]);
    for(let attr in attrs) {
      if(ruleSet.isSource(attr) ||
         attr.indexOf('features.') >= 0 ||
         attr.match(/\.[0-9]+$/))
        continue;
      let value = attrs[attr];
      if(attr.indexOf('Notes.') >= 0 && value == 0)
        continue;
      if(combinedAttrs[attr] == null)
        combinedAttrs[attr] = [];
      let format = formats[attr];
      if(format != null)
        value = format.replace(/%V/g, value);
      combinedAttrs[attr].push(value);
    }
  }
  let keys = QuilvynUtils.getKeys(combinedAttrs);
  keys.sort();
  for(let i = 0; i < keys.length; i++) {
    let attr = keys[i];
    let values = combinedAttrs[attr];
    values.sort();
    let unique = [];
    for(let j = 0; j < values.length; j++) {
      let value = values[j];
      let count = 1;
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

/* Interacts with the user to change to a different rule set. */
Quilvyn.switchRuleSet = function(prompted) {
  let newSet =
    Quilvyn.switchRuleSet.pending || InputGetValue(editWindow.editor.rules);
  if(prompted == null &&
     userOptions.warnAboutDiscard &&
     !QuilvynUtils.clones(character, characterCache[characterPath])) {
    Quilvyn.switchRuleSet.pending = newSet;
    InputSetValue(editWindow.editor.rules, ruleSet.getName());
    Quilvyn.confirmDialog
      ('Discard changes to character?', Quilvyn.switchRuleSet);
    return;
  }
  InputSetValue(editWindow.editor.rules, newSet);
  ruleSet = ruleSets[newSet];
  Quilvyn.switchRuleSet.pending = null;
  Quilvyn.refreshEditor(true);
  Quilvyn.newCharacter(true);
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

  let htmlBits;
  let name = input.name;
  let value = InputGetValue(input);
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
    Quilvyn.switchRuleSet();
  } else if(name == 'rulesNotes') {
    if(Quilvyn.rulesNotesWindow == null || Quilvyn.rulesNotesWindow.closed) {
      Quilvyn.rulesNotesWindow = window.open('');
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
    let awin = window.open('', '', FEATURES_OF_OTHER_WINDOWS);
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
      if(window.location.href.includes('GroupHTML'))
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
  } else if(name == 'homebrew') {
    input.selectedIndex = 0;
    if(value == 'Create/Edit Choices...')
      Quilvyn.homebrewModifyChoices();
    else if(value == 'Delete Choices...')
      Quilvyn.homebrewDeleteChoices(null);
    else if(value == 'Enable/Disable Choices...')
      Quilvyn.homebrewEnableChoices();
    else if(value == 'Export All')
      Quilvyn.homebrewExportChoices(null);
    else if(value == 'Import...')
      Quilvyn.homebrewImportChoices(null);
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
    for(let a in character) {
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
    let sub = editWindow.editor[name + '_sub'];
    if(sub) {
      // Update the sub-menu any suboptions of the new _sel value
      let filter = (character[name + '_filter'] || '').toUpperCase();
      let subOpts = input.allOpts
          .filter(x => x.startsWith(value + '(') && x.toUpperCase().includes(filter))
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
    let selector = editWindow.editor[name + '_sel'];
    let attr = name;
    if(selector != null) {
      let subselector = editWindow.editor[name + '_sub'];
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
