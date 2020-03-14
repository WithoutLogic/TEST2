const SettingsUI = require('tera-mod-ui').Settings;
const Vec3 = require('tera-vec3');

module.exports = function TEST2(mod) {
	// Settings UI
	let ui = null;
	if (global.TeraProxy.GUIMode) {
		ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { height: 900 });
		ui.on('update', settings => mod.settings = settings);
		this.destructor = () => {
			if (ui) {
				ui.close();
				ui = null;
			}
		};
	}
	
	mod.command.add("ui", () => {
		ui.show();
	})
	
	let uid1 = 899999999n,     // 龙头UID
		uid2 = 799999999n;     // 花朵UID
		// point string circle
	let bossLoc = {
			"x": 12002,
			"y": 7739,
			"z": 974
		},
		bossAngle = 0,
		offsetLoc = {};
		// curAngle= 0;
	
	mod.hook('C_PLAYER_LOCATION', 5, event => {
		if (event.type == 5) {
			bossLoc = {
				"x": 12002,
				"y": 7739,
				"z": 974
			};
			bossAngle = 0;
		}
	});
	
	mod.command.add("show", () => {
		mod.send('S_SPAWN_NPC', 11, {
			loc: 			bossLoc,
			w: 				bossAngle,
			gameId: 		mod.settings.gameId,
			huntingZoneId: 	mod.settings.huntingZoneId,
			templateId: 	mod.settings.templateId,
			shapeId: 		mod.settings.shapeId,
			status: 		mod.settings.status,
			hpLevel: 		mod.settings.hpLevel,
			visible: 		true
		});
	});
	
	mod.command.add("hide", () => {
		mod.send('S_DESPAWN_NPC', 3, {
			gameId: 		mod.settings.gameId,
			loc: 			bossLoc,
			type: 			5,
			unk: 			0
		});
	});
	
	mod.command.add("do", () => {
		SpawnThing(
					bossLoc,
					bossAngle,
		mod.settings.duration,
		mod.settings.type,
		mod.settings.offsetAngle,
		mod.settings.offsetDistance,
		mod.settings.minRadius,
		mod.settings.maxRadius,
		mod.settings.rotateAngle,
		mod.settings.rotateRadius
		);
	});
	
	mod.command.add("go", () => {
		SpawnThing(
					bossLoc,
					bossAngle,
		mod.settings.duration,
		mod.settings.type,
		mod.settings.offsetAngle,
		mod.settings.offsetDistance,
		mod.settings.minRadius,
		mod.settings.maxRadius,
		mod.settings.rotateAngle,
		mod.settings.rotateRadius
		);
		
		var action = {
			loc: 			bossLoc,
			w: 				bossAngle,
			gameId: 		mod.settings.gameId,
			templateId: 	mod.settings.templateId,
			skill: {
				id: 			mod.settings.skill_id,
				type: 			1,
				npc: 			true,
				huntingZoneId: 	mod.settings.huntingZoneId,
				reserved: 		0
			},
			stage: 			mod.settings.stage,
			speed: 			1,
			projectileSpeed:1,
			id: 			mod.settings.id,
			effectScale: 	1,
			dest: 			bossLoc,
			target:			mod.game.me.gameId
		};
		
		mod.send('S_ACTION_END', 5, action);
		mod.send('S_ACTION_STAGE', 9, action);
		setTimeout(()=> {
			mod.send('S_ACTION_END', 5, action);
		}, 5000);
		
	});
	
	/* distance         1.参照坐标
	   angle            2.参照角度
	   duration         3.持续时间
	   type             4.类型
	   offsetAngle      5.偏移角度
	   offsetDistance   6.偏移距离
	   min              7.最小距离(圆形度数)
	   max              8.最大距离(圆形度数)
	   rotateAngle      9.旋转角度(圆形间隔)
	   rotateRadius     0.直线忽略(圆形半径) */
	
	function SpawnThing(distance, angle, duration, type, offsetAngle, offsetDistance, minRadius, maxRadius, rotateAngle, rotateRadius) {
		// 偏移坐标(OffsetLocation)
		if (type!=1 && offsetDistance!=0) {
			SpawnPoint(distance, angle, 100, 0, offsetAngle, offsetDistance);
			distance = offsetLoc;
		} else {
			distance = bossLoc;
		}
		
		if (type==1) {
			// 构建标记(SpawnPoint)
			SpawnPoint(distance, angle, duration, type, offsetAngle, offsetDistance);
		}
		if (type==2) {
			// 构建直线(SpawnString)
			for (var interval=50; interval<=maxRadius; interval+=50) {
				if (interval<minRadius) continue;
				SpawnPoint(distance, angle, duration, type, rotateAngle, interval);
			}
		}
		if (type==3) {
			// 构建圆弧(SpawnCircle)
			for (var interval=0; interval<360; interval+=rotateAngle) {
				if (minRadius<maxRadius) {
					if (interval<minRadius || interval>maxRadius) continue;
				} else {
					if (interval<minRadius && interval>maxRadius) continue;
				}
				SpawnPoint(distance, angle, duration, type, interval, rotateRadius);
			}
		}
	}
	
	function SpawnPoint(distance, angle, duration, type, offsetAngle, offsetDistance) {
		var r = null, rads = null, finalrad = null, spawnx = null, spawny = null;
		r = angle - Math.PI;
		rads = (offsetAngle * Math.PI/180);
		finalrad = r - rads;
		spawnx = distance.x + offsetDistance * Math.cos(finalrad);
		spawny = distance.y + offsetDistance * Math.sin(finalrad);
		
		offsetLoc = new Vec3(spawnx, spawny, distance.z);
		
		if (type == 1) {
			SpawnD(uid1, offsetLoc);
			setTimeout(DespawnD, duration, uid1);
			uid1--;
		} else {
			SpawnC(uid2, offsetLoc, r);
			setTimeout(DespawnC, duration, uid2);
			uid2--;
		}
	}
	
	function SpawnD(uid1, loc) {
		mod.send('S_SPAWN_DROPITEM', 8, {
			gameId: uid1,
			loc: loc,
			item: mod.settings.spawnDropitem,
			amount: 1,
			expiry: 600000,
			owners: [{}]
		});
	}
	
	function DespawnD(uid1) {
		mod.send('S_DESPAWN_DROPITEM', 4, {
			gameId: uid1
		});
	}
	
	function SpawnC(uid2, loc, w) {
		mod.send('S_SPAWN_COLLECTION', 4, {
			gameId : uid2,
			id : mod.settings.spawnCollection,
			amount : 1,
			loc : loc,
			w : w
		});
	}
	
	function DespawnC(uid2) {
		mod.send('S_DESPAWN_COLLECTION', 2, {
			gameId : uid2
		});
	}
	
}
