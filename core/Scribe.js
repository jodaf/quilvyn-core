/* $Id: Scribe.js,v 1.7 2004/03/29 21:02:00 Jim Exp $ */

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
  lastUrl: '',
  prefix: '',
  ruleUrls: '',
  suffix: '.html'
};
var editWindow;
var loadingWindow;
var rules = null;
var rulesInProgress = null;
var loadingPopup = null;
var sheetWindow;
var urlLoading = null;

function AddRules() {
  rulesInProgress.AddRules.apply(rulesInProgress, arguments);
}

function PopUp(html, button, action /* ... */) {
  var popup = window.open
    ('about:blank', 'pop' + PopUp.next++, 'height=200,width=400');
  var content = '<html><head><title>Scribe Message</title></head>\n' +
                '<body bgcolor="bisque">' + html + '<br/>\n<form>\n';
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

function FullUrl(url) {
  if(url.match(/^[a-zA-Z0-9]*:/) == null)
    url = cookieInfo.prefix + url;
  if(url.match(/\.[a-zA-Z0-9]*$/) == null)
    url += cookieInfo.suffix;
  return url;
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

function LoadCharacter(url) {
  url = FullUrl(url);
  if(urlLoading == url && loadingWindow.attributes != null) {
    loadingPopup.close();
    cookieInfo.lastUrl = url;
    StoreCookie();
    character = new DndCharacter(loadingWindow.attributes);
    RefreshSheet();
    RefreshEditor();
    urlLoading = null;
  }
  else if(urlLoading == url && loadingPopup.closed)
    urlLoading = null;
  else if(urlLoading == null) {
    urlLoading = url;
    loadingPopup =
      PopUp('Loading character from ' + url, 'Cancel', 'window.close();');
    loadingWindow.attributes = null;
    loadingWindow.location = url;
    setTimeout
      ('LoadCharacter("' + url.replace(/\\/g, "\\\\") + '")', TIMEOUT_DELAY);
  }
  else
    setTimeout
      ('LoadCharacter("' + url.replace(/\\/g, "\\\\") + '")', TIMEOUT_DELAY);
}

function LoadRules(urls) {

  var splitUrls = urls.split(';');

  while(splitUrls.length > 0 && splitUrls[0] == '')
    splitUrls.shift();
  if(splitUrls.length == 0) {
    if(rulesInProgress != null) {
      rules = rulesInProgress;
      rulesInProgress = null;
      RefreshSheet();
    }
    return;
  }

  var url = FullUrl(splitUrls[0]);
  if(urlLoading == url && loadingWindow.CustomizeScribe != null) {
    loadingWindow.CustomizeScribe
      (DndCharacter, DndCharacter.AddChoices, AddRules, DndCharacter.AddToSheet);
    loadingPopup.close();
    urlLoading = null;
    splitUrls.shift();
    LoadRules(splitUrls.join(';'));
  }
  else if(urlLoading == url && loadingPopup.closed) {
    urlLoading = null;
    rulesInProgress = null;
  }
  else if(urlLoading == null) {
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
  character.Randomize(rules, 'skills');
  character.Randomize(rules, 'spells');
  RefreshSheet();
  RefreshEditor();
}

function OpenDialog() {
  var url = prompt
    ('Enter URL to Edit (Blank for Random Character)', cookieInfo.lastUrl);
  if(url == null && character != null)
    return;
  if(url == null || url == '')
    NewCharacter()
  else
    LoadCharacter(url);
}

function RefreshEditor() {
  if(character == null)
    return;
  var editor = ObjectEditor(
    character.attributes,
    'parent.Update',
    [['', 'meta', 'button', ['About']],
     ['', 'meta', 'button', ['Help']],
     ['', 'meta', 'button', ['Preferences']],
     ['', 'meta', 'button', ['New/Open']],
     ['', 'meta', 'button', ['View Html']],
     ['', 'randomize', 'select',
      ['--Randomize--', 'alignment', 'armor', 'charisma', 'class',
       'constitution', 'dexterity', 'feats', 'gender', 'helm', 'hitPoints',
       'intelligence', 'name', 'race', 'shield', 'skills', 'spells',
       'strength', 'wisdom']],
     ['', 'reset', 'select',
      ['--Reset--', 'feats', 'languages', 'skills', 'spells']],
     ['Name', 'name', 'text', [20]],
     ['Race', 'race', 'select', DndCharacter.races],
     ['Experience', 'experience', 'range', [0,9999999]],
     ['Levels', 'levels', 'bag', DndCharacter.classes],
     ['Strength', 'strength', 'range', [3,18]],
     ['Intelligence', 'intelligence', 'range', [3,18]],
     ['Wisdom', 'wisdom', 'range', [3,18]],
     ['Dexterity', 'dexterity', 'range', [3,18]],
     ['Constitution', 'constitution', 'range', [3,18]],
     ['Charisma', 'charisma', 'range', [3,18]],
     ['Player', 'player', 'text', [20]],
     ['Alignment', 'alignment', 'select', DndCharacter.alignments],
     ['Gender', 'gender', 'select', DndCharacter.genders],
     ['Deity', 'deity', 'text', [20]],
     ['Origin', 'origin', 'text', [20]],
     ['Feats', 'feats', 'bag', DndCharacter.feats],
     ['Skills', 'skills', 'bag', DndCharacter.skills],
     ['Languages', 'languages', 'set', DndCharacter.languages],
     ['Hit Points', 'hitPoints', 'range', [0,999]],
     ['Armor', 'armor', 'select', DndCharacter.armors],
     ['Shield', 'shield', 'select', DndCharacter.shields],
     ['Helm', 'helm', 'select', DndCharacter.helms],
     ['Weapons', 'weapons', 'bag', DndCharacter.weapons],
     ['Spells', 'spells', 'set', DndCharacter.spells],
     ['Goodies', 'goodies', 'bag', DndCharacter.goodies],
     ['Cleric Domains', 'domains', 'set', DndCharacter.domains],
     ['Wizard Specialization', 'specialize', 'set', DndCharacter.schools],
     ['Wizard Prohibition', 'prohibit', 'set', DndCharacter.schools]]
  );
  editWindow.document.write(
    '<html><head><title>Editor</title></head>\n' +
    '<body bgcolor="bisque"><img src="scribe.gif"/><br/>' + editor +
    '</body></html>\n'
  );
  editWindow.document.close();
}

function RefreshSheet() {
  if(character == null)
    return;
  sheetWindow.document.write(SheetHtml());
  sheetWindow.document.close();
}

function ScribeLoaded() {

  if(window.DndCharacter == null ||
     window.ObjectEditor == null ||
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

  PopUp(COPYRIGHT + '<br/>' +
        'Press the "About" button for more info',
        'Ok', 'window.close();');
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
  editWindow = window.frames[0];
  loadingWindow = window.frames[1];
  sheetWindow = window.opener;
  rules = new RuleEngine();
  DndCharacter.AddThirdEditionRules(rules);
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

function Update(attr, value) {

  if(attr == 'meta') {
    if(value == 'About')
      window.open('about.html', 'about');
    else if(value == 'Help')
      window.open('help.html', 'help');
    else if(value == 'Preferences') {
      var oldUrls = cookieInfo.ruleUrls;
      ChangePreferences();
      if(cookieInfo.ruleUrls != oldUrls) {
        rules = new RuleEngine();
        DndCharacter.AddThirdEditionRules(rules);
        LoadRules(cookieInfo[ruleUrls]);
        RefreshSheet();
      }
    }
    else if(value == 'New/Open')
      OpenDialog();
    else if(value == 'View Html') {
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
    return;
  }

  if(attr == 'randomize') {
    character.Randomize(rules, value);
    RefreshSheet();
    RefreshEditor();
  }
  else if(attr == 'reset') {
    character.Reset(value);
    RefreshSheet();
    RefreshEditor();
  }
  else if(attr.indexOf('.') >= 0 && !value)
    delete character.attributes[attr];
  else
    character.attributes[attr] = value;
  RefreshSheet();

}
