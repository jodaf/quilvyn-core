/* $Id: Scribe.js,v 1.177 2006/12/21 18:47:10 Jim Exp $ */

var COPYRIGHT = 'Copyright 2006 James J. Hayes';
var VERSION = '0.36.14';
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
var editForm;       // Character editing form (window.forms[0])
var loadingPopup = null; // Current "loading" message popup window
var spellFilter = "";
var ruleSets = {};  // ScribeRules with standard + user rules
var ruleSet = null; // The rule set currently in use
var urlLoading=null;// Character URL presently loading

/* Launch routine called after all Scribe scripts are loaded. */
function Scribe() {

  var defaults = {
    'BACKGROUND':'wheat', 'HELP_URL':'scribedoc.html', 'LOGO_URL':'scribe.gif',
    'MAX_RECENT_OPENS':20, 'URL_PREFIX':'', 'URL_SUFFIX':'.html',
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
    for(i = 0; i < settings.length; i += 2) {
      if(cookieInfo[settings[i]] != null)
        cookieInfo[settings[i]] = settings[i + 1];
    }
  }

  if(CustomizeScribe != null)
    CustomizeScribe();
  character = {};
  Scribe.refreshEditor(true);
  Scribe.randomizeCharacter(false);
  Scribe.popUp('<img src="' + LOGO_URL + '" alt="Scribe"/><br/>' +
               COPYRIGHT + '<br/>' +
               'Press the "About" button for more info',
               'Ok', 'window.close();');

}

// Choices for the ability fields in the editor
// TODO Move to PH35
Scribe.ABILITY_CHOICES = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
];
// Mapping of medium damage to large/small/tiny damage
// TODO Move to PH35
Scribe.LARGE_DAMAGE = {
  'd2':'d3', 'd3':'d4', 'd4':'d6', 'd6':'d8', 'd8':'2d6', 'd10':'2d8',
  'd12':'3d6', '2d4':'2d6', '2d6':'3d6', '2d8':'3d8', '2d10':'4d8'
};
Scribe.SMALL_DAMAGE = {
  'd2':'d1', 'd3':'d2', 'd4':'d3', 'd6':'d4', 'd8':'d6', 'd10':'d8',
  'd12':'d10', '2d4':'d6', '2d6':'d10', '2d8':'2d6', '2d10':'2d8'
};
Scribe.TINY_DAMAGE = {
  'd2':'0', 'd3':'1', 'd4':'d2', 'd6':'d8', 'd8':'d4', 'd10':'d6',
  'd12':'d8', '2d4':'1d4', '2d6':'1d8', '2d8':'1d10', '2d10':'2d6'
};

