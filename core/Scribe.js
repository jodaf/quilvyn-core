/* $Id: Scribe.js,v 1.198 2007/03/16 19:09:21 Jim Exp $ */

var COPYRIGHT = 'Copyright 2007 James J. Hayes';
var VERSION = '0.39.16';
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
'Temple Place, Suite 330, Boston, MA 02111-1307 USA.\n' +
'Thanks to my dungeon crew, especially fellow DM Rich Hakesley, for patient ' +
'testing of the program and for making suggestions that greatly improved it.';

var COOKIE_FIELD_SEPARATOR = '\n';
var COOKIE_NAME = 'ScribeCookie';
var EMPTY_SPELL_LIST = '--- No spell categories selected ---';
var FEATURES_OF_OTHER_WINDOWS = 'height=750,width=750,resizable,scrollbars';
var TIMEOUT_DELAY = 1000; // One second

var cachedAttrs = {}; // Unchanged attrs of all characters opened so far
var character;      // Current character
var characterUrl;   // URL of current character
var cookieInfo = {  // What we store in the cookie
  dmonly: '0',      // Show information marked "dmonly" on sheet?
  italics: '1',     // Show italicized notes on sheet?
  recent: '',       // Comma-separated and -terminated list of recent opens
  untrained: '0',   // Show untrained skills on sheet?
  viewer: ''        // Preferred arrangement of character sheet
};
var editForm;       // Character editing form (editWindow.document.forms[0])
var editWindow = null; // Window where editor is shown
var loadingPopup = null; // Current "loading" message popup window
var spellFilter = "";
var ruleSets = {};  // ScribeRules with standard + user rules
var ruleSet = null; // The rule set currently in use
var sheetWindow = null; // Window where character sheet is shown
var urlLoading = null; // Character URL presently loading

/* Launch routine called after all Scribe scripts are loaded. */
function Scribe() {

  var defaults = {
    'BACKGROUND':'wheat',
    'FEATURES_OF_EDIT_WINDOW':'height=750,width=500,resizable,scrollbars',
    'FEATURES_OF_SHEET_WINDOW':'height=750,width=750,resizable,scrollbars',
    'HELP_URL':'scribedoc.html',
    'LOGO_URL':'scribe.gif',
    'MAX_RECENT_OPENS':20,
    'URL_PREFIX':'',
    'URL_SUFFIX':'.html',
    'WARN_ABOUT_DISCARD':true
  };

  if(InputGetValue == null || ObjectViewer == null || RuleEngine == null ||
     ScribeRules == null || ScribeUtils == null) {
    alert('JavaScript modules needed by Scribe are missing; exiting');
    return;
  }

  for(var a in defaults) {
    if(window[a] == null)
      window[a] = defaults[a];
  }

  var i = document.cookie.indexOf(COOKIE_NAME + '=');
  if(i >= 0) {
    var end = document.cookie.indexOf(';', i);
    if(end < 0)
      end = document.cookie.length;
    var cookie = document.cookie.substring(i + COOKIE_NAME.length + 1, end);
    var settings = unescape(cookie).split(COOKIE_FIELD_SEPARATOR);
    for(i = 1; i < settings.length; i += 2) {
      if(cookieInfo[settings[i - 1]] != null)
        cookieInfo[settings[i - 1]] = settings[i];
    }
  }

  if(CustomizeScribe != null)
    CustomizeScribe();
  character = {};
  Scribe.randomizeCharacter(false);
  Scribe.popUp('<img src="' + LOGO_URL + '" alt="Scribe"/><br/>' +
               COPYRIGHT + '<br/>' +
               'Press the "About" button for more info',
               'Ok:window.close();');

}

