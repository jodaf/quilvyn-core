/* $Id: Scribe.js,v 1.5 2004/01/17 17:29:49 Jim Exp $ */

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

var character = null;
var cookieName = "scribePrefs";
var editFrame;
var loadFrame;
var loadFrameContents = '';
var preferences = {
  prefix: '',
  ruleUrls: '',
  suffix: '.html'
};
var sheetWindow;

function AddRules() {
  DndCharacter.rules.AddRules.apply(DndCharacter.rules, arguments);
}

function FullUrl(url) {
  if(url.match(/^[a-zA-Z0-9]*:/) == null)
    url = preferences.prefix + url;
  if(url.match(/\.[a-zA-Z0-9]*$/) == null)
    url += preferences.suffix;
  return url;
}

function ChangePreferences() {
  var cookie = '';
  var value;
  for(var p in preferences) {
    if((value = prompt('Enter value for ' + p, preferences[p])) != null)
      preferences[p] = value;
    cookie += p + '\n' + preferences[p] + '\n';
  }
  cookie = cookieName + '=' + escape(cookie);
  var nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  cookie += ';expires=' + nextYear.toGMTString();
  document.cookie = cookie;
}

function LoadRuleUrls(urls) {
  var end, url;
  for( ; urls != ''; urls = urls.substring(end + 1)) {
    if((end = urls.indexOf(';')) < 0)
      end = urls.length;
    if((url = urls.substring(0, end)) == '')
      continue;
    url = FullUrl(url);
    if(loadFrameContents != url) {
      loadFrame.CustomizeScribe = null;
      loadFrame.location = loadFrameContents = url;
      if(loadFrame.CustomizeScribe == null) {
        setTimeout('LoadRuleUrls("' + urls + '");', 1000);
        return;
      }
    }
    if(loadFrame.CustomizeScribe == null)
      alert('Unable to load customizations from "' + url + '"');
    else {
      loadFrame.CustomizeScribe
        (DndCharacter, DndCharacter.AddChoices, AddRules,
         DndCharacter.AddToSheet);
      alert('Finished loading customizations from "' + url + '"');
    }
    loadFrameContents = '';
  }
  RefreshDisplay();
}

function ReloadRules() {
  DndCharacter.rules = new RuleEngine();
  DndCharacter.ThirdEditionRules();
  LoadRuleUrls(preferences.ruleUrls);
}

function OpenDialog() {
  var url = prompt('Enter URL to Edit (Blank for Random Character)', '');
  if(url == '') {
    character = new DndCharacter(null);
    for(var a in DndCharacter.defaults)
      character.Randomize(a);
    character.Randomize('class');
    character.Randomize('feats');
    character.Randomize('skills');
    character.Randomize('spells');
    sheetWindow.attributes = character.attributes;
  }
  else {
    sheetWindow.attributes = null;
    sheetWindow.location = FullUrl(url);
  }
  RefreshDisplay();
}

function RefreshDisplay() {
  if(sheetWindow.attributes == null) {
    setTimeout("RefreshDisplay();", 1000);
    return;
  }
  character = new DndCharacter(sheetWindow.attributes);
  sheetWindow.document.write(SheetHtml());
  sheetWindow.document.close();
  editFrame.document.write(
    '<html><head><title>Editor</title></head>\n' +
    '<body>' + character.CharacterEditor(ObjectEditor, 'parent.Update') +
    '</body></html>\n'
  );
  editFrame.document.close();
}

function ScribeLoaded() {
  if(window.opener == null || window.opener.ScribeLoaded == null) {
    alert('Copyright 2004 James J. Hayes\n' +
          'Press the "About" button for more info');
    window.open(document.location, 'scribeEditor');
  }
  else {
    var i = document.cookie.indexOf(cookieName + '=');
    if(i >= 0) {
      var end = document.cookie.indexOf(';', i);
      if(end < 0)
        end = document.cookie.length;
      var cookie = document.cookie.substring(i + cookieName.length + 1, end);
      var settings = unescape(cookie).split('\n');
      for(i = 0; i < settings.length && settings[i] != ''; i += 2)
        preferences[settings[i]] = settings[i + 1];
    }
    editFrame = window.frames[0];
    loadFrame = window.frames[1];
    sheetWindow = window.opener;
    ReloadRules();
    OpenDialog();
  }
}

function SheetHtml() {
  var attrImage = '';
  for(var a in character.attributes)
    if(character.attributes[a] != DndCharacter.defaults[a])
      attrImage += '"' + a + '":"' + character.attributes[a] + '",'
  attrImage = '{' + attrImage.replace(/,$/, '') + '}';
  return '<html>\n' +
         '<head>\n' +
         '  <title>' + character.attributes.name + '</title>\n' +
         '  <script>\n' +
         '    var attributes = ' + attrImage + ';\n' +
         '  </' + 'script>\n' +
         '</head>\n' +
         '<body>\n' +
         character.CharacterSheet() +
         '</body>\n' +
         '</html>\n';
}

function Update(attr, value) {
  if(attr == 'meta') {
    if(value == 'About')
      window.open('about.html', 'about');
    else if(value == 'Help')
      window.open('help.html', 'help');
    else if(value == 'Preferences') {
      var oldUrls = preferences.ruleUrls;
      ChangePreferences();
      if(preferences.ruleUrls != oldUrls)
        ReloadRules();
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
    character.Randomize(value);
    sheetWindow.attributes = character.attributes;
    RefreshDisplay();
  }
  else if(attr == 'reset') {
    character.Reset(value);
    sheetWindow.attributes = character.attributes;
    RefreshDisplay();
  }
  else if(attr.indexOf('.') >= 0 && !value)
    delete character.attributes[attr];
  else
    character.attributes[attr] = value;
  sheetWindow.document.write(SheetHtml());
  sheetWindow.document.close();
}
