/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const { GObject, St } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const checkBox = imports.ui.checkBox;
const Util = imports.misc.util;
const ExtensionUtils = imports.misc.extensionUtils;
let Me = ExtensionUtils.getCurrentExtension();

let extensionFolderPath = Me.path;

let checkBoxFile = GLib.build_filenamev([extensionFolderPath, "checked"]);
let checkFile = Gio.File.new_for_path(checkBoxFile);


function saveWindows() {
    let openWindowsFile = Gio.File.new_for_path(GLib.build_filenamev([extensionFolderPath, "commands.sh"]));    
    let [success, content] = checkFile.load_contents(null);
    if (content == "false") {
        let saveWindowsBash = extensionFolderPath + "/saveWindows.sh";
        Util.spawnCommandLine("bash " + saveWindowsBash);
    }
    else {
        let [success, tag] = openWindowsFile.replace_contents(
            "",
            null,
            false,
            Gio.FileCreateFlags.REPLACE_DESTINATION,
            null
        );
    }
}
function openWindows() {
    openWindowsBash = extensionFolderPath + "/commands.sh";
    Util.spawnCommandLine("bash " + openWindowsBash);
}

function buttonPress() {
    let [success, tag] = checkFile.replace_contents(
        String(check.checked),
        null,
        false,
        Gio.FileCreateFlags.REPLACE_DESTINATION,
        null
    );
    saveWindows();
}

var check;
const windows = GObject.registerClass(
class windows extends PanelMenu.Button {

	_init() {
        super._init(0.0, 'Reopen Windows checkbox');
        this.actor.add_child(new St.Icon({ icon_name: 'view-grid-symbolic', style_class: 'system-status-icon' }));
        let item = new PopupMenu.PopupMenuItem('');
        let box = new St.BoxLayout( { x_expand: true  } );
        check = new checkBox.CheckBox("Reopen Windows On Login");
        box.add(check);
        item.actor.add_actor(box);
        this.menu.addMenuItem(item);
        item.actor.connect('button-release-event', saveWindows);
        check.actor.connect('button-release-event', buttonPress);
	}

	destroy() {
        global.settings.disconnect(check);
        global.settings.disconnect(item);
        this.parent();
    }
});


class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        
    }

    enable() {
        this._windows = new windows;
        let [success, content] = checkFile.load_contents(null);
        if (content == "false") {
            check.checked = true;
        }
        else {
            check.checked = false;
        }
        Main.panel.addToStatusArea(this._uuid, this._windows, -1);
    }

    disable() {
        saveWindows();
        this._windows.destroy();
        this._windows = null;
    }
}

function init(meta) {
    openWindows();
    return new Extension(meta.uuid);
}
