/* $Id: Scribe.js,v 1.14 2004/04/24 18:30:11 Jim Exp $ */

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

var COOKIE_FIELD_SEPARATOR = '\n';
var COOKIE_NAME = 'scribePrefs';
var COPYRIGHT = 'Copyright 2004 James J. Hayes';
var TIMEOUT_DELAY = 1000;

var character = null;
var cookieInfo = {
  background : 'bisque',
  lastUrl: '',
  prefix: '',
  ruleUrls: '',
  suffix: '.html'
};
var editor;
var editWindow;
var loadingPopup = null;
var loadingWindow;
var rules = null;
var rulesInProgress = null;
var sheetWindow;
var urlLoading = null;

function AddRules() {
  rulesInProgress.AddRules.apply(rulesInProgress, arguments);
}

function ChangePreferences() {
  var value;
  for(var p in cookieInfo) {
    if(p == 'lastUrl')
      continue;
    if((value = prompt('Enter value for ' + p, cookieInfo[p])) == null)
      return;
    cookieInfo[p] = value;
  }
  StoreCookie();
}

function FullUrl(url) {
  if(url.match(/^[a-zA-Z0-9]*:/) == null)
    url = cookieInfo.prefix + url;
  if(url.match(/\.[a-zA-Z0-9]*$/) == null)
    url += cookieInfo.suffix;
  return url;
}

function LoadCharacter(url) {
  url = FullUrl(url);
  if(urlLoading == url && loadingWindow.attributes != null) {
    /* Character done loading. */
    if(!loadingPopup.closed)
      loadingPopup.close();
    if(cookieInfo.lastUrl != url) {
      cookieInfo.lastUrl = url;
      StoreCookie();
    }
    character = new DndCharacter(loadingWindow.attributes);
    RefreshEditor();
    RefreshSheet();
    urlLoading = null;
  }
  else if(urlLoading == url && loadingPopup.closed)
    /* User cancel. */
    urlLoading = null;
  else if(urlLoading == null) {
    /* Nothing presently loading. */
    urlLoading = url;
    loadingPopup =
      PopUp('Loading character from ' + url, 'Cancel', 'window.close();');
    loadingWindow.attributes = null;
    loadingWindow.location = url;
    setTimeout
      ('LoadCharacter("' + url.replace(/\\/g, "\\\\") + '")', TIMEOUT_DELAY);
  }
  else
    /* Something (possibly this character) loading; try again later. */
    setTimeout
      ('LoadCharacter("' + url.replace(/\\/g, "\\\\") + '")', TIMEOUT_DELAY);
}

function LoadRules(urls) {

  var splitUrls = urls.split(';');

  while(splitUrls.length > 0 && splitUrls[0] == '')
    splitUrls.shift();
  if(splitUrls.length == 0) {
    /* All rule sets done loading. */
    if(rulesInProgress != null) {
      rules = rulesInProgress;
      rulesInProgress = null;
      RedrawEditWindow();
      RefreshSheet();
    }
    return;
  }

  var url = FullUrl(splitUrls[0]);
  if(urlLoading == url && loadingWindow.CustomizeScribe != null) {
    /* Current rule set done loading. */
    loadingWindow.CustomizeScribe
      (DndCharacter,DndCharacter.AddChoices,AddRules,DndCharacter.AddToSheet);
    loadingPopup.close();
    urlLoading = null;
    splitUrls.shift();
    LoadRules(splitUrls.join(';'));
  }
  else if(urlLoading == url && loadingPopup.closed) {
    /* User cancel. */
    urlLoading = null;
    rulesInProgress = null;
  }
  else if(urlLoading == null) {
    /* Nothing presently loading. */
    urlLoading = url;
    loadingWindow.CustomizeScribe = null;
    loadingWindow.location = url;
    loadingPopup =
      PopUp('Loading rules from ' + url, 'Cancel', 'window.close();');
    if(rulesInProgress == null) {
      rulesInProgress = new RuleEngine();
      DndCharacter.AddThirdEditionRules(rulesInProgress);
    }
    setTimeout
      ('LoadRules("' + splitUrls.join(';').replace(/\\/g, "\\\\") + '");',
       TIMEOUT_DELAY);
  }
  else
    /* Something (possibly this rule set) loading; try again later. */
    setTimeout
      ('LoadRules("' + splitUrls.join(';').replace(/\\/g, "\\\\") + '");',
       TIMEOUT_DELAY);

}