// TODO Move to ScribeRules/PH35
Scribe.editorElements = [
  ['about', ' ', 'button', ['About']],
  ['help', '', 'button', ['Help']],
  ['rules', 'Rules', 'select-one', []],
  ['file', ' ', 'select-one', []],
  ['summary', '', 'button', ['Summary']],
  ['validate', ' ', 'button', ['Validate']],
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
      if(ruleSet.getChoices(params) == null) {
        alert("No choices for '" + params + "' available from rule set.");
        continue;
      }
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
  if(url.match(/^\w*:/) == null)
    url = URL_PREFIX + url;
  if(url.match(/\.\w*$/) == null)
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
    // Previous Scribe versions assumed some defaults that we no longer assume
    var OLD_DEFAULTS = {
      'alignment': 'Neutral Good', 'armor': 'None', 'charisma': 10,
      'constitution': 10, 'deity': 'None', 'dexterity': 10, 'experience': 0,
      'gender': 'Male', 'hitPoints': 0, 'intelligence': 10,
      'name': 'New Character', 'race': 'Human', 'shield': 'None',
      'strength': 10, 'wisdom': 10
    };
    for(var a in OLD_DEFAULTS) {
      if(character[a] == null)
        character[a] = OLD_DEFAULTS[a];
    }
    Scribe.refreshEditor(false);
    Scribe.refreshSheet();
    currentUrl = url;
    cachedAttrs[currentUrl] = ScribeUtils.clone(character);
    urlLoading = null;
    if(!loadingPopup.closed)
      loadingPopup.close();
  } else if(urlLoading == null) {
    // Nothing presently loading
    urlLoading = url;
    loadingPopup =
      Scribe.popUp('Loading character from '+url, 'Cancel', 'window.close();');
    if(sheetWindow == null || sheetWindow.closed)
      sheetWindow = window.open
        ('', 'scribeSheet', 'height=750,width=750,resizable,scrollbars');
    if(sheetWindow.location != 'about:blank') // Opera pukes w/o this test
      sheetWindow.attributes = null;
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
 * Returns a popup window containing #html# and the optional set of #buttons#,
 * each associated with an #action#.
 */
Scribe.popUp = function(html, button, action /*, button, action ... */) {
  var popup = window.open
    ('', 'pop' + Scribe.popUp.next++, 'height=200,width=400');
  var content = '<html><head><title>Scribe Message</title></head>\n' +
                '<body bgcolor="' + BACKGROUND + '">' + html +
                '<br/>\n<form>\n';
  for(var i = 2; i < arguments.length; i += 2) {
    content +=
      '<input type="button" value="' + arguments[i - 1] + '" ' +
                           'onclick="' + arguments[i] + '"/>\n';
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
    currentUrl = 'random';
    cachedAttrs[currentUrl] = ScribeUtils.clone(character);
    if(loadingPopup != null)
      loadingPopup.close();
    urlLoading = null;
  } else if(urlLoading == 'random' && loadingPopup.closed) {
    urlLoading = null; // User cancel
  } else if(urlLoading == null) {
    // Nothing presently loading
    urlLoading = 'random';
    var classes = ScribeUtils.getKeys(ruleSet.getChoices('classes'));
    var htmlBits = [
      '<html><head><title>New Character</title></head>',
      '<body bgcolor="' + BACKGROUND + '">',
      '<img src="' + LOGO_URL + ' "/><br/>',
      '<h2>New Character Attributes</h2>',
      '<form name="frm"><table>',
      '<tr><th>Race</th><td>' +
      InputHtml('race', 'select-one',
                ScribeUtils.getKeys(ruleSet.getChoices('races')))+'</td></tr>',
      '<tr><th>Level(s)</th></tr>'
    ];
    // Make the window compact by listing at most 10 classes per column
    var classesPerLine = Math.ceil(classes.length / 10) + 1;
    for(var i = 0; i < classes.length; i += classesPerLine) {
      var lineHtml = '<tr>';
      for(var j = i; j < i + classesPerLine && j < classes.length; j++) {
        lineHtml += '<th>' + classes[j] + '</th><td>' +
                    InputHtml('levels.' + classes[j], 'text', [2]) + '</td>';
      }
      lineHtml += '</tr>';
      htmlBits[htmlBits.length] = lineHtml;
    }
    htmlBits = htmlBits.concat([
      '</table></form>',
      '<form>',
      '<input type="button" value="Ok" onclick="okay=1;"/>',
      '<input type="button" value="Cancel" onclick="window.close();"/>',
      '</form></body></html>'
    ]);
    var html = htmlBits.join('\n') + '\n';
    loadingPopup = window.open('', 'randomWin');
    loadingPopup.document.write(html);
    loadingPopup.document.close();
    // Randomize race; the user can change it if desired
    loadingPopup.document.frm.race.selectedIndex =
      ScribeUtils.random(0, loadingPopup.document.frm.race.options.length - 1);
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
var editWindow = null;
Scribe.refreshEditor = function(redraw) {

  var i;

  if(editWindow == null || editWindow.closed) {
    editWindow = window.open
      ('', 'scribeEditor', 'height=750,width=500,resizable,scrollbars');
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
    editForm = editWindow.document.frm;
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
  if(!redraw &&
     (editForm.file.options.length != fileOpts.length ||
      editForm.spells_sel.options.length != spellOpts.length)) // Opera bug
    return Scribe.refreshEditor(true);

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
  // Regenerate the skill options to reflect the characters cross/class skills
  var attrs = ruleSet.applyRules(character);
  for(i = 0; i < editForm.skills_sel.options.length; i++) {
    var opt = editForm.skills_sel.options[i];
    opt.text =
      opt.value + (attrs['classSkills.' + opt.value] == null ? ' (cc)' : '');
  }

  InputSetValue(editForm.dmonly, cookieInfo.dmonly - 0);
  InputSetValue(editForm.italics, cookieInfo.italics - 0);
  InputSetValue(editForm.rules, ruleSet.getName());
  InputSetValue(editForm.spellfilter, spellFilter);
  InputSetValue(editForm.untrained, cookieInfo.untrained - 0);
  InputSetValue(editForm.viewer, cookieInfo.viewer);

};

/* Draws the sheet for the current character in the character sheet window. */
var sheetWindow = null;
Scribe.refreshSheet = function() {
  if(sheetWindow == null || sheetWindow.closed)
    sheetWindow = window.open
      ('', 'scribeSheet', 'height=750,width=750,resizable,scrollbars');
  sheetWindow.document.write(Scribe.sheetHtml());
  sheetWindow.document.close();
};

/* Returns the character sheet HTML for the current character. */
Scribe.sheetHtml = function() {

  var a;
  var attrs = ScribeUtils.clone(character);
  var codeAttributes = {};
  var computedAttributes;
  var displayAttributes = {};
  var i;

  // Turn "dot" attributes into objects
  for(a in character) {
    if((i = a.indexOf('.')) < 0) {
      codeAttributes[a] = attrs[a];
    } else {
      var object = a.substring(0, i);
      if(codeAttributes[object] == null)
        codeAttributes[object] = {};
      codeAttributes[object][a.substring(i + 1)] = attrs[a];
    }
  }

  attrs.dmonly = cookieInfo.dmonly - 0;
  // If so directed, add computed non-zero values for untrained skills
  if(cookieInfo.untrained == '1') {
    var skills = ruleEngine.getChoices('skills');
    for(a in skills) {
      if(character['skills.' + a] == null && skills[a].indexOf('/trained') < 0)
        attrs['skills.' + a] = 0;
    }
  }
  computedAttributes = ruleSet.applyRules(attrs);
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
  // of displayAttributes' names and values here to get the sheet to look right.
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
    if(attrs[a] != null && attrs[a] != value)
      value += '[' + attrs[a] + ']';
    if((i = name.indexOf('.')) < 0) {
      if(name == 'imageUrl' && value.match(/^\w*:/) == null)
        value = URL_PREFIX + value;
      displayAttributes[name] = value;
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
        var range;
        if((i = damages.search(/[rR]/)) < 0) {
          range = 0;
        } else {
          range = damages.substring(i + 1) - 0;
          damages = damages.substring(0, i);
          if(computedAttributes['weaponRangeAdjustment.' + name] != null)
            range += computedAttributes['weaponRangeAdjustment.' + name] - 0;
          if(computedAttributes['features.Far Shot'] != null)
            range *= name.indexOf('bow') < 0 ? 2 : 1.5;
        }
        var attack =
          range == 0 ||
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
             Scribe.SMALL_DAMAGE[damage] != null) {
            damage = Scribe.SMALL_DAMAGE[damage];
          } else if(computedAttributes['features.Large'] &&
                    Scribe.LARGE_DAMAGE[damage] != null) {
            damage = Scribe.LARGE_DAMAGE[damage];
          } else if(computedAttributes['features.Tiny'] &&
                    Scribe.TINY_DAMAGE[damage] != null) {
            damage = Scribe.TINY_DAMAGE[damage];
          }
          if(additional != 0)
            damage += ScribeUtils.signed(additional);
          damages[i] = damage + ' x' + multiplier + '@' + threat;
        }
        name += '(' + ScribeUtils.signed(attack) + ' ' + damages.join('/') +
                (range != 0 ? ' R' + range : '') + ')';
      }
      value = name + ': ' + value;
      if(object.indexOf('Notes') > 0 && ruleSet.isSource(a)) {
        if(cookieInfo.italics == '1')
          value = '<i>' + value + '</i>';
        else
          continue;
      }
      if(displayAttributes[object] == null)
        displayAttributes[object] = [];
      displayAttributes[object][displayAttributes[object].length] = value;
    }
  }

  for(a in displayAttributes) {
    var attr = displayAttributes[a];
    if(typeof attr == 'object') {
      attr.sort();
      // If all values in the array are 1|true, assume that it's a set and
      // suppress display of the values
      if(attr.join(',').replace(/: (1|true)(,|$)/g, '').indexOf(':') < 0)
        for(i = 0; i < attr.length; i++)
          attr[i] = attr[i].replace(/:.*/, '');
      displayAttributes[a] = attr;
    }
  }

  return '<' + '!' + '-- Generated ' + new Date().toString() +
           ' by Scribe version ' + VERSION + ' --' + '>\n' +
         '<html>\n' +
         '<head>\n' +
         '  <title>' + attrs.name + '</title>\n' +
         '  <script>\n' +
         'var attributes = ' + ObjectViewer.toCode(codeAttributes) + ';\n' +
         // Careful: don't want to close scribe.html's script tag here!
         '  </' + 'script>\n' +
         '</head>\n' +
         '<body>\n' +
         ruleSet.getViewer(InputGetValue(editForm.viewer)).
           getHtml(displayAttributes, '_top') + '\n' +
         '</body>\n' +
         '</html>\n';

};