// TODO Move to ScribeRules/PH35
Scribe.ABILITY_CHOICES = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
];
Scribe.editorElements = [
  ['about', ' ', 'button', ['About']],
  ['help', '', 'button', ['Help']],
  ['rules', 'Rules', 'select-one', []],
  ['ruleattributes', '', 'button', ['Attributes']],
  ['file', ' ', 'select-one', []],
  ['summary', '', 'button', ['Summary']],
  ['view', '', 'button', ['View Html']],
  ['italics', 'Show', 'checkbox', ['Italic Notes']],
  ['untrained', '', 'checkbox', ['Untrained Skills']],
  ['dmonly', '', 'checkbox', ['DM Info']],
  ['viewer', '', 'select-one', []],
  ['randomize', ' ', 'select-one', 'random'],
  ['name', 'Name', 'text', [20]],
  ['race', 'Race', 'select-one', 'races'],
  ['experience', 'Experience', 'text', [8]],
  ['levels', 'Levels', 'bag', 'classes'],
  ['imageUrl', 'Image URL', 'text', [20]],
  ['strength', 'Strength', 'select-one', Scribe.ABILITY_CHOICES],
  ['intelligence', 'Intelligence', 'select-one', Scribe.ABILITY_CHOICES],
  ['wisdom', 'Wisdom', 'select-one', Scribe.ABILITY_CHOICES],
  ['dexterity', 'Dexterity', 'select-one', Scribe.ABILITY_CHOICES],
  ['constitution', 'Constitution', 'select-one', Scribe.ABILITY_CHOICES],
  ['charisma', 'Charisma', 'select-one', Scribe.ABILITY_CHOICES],
  ['player', 'Player', 'text', [20]],
  ['alignment', 'Alignment', 'select-one', 'alignments'],
  ['gender', 'Gender', 'select-one', 'genders'],
  ['deity', 'Deity', 'select-one', 'deities'],
  ['origin', 'Origin', 'text', [20]],
  ['feats', 'Feats', 'set', 'feats'],
  ['selectableFeatures', 'Selectable Features', 'bag', 'selectableFeatures'],
  ['skills', 'Skills', 'bag', 'skills'],
  ['languages', 'Languages', 'set', 'languages'],
  ['hitPoints', 'Hit Points', 'text', [4]],
  ['armor', 'Armor', 'select-one', 'armors'],
  ['shield', 'Shield', 'select-one', 'shields'],
  ['weapons', 'Weapons', 'bag', 'weapons'],
  ['spellfilter', 'Spell Filter', 'text', [20]],
  ['spells', 'Spells', 'set', 'spells'],
  ['goodies', 'Goodies', 'bag', 'goodies'],
  ['domains', 'Cleric Domains', 'set', 'domains'],
  ['specialize', 'Wizard Specialization', 'set', 'schools'],
  ['prohibit', 'Wizard Prohibition', 'set', 'schools'],
  ['notes', 'Notes', 'textarea', [40,10]],
  ['dmNotes', 'DM Notes', 'textarea', [40,10]]
];

/* Adds #rs# to Scribe's list of supported rule sets. */
Scribe.addRuleSet = function(rs) {
  // Add a  rule for handling DM-only information
  rs.defineRule('dmNotes', 'dmonly', '?', null);
  ruleSets[rs.getName()] = rs;
  ruleSet = rs;
};

/* Returns HTML for the character editor form. */
Scribe.editorHtml = function() {
  var htmlBits = ['<form name="frm"><table>'];
  for(var i = 0; i < Scribe.editorElements.length; i++) {
    var element = Scribe.editorElements[i];
    var label = element[1];
    var name = element[0];
    var params = element[3];
    var type = element[2];
    if(typeof(params) == 'string') {
      if(ruleSet.getChoices(params) == null)
        continue;
      params = ScribeUtils.getKeys(ruleSet.getChoices(params));
      if(name == 'randomize')
        params = ['---randomize---'].concat(params);
    }
    if(label != '' || i == 0) {
      if(i > 0) {
        htmlBits[htmlBits.length] = '</td></tr>';
      }
      htmlBits[htmlBits.length] = '<tr><th>' + label + '</th><td>';
    }
    if(type == 'bag' | type == 'set') {
      var widget = type == 'bag' ? InputHtml(name, 'text', [3]) :
                                   InputHtml(name, 'checkbox', null);
      htmlBits[htmlBits.length] =
        '  ' +
        InputHtml(name + '_sel', 'select-one', params) +
        widget +
        InputHtml(name + '_clear', 'button', ['Clear All']);
    } else {
      htmlBits[htmlBits.length] = '  ' + InputHtml(name, type, params);
    }
  }
  htmlBits = htmlBits.concat(['</td></tr>', '</table></form>']);
  var result = htmlBits.join('\n');
  return result;
};

/*
 * Starts the process of loading #name# (a full or partial URL) into the editor
 * and character sheet windows.  Schedules repeated calls of itself, ignoring
 * new calls, until either the character is loaded or the user cancels.
 */
