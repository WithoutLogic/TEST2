const DefaultSettings = {

"line0": "标记设定",
"spawnDropitem": 98260,
"spawnCollection": 413,	// 445,513,912,
"duration":       5000,	// 持续时间
"type":              3,	// 光柱 / 直线 / 圆圈

"line1": "偏移设定",
"offsetAngle":       0,	// 偏移角度
"offsetDistance":    0,	// 偏移半径

"line2": "直线设定 或 圆圈设定",
"minRadius":         0,	// 最近距离 / 最小角度
"maxRadius":       360,	// 最远距离 / 最大角度
"rotateAngle":       8,	// 旋转角度 / 偏移间隔

"line3": "圆圈设定",
"rotateRadius":    440,	// 圆圈半径

"line4": "BOSS设定",
"skill_id":       1212,
"gameId":         1234567890,
"huntingZoneId":  3026,
"templateId":     1000,
"stage":          0,
"id":             1234567890,

"line5": "NPC设定",

"shapeId":        304260,
"status":         2,
"hpLevel":        2,

};

module.exports = function MigrateSettings(from_ver, to_ver, settings) {
    if (from_ver === undefined) {
        // Migrate legacy config file
        return Object.assign(Object.assign({}, DefaultSettings), settings);
    } else if (from_ver === null) {
        // No config file exists, use default settings
        return DefaultSettings;
    } else {
        // Migrate from older version (using the new system) to latest one
        if (from_ver + 1 < to_ver) { // Recursively upgrade in one-version steps
            settings = MigrateSettings(from_ver, from_ver + 1, settings);
            return MigrateSettings(from_ver + 1, to_ver, settings);
        }
        // If we reach this point it's guaranteed that from_ver === to_ver - 1, so we can implement
        // a switch for each version step that upgrades to the next version. This enables us to
        // upgrade from any version to the latest version without additional effort!
        switch (to_ver) {
            default:
                let oldsettings = settings
                settings = Object.assign(DefaultSettings, {});
                for (let option in oldsettings) {
                    if (settings[option]) {
                        settings[option] = oldsettings[option]
                    }
                }
                break;
        }
        return settings;
    }
}