/* Opens a window that contains HTML for #html# in readable/copyable format. */
Scribe.showHtml = function(html) {
  if(Scribe.showHtml.htmlWindow == null || Scribe.showHtml.htmlWindow.closed)
    Scribe.showHtml.htmlWindow = window.open('', 'html');
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
  urls.sort();
  var htmlBits = [
    '<html>',
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
  inTable.sort();
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
    Scribe.summarizeCachedAttrs.win = window.open('', 'sumwin');
  else
    Scribe.summarizeCachedAttrs.win.focus();
  Scribe.summarizeCachedAttrs.win.document.write(htmlBits.join('\n'));
  Scribe.summarizeCachedAttrs.win.document.close();
};

/* Callback invoked when the user changes the editor value of Input #input#. */
Scribe.update = function(input) {

  var name = input.name;
  var value = InputGetValue(input);
  if(name == 'about') {
    if(Scribe.aboutWindow == null || Scribe.aboutWindow.closed)
      Scribe.aboutWindow = Scribe.popUp
        (ABOUT_TEXT.replace(/\n/g, '\n</p>\n<p>'), 'Ok', 'window.close();');
    else
      Scribe.aboutWindow.focus();
  } else if(name.search(/dmonly|italics|untrained|viewer/) >= 0) {
    cookieInfo[name] = value + '';
    Scribe.storeCookie();
    Scribe.refreshSheet();
  } else if(name == 'file') {
    input.selectedIndex = 0;
    if(WARN_ABOUT_DISCARD &&
       !ScribeUtils.clones(character, cachedAttrs[currentUrl]) &&
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
      Scribe.helpWindow = window.open(HELP_URL, 'help');
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
  } else if(name == 'spellfilter') {
    spellFilter = value;
    Scribe.refreshEditor(false);
  } else if(name == 'summary') {
    Scribe.summarizeCachedAttrs();
  } else if(name == 'validate') {
    if(Scribe.validateWindow == null || Scribe.validateWindow.closed)
      Scribe.validateWindow = window.open('', 'vdate', 'height=400,width=400');
    else
      Scribe.validateWindow.focus();
    Scribe.validateWindow.document.write(
      '<html><head><title>Character Validation Check</title></head>\n' +
      '<body bgcolor="' + BACKGROUND + '">\n' +
      '<h2>Validation Results</h2>\n<p>\n' +
      Scribe.validationHtml() +
      '\n</p>\n</body></html>\n'
    );
    Scribe.validateWindow.document.close();
  } else if(name == 'view') {
    Scribe.showHtml(Scribe.sheetHtml());
    cachedAttrs[currentUrl] = ScribeUtils.clone(character);
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

/*
 * Tests #attributes# against the PH validation rules. Returns an array
 * containing any failed rules.
 */
Scribe.validate = function(attributes) {
  var reverseOps = {
    '==': '!=', '!=': '==', '<': '>=', '>=': '<', '>': '<=', '<=': '>',
    '&&': '||', '||': '&&'
  };
  var result = [];
  var tests = ruleSet.getTests();
  for(var i = 0; i < tests.length; i++) {
    var matchInfo;
    var test = tests[i];
    var resolved = '';
    while((matchInfo = test.match(/(\+\/)?\{([^\}]+)\}/)) != null) {
      var value;
      if(matchInfo[1] == '+/') {
        value = 0;
        var pattern = matchInfo[2];
        for(var a in attributes)
          if(a.match(pattern))
            value += attributes[a] - 0;
      }
      else {
        value = attributes[matchInfo[2]];
        if(value == null) {
          value = 'null';
        } else if(value + 0 != value) { // Numeric check
          value = '"' + value + '"';
        }
      }
      resolved += test.substring(0, matchInfo.index) + value;
      test = test.substring(matchInfo.index + matchInfo[0].length);
    }
    resolved += test;
    if(!eval(resolved)) {
      var reversed = '';
      while((matchInfo = resolved.match(/==|!=|<|>=|>|<=|&&|\|\|/)) != null) {
        reversed +=
          resolved.substring(0, matchInfo.index) + reverseOps[matchInfo[0]];
        resolved = resolved.substring(matchInfo.index + matchInfo[0].length);
      }
      reversed += resolved;
      result[result.length] = tests[i] + '  [' + reversed + ']';
    }
  }
  return result;
};

/*
 * Returns HTML showing the results of applying validation rules to the current
 * character's attributes.
 */
Scribe.validationHtml = function() {
  var computedAttributes = ruleSet.applyRules(character);
  var errors;
  var i;
  var invalid = Scribe.validate(computedAttributes);
  var result;
  // Because of cross-class skills, we can't write a simple validation test for
  // the number of assigned skill points; we have to compute it here.
  var maxRanks = computedAttributes.classSkillMaxRanks;
  var skillPointsAssigned = 0;
  for(var a in character) {
    if(a.substring(0, 7) != 'skills.')
      continue;
    var skill = a.substring(7);
    var isCross = computedAttributes['classSkills.' + skill] == null;
    var maxAllowed = maxRanks / (isCross ? 2 : 1);
    if(character[a] > maxAllowed)
      invalid[invalid.length] =
        '{' + a + '} <= {' + (isCross ? 'cross' : 'class') + 'SkillMaxRanks} ' +
        '[' + character[a] + ' > ' + maxAllowed + ']';
    skillPointsAssigned += character[a] * (isCross ? 2 : 1);
  }
  if(skillPointsAssigned != computedAttributes.skillPoints)
    invalid[invalid.length] =
      '+/{^skills} == {skillPoints} [' + skillPointsAssigned + ' != ' +
      computedAttributes.skillPoints + ']';
  if(invalid.length == 0)
    result = 'No validation errors<br/>\n';
  else
    result =
      'Failed: ' + invalid.join('<br/>\nFailed:') + '<br/>\n' + invalid.length +
      ' validation error' + (invalid.length == 1 ? '' : 's') + '<br/>\n';
  return result;
};