function NewCharacter() {
  character = new DndCharacter(null);
  character.Randomize(rules, 'class');
  for(var a in DndCharacter.defaults)
    character.Randomize(rules, a);
  character.Randomize(rules, 'feats');
  character.Randomize(rules, 'languages');
  character.Randomize(rules, 'skills');
  character.Randomize(rules, 'spells');
  RefreshEditor();
  RefreshSheet();
}

function OpenDialog() {
  if(loadingPopup != null && !loadingPopup.closed) {
    /* Try again after character or rules have loaded. */
    setTimeout('OpenDialog();', TIMEOUT_DELAY);
    return;
  }
  var url = prompt
    ('Enter URL to Edit (Blank for Random Character)', cookieInfo.lastUrl);
  if(url == null && character != null)
    /* User cancel. */
    return;
  if(url == null || url == '')
    NewCharacter();
  else
    LoadCharacter(url);
}

function PopUp(html, button, action /* ... */) {
  var popup = window.open
    ('about:blank', 'pop' + PopUp.next++, 'height=200,width=400');
  var content = '<html><head><title>Scribe Message</title></head>\n' +
                '<body bgcolor="' + cookieInfo.background + '">' + html +
                '<br/>\n<form>\n';
  for(var i = 1; i < arguments.length; i += 2)
    content +=
      '<input type="button" value="' + arguments[i] + '" ' +
                           'onclick="' + arguments[i + 1] + '"/>\n';
  content += '</form>\n</body></html>';
  popup.document.write(content);
  popup.document.close();
  return popup;
}
PopUp.next = 0;

function RedrawEditWindow() {
  editor = new FormController();
  editor.setCallback(Update);
  editor.addElements(
    '', 'about', 'button', ['About'],
    '', 'help', 'button', ['Help'],
    '', 'preferences', 'button', ['Preferences'],
    '', 'open', 'button', ['New/Open'],
    '', 'view', 'button', ['View Html'],
    '', 'clear', 'select',
      ['--Clear--', 'alignment', 'armor', 'charisma', 'class',
       'constitution', 'dexterity', 'feats', 'gender', 'helm', 'hitPoints',
       'intelligence', 'languages', 'name', 'race', 'shield', 'skills',
       'spells', 'strength', 'wisdom'],
    '', 'randomize', 'select',
      ['--Randomize--', 'alignment', 'armor', 'charisma', 'class',
       'constitution', 'dexterity', 'feats', 'gender', 'helm', 'hitPoints',
       'intelligence', 'languages', 'name', 'race', 'shield', 'skills',
       'spells', 'strength', 'wisdom'],
    'Name', 'name', 'text', [20],
    'Race', 'race', 'select', DndCharacter.races,
    'Experience', 'experience', 'range', [0,9999999],
    'Levels', 'levels', 'bag', DndCharacter.classes,
    'Strength', 'strength', 'range', [3,18],
    'Intelligence', 'intelligence', 'range', [3,18],
    'Wisdom', 'wisdom', 'range', [3,18],
    'Dexterity', 'dexterity', 'range', [3,18],
    'Constitution', 'constitution', 'range', [3,18],
    'Charisma', 'charisma', 'range', [3,18],
    'Player', 'player', 'text', [20],
    'Alignment', 'alignment', 'select', DndCharacter.alignments,
    'Gender', 'gender', 'select', DndCharacter.genders,
    'Deity', 'deity', 'text', [20],
    'Origin', 'origin', 'text', [20],
    'Feats', 'feats', 'bag', DndCharacter.feats,
    'Skills', 'skills', 'bag', DndCharacter.skills,
    'Languages', 'languages', 'set', DndCharacter.languages,
    'Hit Points', 'hitPoints', 'range', [0,999],
    'Armor', 'armor', 'select', DndCharacter.armors,
    'Shield', 'shield', 'select', DndCharacter.shields,
    'Helm', 'helm', 'select', DndCharacter.helms,
    'Weapons', 'weapons', 'bag', DndCharacter.weapons,
    'Spells', 'spells', 'set', DndCharacter.spells,
    'Goodies', 'goodies', 'bag', DndCharacter.goodies,
    'Cleric Domains', 'domains', 'set', DndCharacter.domains,
    'Wizard Specialization', 'specialize', 'set', DndCharacter.schools,
    'Wizard Prohibition', 'prohibit', 'set', DndCharacter.schools
  );
  editWindow.document.write(
    '<html><head><title>Editor</title></head>\n' +
    '<body bgcolor="' + cookieInfo.background + '">' +
    '<img src="scribe.gif"/><br/>');
  editor.writeToWindow(editWindow, 'ched');
  editWindow.document.write(
    '</body></html>\n'
  );
  editWindow.document.close();
}