Scribe.loadCharacter = function(name) {
  var url = name;
  if(!url.match(/^\w*:/))
    url = URL_PREFIX + url;
  if(!url.match(/\.\w*$/))
    url += URL_SUFFIX;
  if(urlLoading == url && loadingPopup.closed) {
    urlLoading = null; // User cancel
    Scribe.refreshSheet();
  } else if(urlLoading == url && sheetWindow.attributes != null) {
    // Character done loading
    var i;
    // Place loaded name at head of New/Open list
    var names = cookieInfo.recent.split(',');
    names.length--; // Trim trailing empty element
    for(i = 0; i < names.length && names[i] != name; i++)
      ; // empty
    if(i < names.length)
      names = names.slice(0, i).concat(names.slice(i + 1));
    names = [name].concat(names);
    if(names.length > MAX_RECENT_OPENS)
      names.length = MAX_RECENT_OPENS;
    cookieInfo.recent = names.join(',') + ',';
    Scribe.storeCookie();
    character = {};
    // Turn objects into "dot" attributes and convert values from prior
    // versions of Scribe.
    for(var a in sheetWindow.attributes) {
      var value = sheetWindow.attributes[a];
      if(typeof value == 'object') {
        for(var x in value) {
          if(a == 'combatStyle') {
            character['selectableFeatures.Combat Style (' + x + ')'] = '1';
          } else if(a == 'feats' && '/Combat Style (Archery)/Combat Style (Two Weapon Combat)/Crippling Strike/Defensive Roll/Improved Evasion/Opportunist/Slippery Mind/'.indexOf('/' + x + '/') >= 0) {
            character['selectableFeatures.' + x] = '1';
          } else if(a == 'focus')
            character['feats.Weapon Focus (' + x + ')'] = '1';
          else if(a == 'specialization') {
            character['feats.Weapon Specialization (' + x + ')'] = '1';
          } else {
            var convertedName = x;
            while((i = convertedName.search(/\([a-z]/)) >= 0) {
              convertedName =
                convertedName.substring(0, i + 1) +
                convertedName.substring(i + 1, i + 2).toUpperCase() +
                convertedName.substring(i + 2);
            }
            if(a == 'domains' && (i = convertedName.indexOf(' Domain')) >= 0)
              convertedName = convertedName.substring(0, i);
            else if(a == 'feats' && x == 'Expertise')
              convertedName = 'Combat Expertise';
            else if(a == 'skills' && x == 'Pick Pocket')
              convertedName = 'Sleight Of Hand';
            else if(a == 'skills' && x == 'Wilderness Lore')
              convertedName = 'Survival';
            else if(a == 'spells' && !x.match(/\(.* .*\)/)) {
              var prefix = x.replace(/\)/, '');
              for(var b in ruleSet.getChoices('spells')) {
                if(b.indexOf(prefix) == 0) {
                  convertedName = b;
                  break;
                }
              }
            } else if(a == 'weapons' && (i = convertedName.indexOf(' (')) >= 0)
              convertedName = convertedName.substring(0, i);
            character[a + '.' + convertedName] = value[x];
          }
        }
      } else if(a == 'shield' && value.indexOf('Large') == 0) {
        character[a] = 'Heavy' + value.substring(5);
      } else if(a == 'shield' && value.indexOf('Small') == 0) {
        character[a] = 'Light' + value.substring(5);
      } else {
        character[a] = value;
      }
    }
    // Prior Scribe versions assumed some defaults that we no longer assume
    var OLD_DEFAULTS = {
      'alignment':'Neutral Good', 'armor':'None', 'charisma':10,
      'constitution':10, 'deity':'None', 'dexterity':10, 'experience':0,
      'gender':'Male', 'hitPoints':0, 'intelligence':10,
      'name':'New Character', 'race':'Human', 'shield':'None', 'strength':10,
      'wisdom':10
    };
    for(var a in OLD_DEFAULTS) {
      if(character[a] == null)
        character[a] = OLD_DEFAULTS[a];
    }
    Scribe.refreshEditor(false);
    Scribe.refreshSheet();
    characterUrl = url;
    cachedAttrs[characterUrl] = ScribeUtils.clone(character);
    urlLoading = null;
    if(!loadingPopup.closed)
      loadingPopup.close();
  } else if(urlLoading == null) {
    // Nothing presently loading
    urlLoading = url;
    loadingPopup =
      Scribe.popUp('Loading character from ' + url, 'Cancel:window.close();');
    if(sheetWindow == null || sheetWindow.closed)
      sheetWindow = window.open('', 'scribeSheet', FEATURES_OF_SHEET_WINDOW);
    try {
      sheetWindow.location = url;
    } catch(e) {
      loadingPopup.close();
      urlLoading = null;
      Scribe.refreshSheet();
      alert('Attempt to load ' + url + ' failed');
    }
    if(urlLoading != null)
      setTimeout('Scribe.loadCharacter("' + name + '")', TIMEOUT_DELAY);
  } else {
    // Something (possibly this function) in progress; try again later
    setTimeout('Scribe.loadCharacter("' + name + '")', TIMEOUT_DELAY);
  }
};

/* Prompts the user for a character URL and starts the load. */
Scribe.openDialog = function() {
  if(loadingPopup != null && !loadingPopup.closed)
    return; // Ignore during load
  var name = prompt('Enter URL to Edit (Blank for Random Character)', '');
  if(name == null)
    return; // User cancel
  else if(name == '')
    Scribe.randomizeCharacter(true);
  else
    Scribe.loadCharacter(name);
};

/*
 * Returns a popup window containing #html# and an optional set of #buttons#,
 * each of which has the form label:action.
 */
Scribe.popUp = function(html, button /*, button ... */) {
  var popup = window.open
    ('', 'pop' + Scribe.popUp.next++, 'height=200,width=400');
  var content = '<html><head><title>Scribe Message</title></head>\n' +
                '<body bgcolor="' + BACKGROUND + '">' + html +
                '<br/>\n<form>\n';
  for(var i = 1; i < arguments.length; i++) {
    pieces = arguments[i].split(/:/);
    content +=
      '<input type="button" value="' + pieces[0] + '" ' +
                           'onclick="' + pieces[1] + '"/>\n';
  }
  content += '</form>\n</body></html>';
  popup.document.write(content);
  popup.document.close();
  return popup;
};
Scribe.popUp.next = 0;

/*
 * Replaces the current character with one that has all randomized attributes.
 * If #prompt# is true, allows the user to specify race and class level(s).
 */
Scribe.randomizeCharacter = function(prompt) {
  if(!prompt || (urlLoading == 'random' && loadingPopup.okay != null)) {
    // Ready to generate
    var fixedAttributes = {};
    if(prompt) {
      for(i = 0; i < loadingPopup.document.frm.elements.length; i++) {
        var element = loadingPopup.document.frm.elements[i];
        var name = element.name;
        var value = InputGetValue(element);
        if(element.type=='button' || name==null || value==null || value=='')
          continue;
        fixedAttributes[name] = value;
      }
    }
    character = ruleSet.randomizeAllAttributes(fixedAttributes);
    Scribe.refreshEditor(false);
    Scribe.refreshSheet();
    characterUrl = 'random';
    cachedAttrs[characterUrl] = ScribeUtils.clone(character);
    if(loadingPopup != null)
      loadingPopup.close();
    urlLoading = null;
  } else if(urlLoading == 'random' && loadingPopup.closed) {
    urlLoading = null; // User cancel
  } else if(urlLoading == null) {
    // Nothing presently loading
    var presets = ruleSet.getChoices('preset');
    if(presets == null) {
      return Scribe.randomizeCharacter(false);
    }
    urlLoading = 'random';
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
      var name = preset.replace(/([a-z\)])([A-Z\(])/g, '$1 $2');
      name = name.substring(0, 1).toUpperCase() + name.substring(1);
      var presetHtml = '<tr><td><b>' + name + '</b></td>';
      var widget = editForm[preset];
      var selWidget = editForm[preset + '_sel'];
      if(widget != null) {
        if(selWidget == null) {
          presetHtml += '<td>' +
                        InputHtml(preset, widget.type, InputGetParams(widget)) +
                        '</td></tr>';
        } else {
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
        }
      }
      htmlBits[htmlBits.length] = presetHtml;
    }
    htmlBits = htmlBits.concat([
      '</table></form>',
      '<form>',
      '<input type="button" value="Ok" onclick="okay=1;"/>',
      '<input type="button" value="Cancel" onclick="window.close();"/>',
      '</form></body></html>'
    ]);
    var html = htmlBits.join('\n') + '\n';
    loadingPopup = window.open('', 'randomWin', FEATURES_OF_OTHER_WINDOWS);
    loadingPopup.document.write(html);
    loadingPopup.document.close();
    // Randomize the value of each pull-down menu in the loading window
    for(var i = 0; i < presets.length; i++) {
      var widget = loadingPopup.document.frm[presets[i]];
      if(typeof widget == 'object' && widget != null &&
         widget.selectedIndex != null) {
        widget.selectedIndex = ScribeUtils.random(0, widget.options.length - 1);
      }
    }
    loadingPopup.okay = null;
    setTimeout('Scribe.randomizeCharacter(' + prompt + ')', TIMEOUT_DELAY);
  } else {
    // Something (possibly this function) in progress; try again later
    setTimeout('Scribe.randomizeCharacter(' + prompt + ')', TIMEOUT_DELAY);
  }
};