function RefreshEditor() {
  if(character == null)
    return;
  editor.setElementValues(character.attributes);
}

function RefreshSheet() {
  if(character == null)
    return;
  if(sheetWindow == null || sheetWindow.closed)
    sheetWindow = window.open('about:blank', 'scribeSheet');
  sheetWindow.document.write(SheetHtml());
  sheetWindow.document.close();
}

function ScribeLoaded() {

  if(window.DndCharacter == null ||
     window.FormController == null ||
     window.RuleEngine == null) {
    alert('JavaScript script(s) required by Scribe are missing; exiting');
    return;
  }
  if(window.opener == null || window.opener.ScribeLoaded == null) {
    if(window.frames[0] == null || window.frames[1] == null)
      alert('Scribe must be embedded in a document that defines at least ' +
            'two frames; exiting');
    else
      window.open(document.location, 'scribeEditor');
    return;
  }

  var i = document.cookie.indexOf(COOKIE_NAME + '=');
  if(i >= 0) {
    var end = document.cookie.indexOf(';', i);
    if(end < 0)
      end = document.cookie.length;
    var cookie = document.cookie.substring(i + COOKIE_NAME.length + 1, end);
    var settings = unescape(cookie).split(COOKIE_FIELD_SEPARATOR);
    for(i = 0; i < settings.length && settings[i] != ''; i += 2)
      cookieInfo[settings[i]] = settings[i + 1];
  }
  PopUp(COPYRIGHT + '<br/>' +
        'Press the "About" button for more info',
        'Ok', 'window.close();');
  editWindow = window.frames[0];
  loadingWindow = window.frames[1];
  sheetWindow = window.opener;
  rules = new RuleEngine();
  DndCharacter.AddThirdEditionRules(rules);
  RedrawEditWindow();
  LoadRules(cookieInfo.ruleUrls);
  OpenDialog();

}

function SheetHtml() {
  var attrImage = '';
  var line = '';
  for(var a in character.attributes) {
    if(character.attributes[a] == DndCharacter.defaults[a])
      continue;
    var image = '"' + a + '":"' + character.attributes[a] + '",';
    if(line.length + image.length >= 80) {
      attrImage += '\n' + line;
      line = '';
    }
    line += image;
  }
  if(line.length > 0)
    attrImage += '\n' + line;
  attrImage = attrImage.substring(0, attrImage.length - 1);
  return '<html>\n' +
         '<head>\n' +
         '  <title>' + character.attributes.name + '</title>\n' +
         '  <script>\n' +
         '    var attributes = {' +
         attrImage + '\n' +
         '    };\n' +
         '  </' + 'script>\n' +
         '</head>\n' +
         '<body>\n' +
         character.CharacterSheet(rules) +
         '</body>\n' +
         '</html>\n';
}

function StoreCookie() {
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
}

function Update(name, value) {

  if(name == 'about')
    window.open('about.html', 'about');
  else if(name == 'help')
    window.open('help.html', 'help');
  else if(name == 'preferences') {
    var oldUrls = cookieInfo.ruleUrls;
    ChangePreferences();
    if(cookieInfo.ruleUrls != oldUrls) {
      rules = new RuleEngine();
      DndCharacter.AddThirdEditionRules(rules);
      LoadRules(cookieInfo.ruleUrls);
    }
  }
  else if(name == 'open')
    OpenDialog();
  else if(name == 'view') {
    var html = SheetHtml();
    var htmlWindow = window.open('about:blank', 'html');
    html = html.replace(/</g, '&lt;');
    html = html.replace(/>/g, '&gt;');
    htmlWindow.document.write(
      '<html><head><title>HTML</title></head>\n' +
      '<body><pre>' + html + '</pre></body></html>\n'
    );
    htmlWindow.document.close();
  }
  else if(name == 'clear') {
    character.Clear(value);
    RefreshEditor();
    RefreshSheet();
    editor.setElementValue('clear', '--Clear--');
  }
  else if(name == 'randomize') {
    character.Randomize(rules, value);
    RefreshEditor();
    RefreshSheet();
    editor.setElementValue('randomize', '--Randomize--');
  }
  else {
    if(!value && DndCharacter.defaults[name] == null)
      delete character.attributes[name];
    else
      character.attributes[name] = value;
    RefreshSheet();
  }

}