/*
 * Resets the editing window fields to the values of the current character.
 * First redraws the editor if #redraw# is true.
 */
Scribe.refreshEditor = function(redraw) {

  var i;

  if(editWindow == null || editWindow.closed) {
    editWindow = window.open('', 'scribeEditor', FEATURES_OF_EDIT_WINDOW);
    redraw = true;
  }
  if(redraw) {
    var editHtml =
      '<html><head><title>Scribe Editor Window</title></head>\n' +
      '<body bgcolor="' + BACKGROUND + '">\n' +
      '<img src="' + LOGO_URL + ' "/><br/>\n' +
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

  var fileOpts = cookieInfo.recent.split(',');
  fileOpts.length--; /* Trim trailing empty element */
  fileOpts = ['--New/Open--', 'New...', 'Open...'].concat(fileOpts);
  var spellOpts = [];
  var spells = ruleSet.getChoices('spells');
  for(var a in spells) {
    if(spellFilter == "" || a.indexOf(spellFilter) >= 0) {
      spellOpts[spellOpts.length] = a;
    }
  }
  if(spellOpts.length == 0)
    spellOpts[spellOpts.length] = EMPTY_SPELL_LIST;
  spellOpts.sort();

  InputSetOptions(editForm.file, fileOpts);
  InputSetOptions(editForm.rules, ScribeUtils.getKeys(ruleSets));
  InputSetOptions(editForm.spells_sel, spellOpts);
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
  // Regenerate the skill options to reflect the character's cross/class skills
  var attrs = ruleSet.applyRules(character);
  for(i = 0; i < editForm.skills_sel.options.length; i++) {
    var opt = editForm.skills_sel.options[i];
    opt.text =
      opt.value + (attrs['classSkills.' + opt.value] == null ? ' (cc)' : '');
  }

  InputSetValue(editForm.dmonly, cookieInfo.dmonly == '1');
  InputSetValue(editForm.italics, cookieInfo.italics == '1');
  InputSetValue(editForm.rules, ruleSet.getName());
  InputSetValue(editForm.spellfilter, spellFilter);
  InputSetValue(editForm.untrained, cookieInfo.untrained == '1');
  InputSetValue(editForm.viewer, cookieInfo.viewer);

};

/* Draws the sheet for the current character in the character sheet window. */
Scribe.refreshSheet = function() {
  if(sheetWindow == null || sheetWindow.closed)
    sheetWindow = window.open('', 'scribeSheet', FEATURES_OF_SHEET_WINDOW);
  sheetWindow.document.write(Scribe.sheetHtml());
  sheetWindow.document.close();
};

/* Returns the character sheet HTML for the current character. */
Scribe.sheetHtml = function() {

  var a;
  var codeAttributes = {};
  var computedAttributes;
  var enteredAttributes = ScribeUtils.clone(character);
  var i;
  var sheetAttributes = {};

  // Turn "dot" attributes into objects
  for(a in character) {
    if((i = a.indexOf('.')) < 0) {
      codeAttributes[a] = enteredAttributes[a];
    } else {
      var object = a.substring(0, i);
      if(codeAttributes[object] == null)
        codeAttributes[object] = {};
      codeAttributes[object][a.substring(i + 1)] = enteredAttributes[a];
    }
  }

  // If so directed, add computed non-zero values for untrained skills
  if(cookieInfo.untrained == '1') {
    var skills = ruleSet.getChoices('skills');
    for(a in skills) {
      if(character['skills.' + a] == null && skills[a].indexOf('/trained') < 0)
        enteredAttributes['skills.' + a] = 0;
    }
  }
  enteredAttributes.dmonly = cookieInfo.dmonly;
  computedAttributes = ruleSet.applyRules(enteredAttributes);
  if(cookieInfo.untrained == '1') {
    var skills = ruleSet.getChoices('skills');
    for(a in skills) {
      if(character['skills.' + a] == null &&
         computedAttributes['skills.' + a] == 0)
        delete computedAttributes['skills.' + a];
    }
  }
  // NOTE: ObjectFormatter doesn't support interspersing values in a list
  // (e.g., skill ability, weapon damage), so we do some inelegant manipulation
  // of sheetAttributes' names and values here to get the sheet to look right.
  var notes = ruleSet.getChoices('notes');
  var strengthDamageAdjustment =
    computedAttributes['combatNotes.strengthDamageAdjustment'];
  if(strengthDamageAdjustment == null)
    strengthDamageAdjustment = 0;
  for(a in computedAttributes) {
    var name = a.replace(/([a-z\)])([A-Z\(])/g, '$1 $2');
    name = name.substring(0, 1).toUpperCase() + name.substring(1);
    var value = computedAttributes[a];
    // Add entered value in brackets if it differs from computed value
    if(enteredAttributes[a] != null && enteredAttributes[a] != value)
      value += '[' + enteredAttributes[a] + ']';
    if((i = name.indexOf('.')) < 0) {
      if(name == 'imageUrl' && !value.match(/^\w*:/))
        value = URL_PREFIX + value;
      sheetAttributes[name] = value;
    } else {
      var object = name.substring(0, i);
      name = name.substring(i + 1, i + 2).toUpperCase() + name.substring(i + 2);
      if(object.indexOf('Notes') >= 0 && typeof(value) == 'number') {
        if(value == 0)
          continue; // Suppress notes with zero value
        else if(notes[a] == null)
          value = ScribeUtils.signed(value); // Make signed if not formatted
      }
      if(notes[a] != null)
        value = notes[a].replace(/%V/, value);
      if(object == 'Skills') {
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
             PH35.weaponsSmallDamage[damage] != null) {
            damage = PH35.weaponsSmallDamage[damage];
          } else if(computedAttributes['features.Large'] &&
                    PH35.weaponsLargeDamage[damage] != null) {
            damage = PH35.weaponsLargeDamage[damage];
          }
          if(additional != 0)
            damage += ScribeUtils.signed(additional);
          damages[i] = damage + ' x' + multiplier + '@' + threat;
        }
        name += '(' + ScribeUtils.signed(attack) + ' ' + damages.join('/') +
                (range != null ? ' R' + range : '') + ')';
      }
      value = name + ': ' + value;
      if(object.indexOf('Notes') > 0 && ruleSet.isSource(a)) {
        if(cookieInfo.italics == '1')
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
    if(typeof attr == 'object') {
      attr.sort();
      // If all values in the array are 1|true, assume that it's a set and
      // suppress display of the values
      if(attr.join(',').replace(/: (1|true)(,|$)/g, '').indexOf(':') < 0)
        for(i = 0; i < attr.length; i++)
          attr[i] = attr[i].replace(/:.*/, '');
      sheetAttributes[a] = attr;
    }
  }

  return '<' + '!' + '-- Generated ' + new Date().toString() +
           ' by Scribe version ' + VERSION + ' --' + '>\n' +
         '<html>\n' +
         '<head>\n' +
         '  <title>' + sheetAttributes.Name + '</title>\n' +
         '  <script>\n' +
         'var attributes = ' + ObjectViewer.toCode(codeAttributes) + ';\n' +
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

/* Stores the current values of cookieInfo in the browser cookie. */
Scribe.storeCookie = function() {
  var cookie = '';
  for(var p in cookieInfo) {
    cookie +=
      p + COOKIE_FIELD_SEPARATOR + cookieInfo[p] + COOKIE_FIELD_SEPARATOR;
  }
  cookie = COOKIE_NAME + '=' + escape(cookie);
  var nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  cookie += ';expires=' + nextYear.toGMTString();
  document.cookie = cookie;
};

/*
 * Opens a window that displays a summary of the attributes of all characters
 * that have been loaded into the editor.
 */
Scribe.summarizeCachedAttrs = function() {
  var allAttrs = {};
  for(var a in cachedAttrs) {
    if(a != 'random')
      allAttrs[a] = ruleSet.applyRules(cachedAttrs[a]);
  }
  var urls = ScribeUtils.getKeys(allAttrs);
  var htmlBits = [
    '<head><title>Scribe Character Attribute Summary</title></head>',
    '<body bgcolor="' + BACKGROUND + '">',
    '<h1>Scribe Character Attribute Summary</h1>',
    '<table border="1">'
  ];
  var rowHtml = '<tr><td></td>';
  for(var i = 0; i < urls.length; i++) {
    var name = urls[i].replace(/.*\//, '').replace(/\..*/, '');
    rowHtml += '<th>' + name + '</th>';
  }
  htmlBits[htmlBits.length] = rowHtml;
  var inTable = {};
  for(var a in allAttrs) {
    var spells = [];
    for(var b in allAttrs[a]) {
      if(b.match(/^(features|skills|selectableFeatures|languages)\./))
        inTable[b] = 1;
      else if(b.match(/^spells\./))
        spells[spells.length] = b.substring(b.indexOf('.') + 1);
    }
    if(spells.length > 0) {
      spells.sort();
      allAttrs[a]['spells'] = spells.join('<br/>');
    }
  }
  inTable['notes'] = inTable['dmNotes'] = inTable['spells'] = 1;
  inTable = ScribeUtils.getKeys(inTable);
  for(var i = 0; i < inTable.length; i++) {
    rowHtml = '<tr><td><b>' + inTable[i] + '</b></td>';
    for(var j = 0; j < urls.length; j++) {
      var value = allAttrs[urls[j]][inTable[i]];
      if(value == null)
        value = '&nbsp;';
      rowHtml += '<td align="center">' + value + '</td>';
    }
    htmlBits[htmlBits.length] = rowHtml;
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
    if(Scribe.aboutWindow == null || Scribe.aboutWindow.closed)
      Scribe.aboutWindow = Scribe.popUp
        (ABOUT_TEXT.replace(/\n/g, '\n</p>\n<p>'), 'Ok:window.close();');
    else
      Scribe.aboutWindow.focus();
  } else if(name.match(/^(dmonly|italics|untrained)$/)) {
    cookieInfo[name] = value ? '1' : '0';
    Scribe.storeCookie();
    Scribe.refreshSheet();
  } else if(name == 'file') {
    input.selectedIndex = 0;
    if(WARN_ABOUT_DISCARD &&
       !ScribeUtils.clones(character, cachedAttrs[characterUrl]) &&
       !confirm("Discard changes to character?"))
      ; /* empty */
    else if(value == 'Open...')
      Scribe.openDialog();
    else if(value == 'New...')
      Scribe.randomizeCharacter(true);
    else
      Scribe.loadCharacter(value);
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
  } else if(name == 'ruleattributes') {
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
  } else if(name == 'spellfilter') {
    spellFilter = value;
    Scribe.refreshEditor(false);
  } else if(name == 'summary') {
    Scribe.summarizeCachedAttrs();
  } else if(name == 'view') {
    Scribe.showHtml(Scribe.sheetHtml());
    cachedAttrs[characterUrl] = ScribeUtils.clone(character);
  } else if(name == 'viewer') {
    cookieInfo[name] = value;
    Scribe.storeCookie();
    Scribe.refreshSheet();
  } else if(name.indexOf('_clear') >= 0) {
    name = name.replace(/_clear/, '');
    for(var a in character) {
      if(a.indexOf(name + '.') == 0)
        delete character[a];
    }
    input = editForm[name]
    if(input != null)
      InputSetValue(input, null);
    input = editForm[name + '_sel']
    if(input != null)
      input.selectedIndex = 0;
    Scribe.refreshEditor(false);
    Scribe.refreshSheet();
  } else if(name.indexOf('_sel') >= 0) {
    name = name.replace(/_sel/, '');
    input = editForm[name]
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
    else if(name == 'spells.' + EMPTY_SPELL_LIST)
      InputSetValue(input, 0);
    else
      character[name] = value;
    Scribe.refreshSheet();
    if(name.search(/^(levels|domains)\./) >= 0)
      Scribe.refreshEditor(false);
  }

};
