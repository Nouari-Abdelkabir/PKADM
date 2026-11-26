

// 1. قاموس الترجمة (عربي / فرنسي)
let currentLang = 'ar';
const translations = {
    ar: {
        title: "🛣️ إدارة الطريق السيار (A3 / A7)",
        gpsBtn: "موقعي (GPS)",
        gpsActiveBtn: "إخفاء GPS",
        toolsBtn: "الأدوات",
        addStationTitle: "إضافة / تعديل محطة",
        routeLabel: "المسار / البدال:",
        pkLabel: "النقطة الكيلومترية (PK):",
        nameLabel: "اسم المحطة / المنشأة:",
        addBtn: "إضافة للخريطة",
        updateBtn: "حفظ التعديل",
        cancelBtn: "إلغاء التعديل",
        routeToolsTitle: "أدوات المسار والبيانات",
        editRouteBtn: "تعديل مسار الطريق",
        saveRouteBtn: "حفظ المسار المعدّل",
        downloadCoordsBtn: "تحميل إحداثيات المسار",
        exportCsvBtn: "تصدير إلى Excel (CSV)",
        savedStationsTitle: "المحطات المسجلة",
        clearAllBtn: "مسح الكل",
        reverseSuffix: " (اتجاه معاكس)",
        popupRoute: "المسار: ",
        popupLoc: "الموقع: ",
        langToggle: "🇲🇦 العربية",
        
        patrolTitle: "مسار الدورية وحساب الكيلومترات",
        selectSegmentAxis: "اختر المحور / البدال:",
        fromPkLabel: "من (PK):",
        toPkLabel: "إلى (PK):",
        addSegBtn: "إضافة مقطع للدورية",
        totalMileageLabel: "المسافة الإجمالية:",
        startCarBtn: "تحريك السيارة",
        pauseCarBtn: "إيقاف مؤقت",
        exportPatrolBtn: "تصدير تقرير الكيلومترات",
        lockBtn: "قفل الأدوات",
        clearPatrolBtn: "مسح مسار الدورية",

    },
    fr: {
        title: "🛣️ Gestion Autoroute (A3 / A7)",
        gpsBtn: "Ma position (GPS)",
        gpsActiveBtn: "Masquer GPS",
        toolsBtn: "Outils",
        addStationTitle: "Ajouter / Modifier un point",
        routeLabel: "Axe / Échangeur :",
        pkLabel: "Point Kilométrique (PK) :",
        nameLabel: "Nom de l'ouvrage / station :",
        addBtn: "Ajouter sur la carte",
        updateBtn: "Enregistrer modif.",
        cancelBtn: "Annuler",
        routeToolsTitle: "Outils d'axe et données",
        editRouteBtn: "Modifier le tracé",
        saveRouteBtn: "Enregistrer le tracé",
        downloadCoordsBtn: "Télécharger coordonnées",
        exportCsvBtn: "Exporter vers Excel (CSV)",
        savedStationsTitle: "Points enregistrés",
        clearAllBtn: "Tout effacer",
        reverseSuffix: " (Sens opposé)",
        popupRoute: "Axe : ",
        popupLoc: "Position : ",
        langToggle: "🇫🇷 Français",
        patrolTitle: "Circuit Patrouille & Kilométrage",
        selectSegmentAxis: "Choisir l'axe / bretelle :",
        fromPkLabel: "De (PK) :",
        toPkLabel: "À (PK) :",
        addSegBtn: "Ajouter un tronçon",
        totalMileageLabel: "Distance totale :",
        startCarBtn: "Lancer le véhicule",
        pauseCarBtn: "Pause",
        lockBtn: "Verrouiller",
        exportPatrolBtn: "Exporter bilan km",
        clearPatrolBtn: "Vider le circuit",

    }
};

function toggleLanguage() {
    currentLang = (currentLang === 'ar') ? 'fr' : 'ar';
    document.documentElement.dir = (currentLang === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;

    const t = translations[currentLang];
    document.getElementById('app-title').innerText = t.title;
    document.getElementById('lang-btn').innerText = t.langToggle;

    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerText = t[key];
    });

    // تحديث النصوص الديناميكية
    if (isGpsActive) {
        document.querySelector('#gps-btn span').innerText = t.gpsActiveBtn;
    }
    if (editingStationIndex !== null) {
        document.querySelector('#save-station-btn span').innerText = t.updateBtn;
    }
    if (isEditing) {
        document.querySelector('#edit-route-btn span').innerText = t.saveRouteBtn;
    }

    renderAllRoutes(false);
    refreshAllStations();
}

// دوال فتح وطي القوائم
// كلمة المرور الخاصة بالدخول إلى قائمة الأدوات
const ADMIN_PASSWORD = "2026";

// =========================================================
// إعدادات حجم شعارات باحات الاستراحة (Logos) وطول خط الربط
// =========================================================
const LOGO_CONFIG = {
    folder: "image/",       // اسم مجلد الصور
    zoomSmallSize: 18,      // حجم الصورة عند الزوم البعيد
    zoomMediumSize: 30,     // حجم الصورة عند الزوم المتوسط
    zoomLargeSize: 44,      // حجم الصورة عند الزوم القريب
    lineOffsetKm: 0.25      // <-- غيّر هذا الرقم لتحديد طول الخط (0.25 = 250 متر، 0.15 = 150 متر)
};

let isAdminUnlocked = false; // يُعاد ضبطه تلقائياً إلى false مع كل تحديث للصفحة (F5)

function toggleControlDrawer() {
    const drawer = document.getElementById('control-drawer');
    const isOpening = drawer.classList.contains('collapsed');

    if (isOpening && !isAdminUnlocked) {
        const promptMsg = (currentLang === 'ar') 
            ? "🔒 أدخل كلمة المرور للوصول إلى الأدوات:" 
            : "🔒 Entrez le mot de passe pour accéder aux outils :";
            
        const enteredPass = prompt(promptMsg);

        if (enteredPass !== ADMIN_PASSWORD) {
            if (enteredPass !== null) {
                alert(currentLang === 'ar' ? "❌ كلمة المرور غير صحيحة!" : "❌ Mot de passe incorrect !");
            }
            return;
        }

        isAdminUnlocked = true; // فتح الجلسة الحالية فقط
    }

    drawer.classList.toggle('collapsed');
}
// دالة قفل القائمة وتأمينها فوراً بكلمة المرور
function lockAdminDrawer() {
    isAdminUnlocked = false;
    document.getElementById('control-drawer').classList.add('collapsed');
}




// دالة عامة لفتح وطي أي قسم داخل القائمة
function toggleAccordion(contentId, btnElement) {
    const content = document.getElementById(contentId);
    const arrow = btnElement.querySelector('.arrow');
    content.classList.toggle('collapsed');
    if (arrow) {
        arrow.innerText = content.classList.contains('collapsed') ? '▼' : '▲';
    }
}


// 2. تحميل المكتبات
// 2. تحميل المكتبات (مع إضافة مكتبة قراءة الإكسل SheetJS)
(function loadLibraries() {
    const badge = document.getElementById('status-badge');
    [
        'https:/' + '/cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
        'https:/' + '/cdn.jsdelivr.net/npm/@geoman-io/leaflet-geoman-free@2.16.0/dist/leaflet-geoman.css'
    ].forEach(function(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    });

    const leafletScript = document.createElement('script');
    leafletScript.src = 'https:/' + '/cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
    leafletScript.onload = function() {
        const turfScript = document.createElement('script');
        turfScript.src = 'https:/' + '/cdn.jsdelivr.net/npm/@turf/turf@6/turf.min.js';
        turfScript.onload = function() {
            const geomanScript = document.createElement('script');
            geomanScript.src = 'https:/' + '/cdn.jsdelivr.net/npm/@geoman-io/leaflet-geoman-free@2.16.0/dist/leaflet-geoman.min.js';
                        geomanScript.onload = function() {
                const xlsxScript = document.createElement('script');
                xlsxScript.src = 'https:/' + '/cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
                xlsxScript.onload = function() {
                    badge.style.background = '#c6f6d5';
                    badge.innerText = '✅';
                    initApp();
                };
                xlsxScript.onerror = function() {
                    // خادم بديل في حال حجب jsDelivr
                    const backupXlsx = document.createElement('script');
                    backupXlsx.src = 'https:/' + '/://cloudflare.com';
                    backupXlsx.onload = function() {
                        badge.style.background = '#c6f6d5';
                        badge.innerText = '✅';
                        initApp();
                    };
                    document.body.appendChild(backupXlsx);
                };
                document.body.appendChild(xlsxScript);
            };

            document.body.appendChild(geomanScript);
        };
        document.body.appendChild(turfScript);
    };
    document.body.appendChild(leafletScript);
})();


let map, stationsLayer, savedStations, superMajorPkLayer, majorPkLayer, minorPkLayer, routesLayer;
let loadedLines = {};
let routePolylines = {};
let isEditing = false;
let currentlyEditingId = null;
let inspectMarker = null;
let isGpsActive = false;
let userLocationMarker = null;
let editingStationIndex = null;

let savedRoutesCoords = JSON.parse(localStorage.getItem('customAllRoutesCoords')) || {};

function initApp() {
    map = L.map('map').setView([31.83, -8.06], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    routesLayer = L.layerGroup().addTo(map);
    majorPkLayer = L.layerGroup().addTo(map);
    minorPkLayer = L.layerGroup();
    stationsLayer = L.layerGroup().addTo(map);
        superMajorPkLayer = L.layerGroup().addTo(map);
    majorPkLayer = L.layerGroup().addTo(map);
    minorPkLayer = L.layerGroup();


    renderAllRoutes(true);

    const localSt = JSON.parse(localStorage.getItem('myHighwayStations')) || [];
    savedStations = (typeof defaultStations !== 'undefined' && localSt.length === 0) ? [...defaultStations] : localSt;
    refreshAllStations();

    map.on('zoomend', updatePkVisibility);
        map.on('click', function(e) {
        // إذا كانت الخريطة بعيدة (Zoom أقل من 11)
        if (map.getZoom() < 11) {
            let closestPoint = null;
            let minDistKm = Infinity;
            const clickedPt = turf.point([e.latlng.lng, e.latlng.lat]);

            // البحث عن أقرب مسار لنقطة ضغط المستخدم
            Object.values(loadedLines).forEach(function(item) {
                const snap = turf.nearestPointOnLine(item.line, clickedPt, { units: 'kilometers' });
                if (snap.properties.dist < minDistKm) {
                    minDistKm = snap.properties.dist;
                    closestPoint = snap.geometry.coordinates;
                }
            });

            // إذا ضغط المستخدم بالقرب من الطريق السيار (ضمن هامش 25 كم من إصبعه)
            if (closestPoint && minDistKm <= 25) {
                const targetLatLng = L.latLng(closestPoint.at(1), closestPoint.at(0));
                // تقريب الخريطة لمجال رؤية يساوي 50 كيلومتراً (50,000 متر) حول النقطة
                map.fitBounds(targetLatLng.toBounds(5000));
                return; // التوقف هنا لترك المستخدم يختار ما يريد بعد التقريب
            }
        }

        // في حال كانت الخريطة مقربة مسبقاً وضغط بعيداً عن المسارات، نخفي الأشرطة كالمعتاد
        hideInspectionBanners();
    });

    updatePkVisibility();
}

function renderAllRoutes(fitMap) {
    routesLayer.clearLayers();
    majorPkLayer.clearLayers();
    minorPkLayer.clearLayers();
    loadedLines = {};
    routePolylines = {};

    const selectMenu = document.getElementById('direction');
    const previousSelection = selectMenu.value;
    selectMenu.innerHTML = '';

    let allBounds = L.latLngBounds([]);
    const revText = translations[currentLang].reverseSuffix;

    allRoutes.forEach(function(route) {
        const forwardName = route.forwardDir ? (route.name + ' - ' + route.forwardDir) : route.name;
        const activeCoords = savedRoutesCoords[route.id] || route.coords;
        const turfLine = turf.lineString(activeCoords);
        
        loadedLines[route.id] = { 
            line: turfLine, 
            info: { ...route, name: forwardName }, 
            coords: activeCoords 
        };

        const latLngs = activeCoords.map(function(pt) { return [pt.at(1), pt.at(0)]; });
        const poly = L.polyline(latLngs, { color: route.color, weight: 5 })
            .addTo(routesLayer)
            .on('click', function(e) { inspectRoutePoint(e, route.id); });
            
        poly.bindTooltip(forwardName, { sticky: true });
        routePolylines[route.id] = poly;
        allBounds.extend(poly.getBounds());

        const opt = document.createElement('option');
        opt.value = route.id;
        opt.innerText = forwardName;
        selectMenu.appendChild(opt);

        if (route.hasReverse) {
            const offsetDistance = route.offsetDist || 0.015; // القيمة الافتراضية 15 متراً
            const offsetLine = turf.lineOffset(turfLine, offsetDistance, { units: 'kilometers' });

            const coordsRev = [...offsetLine.geometry.coordinates].reverse();
            const turfRevLine = turf.lineString(coordsRev);
            const revId = route.id + '_rev';
            const reverseName = route.reverseDir ? (route.name + ' - ' + route.reverseDir) : (route.name + revText);

            loadedLines[revId] = { 
                line: turfRevLine, 
                info: { ...route, name: reverseName, isReverse: true },
                coords: coordsRev
            };

            const revColor = route.reverseColor || '#e53e3e';
            const latLngsRev = coordsRev.map(function(pt) { return [pt.at(1), pt.at(0)]; });
            L.polyline(latLngsRev, { color: revColor, weight: 5 })
             .addTo(routesLayer)
             .on('click', function(e) { inspectRoutePoint(e, revId); });

            const optRev = document.createElement('option');
            optRev.value = revId;
            optRev.innerText = reverseName;
            selectMenu.appendChild(optRev);
        }

                const totalLength = turf.length(turfLine, { units: 'kilometers' });
        const step = route.pkInterval || 1;
        const dir = route.labelDir || 'top';
        const offsetVal = (dir === 'right') ? Array(6, 0) : (dir === 'left') ? Array(-6, 0) : Array(0, -4);

        for (let km = 0; km <= totalLength; km += step) {
            const cleanKm = Math.round(km * 100) / 100;
            const pt = turf.along(turfLine, cleanKm, { units: 'kilometers' });
            const lon = pt.geometry.coordinates.at(0);
            const lat = pt.geometry.coordinates.at(1);
            const realPK = Math.round((route.startPK + cleanKm) * 100) / 100;

            // تصنيف النقطة إلى 3 مستويات حسب الرقم الكيلومتري
            let targetLayer = minorPkLayer;
            let isSuperMajor = false;
            let isMajor = false;

            if (route.hasReverse) {
                // للطريق السيار الرئيسي
                if (realPK % 50 === 0 || cleanKm === 0) {
                    targetLayer = superMajorPkLayer; // تظهر دائماً حتى في الزوم البعيد جداً
                    isSuperMajor = true;
                } else if (realPK % 10 === 0) {
                    targetLayer = majorPkLayer;      // تظهر في الزوم المتوسط (9 إلى 12)
                    isMajor = true;
                }
            } else {
                // للبدالات القصيرة: تظهر فقط عند التقريب الشديد
                targetLayer = minorPkLayer;
            }

            L.circleMarker([lat, lon], {
                radius: isSuperMajor ? 5 : isMajor ? 3.5 : 2.5,
                color: '#1a202c',
                fillColor: isSuperMajor ? '#ef4444' : isMajor ? '#ecc94b' : '#ffffff',
                fillOpacity: 1,
                weight: 1
            })
            .addTo(targetLayer)
            .bindTooltip('PK ' + realPK, {
                permanent: route.hasReverse,
                direction: dir,
                offset: offsetVal,
                className: 'pk-label'
            });
        }

    });

    if (previousSelection && loadedLines[previousSelection]) {
        selectMenu.value = previousSelection;
    }
    if (fitMap && allBounds.isValid()) map.fitBounds(allBounds);
    updatePkVisibility();
}

function updatePkVisibility() {
    const currentZoom = map.getZoom();

    // 1. طبقة الـ 50 كم: تظهر دائماً (حتى لو كان الزوم صغيراً جداً)
    if (!map.hasLayer(superMajorPkLayer)) map.addLayer(superMajorPkLayer);

    // 2. طبقة الـ 10 كم: تظهر فقط إذا كان الزوم 9 أو أكثر
    if (currentZoom >= 9) {
        if (!map.hasLayer(majorPkLayer)) map.addLayer(majorPkLayer);
    } else {
        if (map.hasLayer(majorPkLayer)) map.removeLayer(majorPkLayer);
    }

    // 3. الطبقة التفصيلية (كل 1 كم والبدالات): تظهر فقط إذا كان الزوم 13 أو أكثر
    if (currentZoom >= 13) {
        if (!map.hasLayer(minorPkLayer)) map.addLayer(minorPkLayer);
    } else {
        if (map.hasLayer(minorPkLayer)) map.removeLayer(minorPkLayer);
    }
     // تحديث حجم شعارات المحطات مع تغيير الزوم
    if (savedStations && savedStations.length > 0) {
        refreshAllStations();
    }

    // ضبط حجم الخط حسب الزوم
    setTimeout(function() {
        const labels = document.querySelectorAll('.pk-label');
        labels.forEach(function(lbl) {
            if (currentZoom <= 8) {
                lbl.style.fontSize = '8px';
                lbl.style.padding = '0px 3px';
            } else if (currentZoom <= 12) {
                lbl.style.fontSize = '10px';
                lbl.style.padding = '1px 4px';
            } else {
                lbl.style.fontSize = '12px';
                lbl.style.padding = '2px 5px';
            }
        });
    }, 10);
}


// فحص نقطة على الشريطين وعرض الأشرطة العلوية والسفلية
function inspectRoutePoint(e, routeId) {
    if (e.originalEvent) L.DomEvent.stopPropagation(e);
     // إذا كانت الخريطة بعيدة جداً، نقرّب أولاً لمجال 50 كم حول مكان الضغطة
    if (map.getZoom() < 11 && e.originalEvent) {
        map.fitBounds(L.latLng(e.latlng.lat, e.latlng.lng).toBounds(5000));
        return;
    }
    const selected = loadedLines[routeId];
    if (!selected) return;

    const clickedPt = turf.point([e.latlng.lng, e.latlng.lat]);
    const snapped = turf.nearestPointOnLine(selected.line, clickedPt, { units: 'kilometers' });

    const distFromStart = snapped.properties.location;
    const totalLength = turf.length(selected.line, { units: 'kilometers' });
    const startPK = selected.info.startPK;

    let exactPK = selected.info.isReverse 
        ? (startPK + totalLength - distFromStart) 
        : (startPK + distFromStart);

    const kmPart = Math.floor(exactPK);
    const meterPart = Math.round((exactPK - kmPart) * 1000);
    const pkString = 'PK ' + kmPart + '+' + String(meterPart).padStart(3, '0');

    const snapLon = snapped.geometry.coordinates.at(0).toFixed(6);
    const snapLat = snapped.geometry.coordinates.at(1).toFixed(6);

    document.getElementById('pk-display-text').innerText = pkString + ' (' + selected.info.name + ')';
    document.getElementById('gps-display-text').innerText = snapLat + ', ' + snapLon;
    
    document.getElementById('pk-top-banner').style.display = 'flex';
    document.getElementById('gps-bottom-banner').style.display = 'flex';

    if (inspectMarker) map.removeLayer(inspectMarker);
    inspectMarker = L.circleMarker([snapLat, snapLon], {
        radius: 7, color: '#ffffff', fillColor: '#10b981', fillOpacity: 1, weight: 2
    }).addTo(map);
}

// ضع هنا رقم هاتف مركز المراقبة أو الدورية (بصيغة دولية بدون + للواتساب، وبـ + للـ SMS)
// 1. جدول توجيه البلاغات حسب النقطة الكيلومترية على المحور الرئيسي A3
const DISPATCH_ZONES = [
    {
        zoneName: "المركز 1 (مقطع PK 34+000 إلى PK 242+200)",
        minPK: 34.000,
        maxPK: 242.200,
        phone: "212667822774" // الرقم الأول بصيغة دولية (2126...)
    },
    {
        zoneName: "المركز 2 (مقطع PK 242+201 إلى PK 450+000)",
        minPK: 242.201,
        maxPK: 450.000,
        phone: "212662053193" // الرقم الثاني بصيغة دولية (2126...)
    }
];

// رقم احتياطي في حال كان الموقع خارج النطاقين أعلاه (مثلاً بين PK 0 و PK 34)
const DEFAULT_CENTER_PHONE = "212618160586";

// دالة ذكية تحدد رقم الهاتف المناسب لموقع المستخدم (حتى لو كان داخل بدال أو Pénétrante)
// دالة مضمونة لتحديد رقم الهاتف حسب موقع المستخدم على الطريق السيار أو البدالات
function getDispatchPhoneForLocation(lat, lon, closestRouteId) {
    let referencePK = null;
    const selected = loadedLines[closestRouteId];

    // 1. إذا كان المستخدم على المحور الرئيسي A3 مباشرة
    if (selected && selected.info.name.indexOf('A3') !== -1) {
        const snap = turf.nearestPointOnLine(selected.line, turf.point([lon, lat]), { units: 'kilometers' });
        const dist = snap.properties.location;
        const len = turf.length(selected.line, { units: 'kilometers' });
        referencePK = selected.info.isReverse 
            ? (selected.info.startPK + len - dist) 
            : (selected.info.startPK + dist);
    } else {
        // 2. إذا كان داخل بدال (Echangeur) أو Pénétrante: نجد أقرب نقطة على الطريق السيار A3
        const a3Sections = Object.values(loadedLines).filter(function(r) {
            return r.info.name.indexOf('A3') !== -1 && !r.info.isReverse;
        });
        let minSnapDist = Infinity;
        a3Sections.forEach(function(sec) {
            const snap = turf.nearestPointOnLine(sec.line, turf.point([lon, lat]), { units: 'kilometers' });
            if (snap.properties.dist < minSnapDist) {
                minSnapDist = snap.properties.dist;
                referencePK = sec.info.startPK + snap.properties.location;
            }
        });
    }

    // 3. مطابقة الرقم الكيلومتري مع جدول المراكز
    if (referencePK !== null && !isNaN(referencePK)) {
        for (let i = 0; i < DISPATCH_ZONES.length; i++) {
            const zone = DISPATCH_ZONES[i];
            if (referencePK >= zone.minPK && referencePK <= zone.maxPK) {
                return zone.phone;
            }
        }
    }

    return DEFAULT_CENTER_PHONE;
}



let gpsWatchId = null;
let lastGpsPos = null;

function hideInspectionBanners() {
    document.getElementById('pk-top-banner').style.display = 'none';
    document.getElementById('gps-bottom-banner').style.display = 'none';

    // إخفاء أزرار طلب المساعدة دائماً عند الإغلاق
    document.getElementById('sos-sms-btn').style.display = 'none';
    document.getElementById('sos-wa-btn').style.display = 'none';

    if (inspectMarker) { map.removeLayer(inspectMarker); inspectMarker = null; }
    if (userLocationMarker) { map.removeLayer(userLocationMarker); userLocationMarker = null; }
    
    if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
        gpsWatchId = null;
    }
    lastGpsPos = null;

    if (isGpsActive) {
        isGpsActive = false;
        const gpsBtn = document.getElementById('gps-btn');
        gpsBtn.classList.remove('active');
        gpsBtn.querySelector('span').innerText = translations[currentLang].gpsBtn;
        gpsBtn.classList.remove('active', 'waiting-conditions');

    }
}

function locateUser() {
    const gpsBtn = document.getElementById('gps-btn');
    if (isGpsActive) {
        hideInspectionBanners();
        return;
    }
    if (!navigator.geolocation) {
        alert("GPS non supporté / غير مدعوم");
        return;
    }

    isGpsActive = true;
    gpsBtn.classList.add('waiting-conditions'); // يصبح رمادياً وغير مستجيب أثناء البحث
    gpsBtn.querySelector('span').innerText = "⏳ ...";

   
    // مراقبة مستمرة للتحقق من التوقف الفعلي وحساب السرعة بدقة
    gpsWatchId = navigator.geolocation.watchPosition(function(pos) {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const accuracy = pos.coords.accuracy; // دقة الإشارة بالمتر
        let speedKmh = 0;

        // 1. حساب السرعة (إما من حساس الهاتف أو بحساب المسافة بين قراءتين)
        if (pos.coords.speed !== null && pos.coords.speed >= 0) {
            speedKmh = pos.coords.speed * 3.6; // تحويل من م/ث إلى كم/س
        } else if (lastGpsPos) {
            const distKm = turf.distance(turf.point([lastGpsPos.lon, lastGpsPos.lat]), turf.point([lon, lat]), { units: 'kilometers' });
            const timeHours = (pos.timestamp - lastGpsPos.timestamp) / 3600000;
            if (timeHours > 0) speedKmh = distKm / timeHours;
        }
        lastGpsPos = { lat: lat, lon: lon, timestamp: pos.timestamp };

        map.setView([lat, lon], 15);
        if (userLocationMarker) map.removeLayer(userLocationMarker);
        userLocationMarker = L.marker([lat, lon]).addTo(map);

        // 2. البحث عن أقرب مسار وحساب البُعد عنه بالمتر
        let closestRouteId = null;
        let minDistanceKm = Infinity;
        const userPt = turf.point([lon, lat]);

        Object.keys(loadedLines).forEach(function(id) {
            const snap = turf.nearestPointOnLine(loadedLines[id].line, userPt, { units: 'kilometers' });
            if (snap.properties.dist < minDistanceKm) {
                minDistanceKm = snap.properties.dist;
                closestRouteId = id;
            }
        });

        const distanceMeters = minDistanceKm * 1000;

        // عرض الشريط المعلوماتي للمستخدم
        if (closestRouteId) {
            inspectRoutePoint({ latlng: { lat: lat, lng: lon } }, closestRouteId);
        }

        // 3. التحقق الصارم من الشروط الثلاثة لإظهار أو إخفاء أزرار طلب المساعدة
        const smsBtn = document.getElementById('sos-sms-btn');
        const waBtn = document.getElementById('sos-wa-btn');

        const isStopped = speedKmh <= 5;           // شرط 1: واقف (أقل من 5 كم/س)
        const isInsideHighway = distanceMeters <= 200; // شرط 2: داخل هامش 200 متر من الطريق السيار
        const isGoodAccuracy = accuracy <= 100;    // شرط 3: دقة GPS مقبولة (أقل من 100 متر)

        if (isStopped && isInsideHighway && isGoodAccuracy && closestRouteId) {
            // تجهيز نص الرسالة الجاهزة
            gpsBtn.classList.remove('waiting-conditions');
            gpsBtn.classList.add('active');
            gpsBtn.querySelector('span').innerText = translations[currentLang].gpsActiveBtn;

            const pkInfo = document.getElementById('pk-display-text').innerText;
            const mapsLink = 'https:/' + '/://google.com' + lat.toFixed(6) + ',' + lon.toFixed(6);
            const messageText = "🚨 Demande d'assistance Autoroute:\n" +
                                "• Position: " + pkInfo + "\n" +
                                "• GPS: " + lat.toFixed(6) + ", " + lon.toFixed(6) + "\n" +
                                "• Lien: " + mapsLink;

            const encodedMsg = encodeURIComponent(messageText);

                        // استخراج رقم الهاتف المناسب تلقائياً حسب موقع المستخدم
            const targetPhone = getDispatchPhoneForLocation(lat, lon, closestRouteId);

            // تفعيل الروابط بالرقم المناسب وإظهار الأزرار
            smsBtn.href = "sms:+" + targetPhone + "?body=" + encodedMsg;
            waBtn.href = "https:/" + "/wa.me/" + targetPhone + "?text=" + encodedMsg;
            
            smsBtn.style.display = 'inline-flex';
            waBtn.style.display = 'inline-flex';

           


        } else {
            // إخفاء الأزرار تماماً إذا كان متحركاً بسرعة أو خارج الطريق السيار أو الإشارة ضعيفة
            smsBtn.style.display = 'none';
            waBtn.style.display = 'none';
        }

    }, function() {
        alert("تعذر الوصول لإشارة GPS، يرجى تفعيل الموقع في الهاتف.");
        hideInspectionBanners();
    }, {
        enableHighAccuracy: true, // إجبار الهاتف على استخدام شريحة GPS الدقيقة وليس أبراج الاتصال
        maximumAge: 0,
        timeout: 10000
    });
}


function copyText(elementId) {
    const textToCopy = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(textToCopy);
}

// تعديل وحفظ المسار بالماوس
function toggleEditRoute() {
    const btn = document.getElementById('edit-route-btn');
    let selectedId = document.getElementById('direction').value.replace('_rev', '');

    if (!isEditing) {
        isEditing = true;
        currentlyEditingId = selectedId;
        btn.classList.add('active');
        btn.querySelector('span').innerText = translations[currentLang].saveRouteBtn;
        routePolylines[currentlyEditingId].pm.enable({ allowSelfIntersection: false });
        toggleControlDrawer();
    } else {
        isEditing = false;
        btn.classList.remove('active');
        btn.querySelector('span').innerText = translations[currentLang].editRouteBtn;

        const targetPoly = routePolylines[currentlyEditingId];
        targetPoly.pm.disable();

        const newLatLngs = targetPoly.getLatLngs();
        savedRoutesCoords[currentlyEditingId] = newLatLngs.map(function(ll) { return [ll.lng, ll.lat]; });
        localStorage.setItem('customAllRoutesCoords', JSON.stringify(savedRoutesCoords));

        currentlyEditingId = null;
        renderAllRoutes(false);
    }
}

function downloadRouteCoords() {
    let selectedId = document.getElementById('direction').value.replace('_rev', '');
    const routeData = loadedLines[selectedId];
    if (!routeData) return;

    let lines = [];
    for (let i = 0; i < routeData.coords.length; i += 3) {
        const chunk = routeData.coords.slice(i, i + 3).map(function(pt) {
            return '[' + pt.at(0) + ', ' + pt.at(1) + ']';
        });
        lines.push('            ' + chunk.join(', '));
    }

    const blob = new Blob([lines.join(',\n')], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "coords_" + selectedId + ".txt";
    link.click();
}

// إدارة المحطات (إضافة + تعديل + حذف من القائمة الجانبية فقط)
function parsePkInput(rawInput) {
    const cleaned = rawInput.trim().replace(/\s+/g, '');
    if (cleaned.includes('+')) {
        const parts = cleaned.split('+');
        if (parts.length !== 2) return NaN;
        const km = parseInt(parts.at(0), 10);
        const meters = parseFloat(parts.at(1));
        if (isNaN(km) || isNaN(meters) || meters < 0 || meters >= 1000) return NaN;
        return km + (meters / 1000);
    }
    return parseFloat(cleaned);
}

function formatPkDisplay(numericPK) {
    const kmPart = Math.floor(numericPK);
    const meterPart = Math.round((numericPK - kmPart) * 1000);
    return 'PK ' + kmPart + '+' + String(meterPart).padStart(3, '0');
}

function addOrUpdateStation() {
    const routeId = document.getElementById('direction').value;
    const rawPkInput = document.getElementById('pk').value;
    const name = document.getElementById('stationName').value.trim();
    const logoFile = document.getElementById('stationLogo').value.trim();
    const numericPK = parsePkInput(rawPkInput);

    if (isNaN(numericPK) || !name) return;

    const selected = loadedLines[routeId];
    const maxKm = turf.length(selected.line, { units: 'kilometers' });
    const startPK = selected.info.startPK;
    const endPK = Math.round((startPK + maxKm) * 1000) / 1000;

    if (numericPK < startPK || numericPK > endPK) {
        alert(formatPkDisplay(startPK) + " ➔ " + formatPkDisplay(endPK));
        return;
    }

    const distanceOnLine = selected.info.isReverse ? (endPK - numericPK) : (numericPK - startPK);
    const point = turf.along(selected.line, distanceOnLine, { units: 'kilometers' });
    const lon = point.geometry.coordinates.at(0);
    const lat = point.geometry.coordinates.at(1);

    // حساب زاوية الطريق
    const nextDist = Math.min(maxKm, distanceOnLine + 0.05);
    const prevDist = Math.max(0, distanceOnLine - 0.05);
    const pt1 = turf.along(selected.line, prevDist, { units: 'kilometers' });
    const pt2 = turf.along(selected.line, nextDist, { units: 'kilometers' });
    const roadBearing = turf.bearing(pt1, pt2);

    // عكس الزاوية في الاتجاه المعاكس (AC) ليخرج الخط للخارج نحو الباحة وليس فوق المسار الثاني
    const finalAngle = roadBearing - 90;    
    const sidePoint = turf.destination(point, LOGO_CONFIG.lineOffsetKm, finalAngle, { units: 'kilometers' });
    const logoLon = sidePoint.geometry.coordinates.at(0);
    const logoLat = sidePoint.geometry.coordinates.at(1);

    const stationObj = { 
        routeId: routeId, 
        routeName: selected.info.name, 
        numericPK: numericPK,
        formattedPK: formatPkDisplay(numericPK),
        name: name,
        logo: logoFile,
        lat: lat, 
        lon: lon,
        logoLat: logoLat,
        logoLon: logoLon
    };

    if (editingStationIndex !== null) {
        savedStations[editingStationIndex] = stationObj;
        cancelStationEdit();
    } else {
        savedStations.push(stationObj);
    }

    localStorage.setItem('myHighwayStations', JSON.stringify(savedStations));
    refreshAllStations();

    document.getElementById('pk').value = '';
    document.getElementById('stationName').value = '';
    document.getElementById('stationLogo').value = '';
    map.setView([lat, lon], 15);
}


// رسم المحطات بنوافذ نظيفة (بدون أزرار تعديل وحذف على الخريطة)
function getLogoSizeForZoom(zoom) {
    if (zoom < 12) return LOGO_CONFIG.zoomSmallSize;
    if (zoom <= 14) return LOGO_CONFIG.zoomMediumSize;
    return LOGO_CONFIG.zoomLargeSize;
}
function getLogoSizeForZoom(zoom) {
    if (zoom < 12) return LOGO_CONFIG.zoomSmallSize;
    if (zoom <= 14) return LOGO_CONFIG.zoomMediumSize;
    return LOGO_CONFIG.zoomLargeSize;
}

function refreshAllStations() {
    stationsLayer.clearLayers();
    const listContainer = document.getElementById('stations-list-container');
    document.getElementById('stations-count').innerText = savedStations.length;
    if (listContainer) listContainer.innerHTML = '';

    const t = translations[currentLang];
    const currentSize = map ? getLogoSizeForZoom(map.getZoom()) : LOGO_CONFIG.zoomMediumSize;

    savedStations.forEach(function(st, index) {
        const displayPK = st.formattedPK || ('PK ' + st.km);
        const rName = st.routeName || st.direction;
        const cleanPopupHtml = '<b>' + st.name + '</b><br>' + t.popupRoute + rName + '<br>' + t.popupLoc + '<b>' + displayPK + '</b>';

        // إذا كانت المحطة تحتوي على صورة لوغو
        if (st.logo && st.logo.length > 0) {
            const targetLat = st.logoLat || (st.lat + 0.001);
            const targetLon = st.logoLon || (st.lon + 0.001);

            // 1. نقطة ارتكاز صغيرة على مسار الطريق السيار
            L.circleMarker([st.lat, st.lon], {
                radius: 4,
                color: '#1a365d',
                fillColor: '#ecc94b',
                fillOpacity: 1,
                weight: 2
            }).addTo(stationsLayer);

            // 2. خط الربط (Leader Line) بين النقطة على الطريق وصورة اللوغو
            L.polyline([[st.lat, st.lon], [targetLat, targetLon]], {
                color: '#1a365d',
                weight: 2,
                dashArray: '4, 4'
            }).addTo(stationsLayer);

            // 3. أيقونة الشعار (Logo) المتجاوبة مع الزوم
            const logoIcon = L.divIcon({
                className: '',
                html: '<div class="station-logo-wrapper" style="width:' + currentSize + 'px; height:' + currentSize + 'px;">' +
                      '<img src="' + LOGO_CONFIG.folder + st.logo + '" alt="' + st.name + '" onerror="this.parentElement.innerHTML=\'⛽\'" />' +
                      '</div>',
                iconSize: Array(currentSize, currentSize),
                iconAnchor: Array(currentSize / 2, currentSize / 2)
            });

            L.marker([targetLat, targetLon], { icon: logoIcon })
             .addTo(stationsLayer)
             .bindPopup(cleanPopupHtml)
             .on('click', function() {
                 // تقريب الخريطة ليشمل مجال 5 كيلومترات (5000 متر) مع جعل المحطة وسط الشاشة
                 const stationCenter = L.latLng(st.lat, st.lon);
                 map.fitBounds(stationCenter.toBounds(3000));
             });

        } else {
            // محطة عادية بدون شعار (دبوس افتراضي)
            L.marker([st.lat, st.lon]).addTo(stationsLayer).bindPopup(cleanPopupHtml);
        }

        // تحديث القائمة الجانبية
        if (listContainer) {
            const row = document.createElement('div');
            row.className = 'station-item-row';
            
            const infoSpan = document.createElement('span');
            infoSpan.style.cursor = 'pointer';
            infoSpan.innerHTML = '<b>' + st.name + '</b> (' + displayPK + ')';
            infoSpan.onclick = function() { map.setView([st.lat, st.lon], 15); };

            const btnGroup = document.createElement('div');
            const editBtn = document.createElement('button');
            editBtn.className = 'mini-icon-btn';
            editBtn.style.background = '#3182ce';
            editBtn.innerText = '✏️';
            editBtn.onclick = function() { startEditStation(index); };

            const delBtn = document.createElement('button');
            delBtn.className = 'mini-icon-btn';
            delBtn.style.background = '#e53e3e';
            delBtn.style.marginRight = '3px';
            delBtn.innerText = '🗑️';
            delBtn.onclick = function() { deleteSingleStation(index); };

            btnGroup.appendChild(editBtn);
            btnGroup.appendChild(delBtn);
            row.appendChild(infoSpan);
            row.appendChild(btnGroup);
            listContainer.appendChild(row);
        }
    });
}

function startEditStation(index) {
    const st = savedStations[index];
    editingStationIndex = index;

    const formContent = document.getElementById('station-form-content');
    const formBtn = document.getElementById('station-form-accordion-btn');
    if (formContent.classList.contains('collapsed')) {
        formContent.classList.remove('collapsed');
        formBtn.querySelector('.arrow').innerText = '▲';
    }

    if (st.routeId && loadedLines[st.routeId]) {
        document.getElementById('direction').value = st.routeId;
    }
    document.getElementById('pk').value = (st.formattedPK || ('PK ' + st.km)).replace('PK ', '');
    document.getElementById('stationName').value = st.name;
    document.getElementById('stationLogo').value = st.logo || '';

    const saveBtn = document.getElementById('save-station-btn');
    saveBtn.style.backgroundColor = '#dd6b20';
    saveBtn.querySelector('span').innerText = translations[currentLang].updateBtn;
    document.getElementById('cancel-edit-btn').style.display = 'block';
}

function cancelStationEdit() {
    editingStationIndex = null;
    document.getElementById('pk').value = '';
    document.getElementById('stationName').value = '';
    document.getElementById('stationLogo').value = '';

    const saveBtn = document.getElementById('save-station-btn');
    saveBtn.style.backgroundColor = '#38a169';
    saveBtn.querySelector('span').innerText = translations[currentLang].addBtn;
    document.getElementById('cancel-edit-btn').style.display = 'none';
}


function deleteSingleStation(index) {
    savedStations.splice(index, 1);
    localStorage.setItem('myHighwayStations', JSON.stringify(savedStations));
    if (editingStationIndex === index) cancelStationEdit();
    refreshAllStations();
}

function clearStations() {
    localStorage.removeItem('myHighwayStations');
    savedStations = [];
    cancelStationEdit();
    refreshAllStations();
}

function exportToCSV() {
    if (savedStations.length === 0) return;
    let csvContent = "Nom / الاسم,Axe / المسار,PK+M,Latitude,Longitude\n";
    savedStations.forEach(function(st) {
        const rName = st.routeName || st.direction;
        const displayPK = st.formattedPK || ('PK ' + st.km);
        csvContent += '"' + st.name + '","' + rName + '","' + displayPK + '",' + st.lat + ',' + st.lon + "\n";
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "autoroute_points.csv";
    link.click();
}


// =========================================================
// نظام إدارة مسارات الدوريات وحساب الكيلومترات وتحريك السيارة
// =========================================================
let patrolSegments = JSON.parse(localStorage.getItem('savedPatrolCircuit')) || [];
let patrolHighlightLayer = null;
let combinedPatrolLine = null;
let carMarker = null;
let carAnimationTimer = null;
let carTraveledKm = 0;
let isCarRunning = false;

// تحديث قائمة المحاور داخل قسم الدورية عند تحميل الخريطة
const originalRenderAllRoutes = renderAllRoutes;
renderAllRoutes = function(fitMap) {
    originalRenderAllRoutes(fitMap);
    const patrolSelect = document.getElementById('patrol-route-select');
    const mainSelect = document.getElementById('direction');
    if (patrolSelect && mainSelect) {
        patrolSelect.innerHTML = mainSelect.innerHTML;
    }
    if (!patrolHighlightLayer && map) {
        patrolHighlightLayer = L.layerGroup().addTo(map);
    }
    rebuildPatrolCircuit();
};

// إضافة مقطع جديد لمسار الدورية
function addPatrolSegment() {
    const routeId = document.getElementById('patrol-route-select').value;
    const rawStart = document.getElementById('patrol-start-pk').value;
    const rawEnd = document.getElementById('patrol-end-pk').value;

    const startVal = parsePkInput(rawStart);
    const endVal = parsePkInput(rawEnd);

    if (isNaN(startVal) || isNaN(endVal)) {
        alert("يرجى إدخال نقطتي البداية والنهاية بصيغة صحيحة (مثلاً: 199+000)");
        return;
    }

    const selected = loadedLines[routeId];
    const maxKm = turf.length(selected.line, { units: 'kilometers' });
    const axisMinPK = selected.info.startPK;
    const axisMaxPK = Math.round((axisMinPK + maxKm) * 1000) / 1000;

    if (startVal < axisMinPK || startVal > axisMaxPK || endVal < axisMinPK || endVal > axisMaxPK) {
        alert("النقاط يجب أن تكون ضمن حدود هذا المحور: " + formatPkDisplay(axisMinPK) + " ➔ " + formatPkDisplay(axisMaxPK));
        return;
    }

    const distanceKm = Math.abs(endVal - startVal);
    if (distanceKm === 0) {
        alert("نقطة البداية والنهاية متطابقتان!");
        return;
    }

    patrolSegments.push({
        routeId: routeId,
        routeName: selected.info.name,
        startPK: startVal,
        endPK: endVal,
        distanceKm: distanceKm
    });

    saveAndRefreshPatrol();
    // تعبئة خانة البداية التالية تلقائياً بنهاية المقطع السابق لتسهيل الربط
    document.getElementById('patrol-start-pk').value = formatPkDisplay(endVal).replace('PK ', '');
    document.getElementById('patrol-end-pk').value = '';
}

// تعديل سريع لنقطة النهاية أو البداية عند وقوع حادث
function editPatrolSegment(index) {
    const seg = patrolSegments[index];
    const newStartRaw = prompt("تعديل نقطة البداية (PK) للمقطع " + seg.routeName + ":", formatPkDisplay(seg.startPK).replace('PK ', ''));
    if (newStartRaw === null) return;
    const newEndRaw = prompt("تعديل نقطة النهاية (PK) (مثلاً عند مكان الحادث):", formatPkDisplay(seg.endPK).replace('PK ', ''));
    if (newEndRaw === null) return;

    const sVal = parsePkInput(newStartRaw);
    const eVal = parsePkInput(newEndRaw);
    if (isNaN(sVal) || isNaN(eVal)) return alert("صيغة غير صحيحة");

    const selected = loadedLines[seg.routeId];
    const maxKm = turf.length(selected.line, { units: 'kilometers' });
    const axisMinPK = selected.info.startPK;
    const axisMaxPK = Math.round((axisMinPK + maxKm) * 1000) / 1000;

    if (sVal < axisMinPK || sVal > axisMaxPK || eVal < axisMinPK || eVal > axisMaxPK) {
        return alert("خارج حدود المحور (" + formatPkDisplay(axisMinPK) + " ➔ " + formatPkDisplay(axisMaxPK) + ")");
    }

    seg.startPK = sVal;
    seg.endPK = eVal;
    seg.distanceKm = Math.abs(eVal - sVal);
    saveAndRefreshPatrol();
}

function deletePatrolSegment(index) {
    patrolSegments.splice(index, 1);
    saveAndRefreshPatrol();
}

function clearPatrolCircuit() {
    resetCarSimulation();
    patrolSegments = [];
    saveAndRefreshPatrol();
}

function saveAndRefreshPatrol() {
    localStorage.setItem('savedPatrolCircuit', JSON.stringify(patrolSegments));
    rebuildPatrolCircuit();
}

// بناء المسار المجمع ورسمه وحساب الكيلومترات الإجمالية
function rebuildPatrolCircuit() {
    if (!patrolHighlightLayer) return;
    patrolHighlightLayer.clearLayers();
    resetCarSimulation();

    const listEl = document.getElementById('patrol-segments-list');
    const totalEl = document.getElementById('total-patrol-km');
    if (listEl) listEl.innerHTML = '';

    let totalKm = 0;
    let allCircuitCoords = [];

    patrolSegments.forEach(function(seg, index) {
        totalKm += seg.distanceKm;
        const selected = loadedLines[seg.routeId];
        if (!selected) return;

        // استخراج الجزء الهندسي للمقطع من الخط الأصلي
        const axisStart = selected.info.startPK;
        const axisLen = turf.length(selected.line, { units: 'kilometers' });
        
        let d1 = selected.info.isReverse ? (axisStart + axisLen - seg.startPK) : (seg.startPK - axisStart);
        let d2 = selected.info.isReverse ? (axisStart + axisLen - seg.endPK) : (seg.endPK - axisStart);

        d1 = Math.max(0, Math.min(axisLen, d1));
        d2 = Math.max(0, Math.min(axisLen, d2));

        let slicedCoords = [];
        if (d1 !== d2) {
            const minD = Math.min(d1, d2);
            const maxD = Math.max(d1, d2);
            const sliced = turf.lineSliceAlong(selected.line, minD, maxD, { units: 'kilometers' });
            slicedCoords = sliced.geometry.coordinates;
            if (d1 > d2) slicedCoords.reverse();
        }

        if (slicedCoords.length > 0) {
            allCircuitCoords = allCircuitCoords.concat(slicedCoords);
            const latLngs = slicedCoords.map(function(pt) { return [pt.at(1), pt.at(0)]; });
            // رسم خط متقطع لامع يوضح مسار الدورية النشط
            L.polyline(latLngs, { color: '#10b981', weight: 7, opacity: 0.75, dashArray: '10, 8' }).addTo(patrolHighlightLayer);
        }

        // عرض المقطع في القائمة مع زر تعديل سريع للحوادث
        if (listEl) {
            const row = document.createElement('div');
            row.className = 'station-item-row';
            
            const txt = document.createElement('span');
            txt.innerHTML = '<b>' + (index + 1) + '. ' + seg.routeName + '</b><br>' +
                            formatPkDisplay(seg.startPK) + ' ➔ ' + formatPkDisplay(seg.endPK) + 
                            ' (<span style="color:#2b6cb0; font-weight:bold;">' + seg.distanceKm.toFixed(3) + ' km</span>)';

            const btns = document.createElement('div');
            const editB = document.createElement('button');
            editB.className = 'mini-icon-btn';
            editB.style.background = '#3182ce';
            editB.innerText = '✏️';
            editB.title = 'تعديل عند وقوع حادث';
            editB.onclick = function() { editPatrolSegment(index); };

            const delB = document.createElement('button');
            delB.className = 'mini-icon-btn';
            delB.style.background = '#e53e3e';
            delB.style.marginRight = '3px';
            delB.innerText = '🗑️';
            delB.onclick = function() { deletePatrolSegment(index); };

            btns.appendChild(editB);
            btns.appendChild(delB);
            row.appendChild(txt);
            row.appendChild(btns);
            listEl.appendChild(row);
        }
    });

    if (totalEl) totalEl.innerText = totalKm.toFixed(3) + ' km';

    if (allCircuitCoords.length >= 2) {
        combinedPatrolLine = turf.lineString(allCircuitCoords);
        // وضع السيارة في نقطة الانطلاق
        const startPt = allCircuitCoords.at(0);
        placeCarAt(startPt.at(1), startPt.at(0));
    } else {
        combinedPatrolLine = null;
        if (carMarker) { map.removeLayer(carMarker); carMarker = null; }
    }
}

function placeCarAt(lat, lon) {
    if (!carMarker) {
        const icon = L.divIcon({
            html: '<div class="patrol-car-icon">🚓</div>',
            className: '',
            iconSize: Array(26, 26),
            iconAnchor: Array(13, 13)
        });
        carMarker = L.marker([lat, lon], { icon: icon, zIndexOffset: 2000 }).addTo(map);
    } else {
        carMarker.setLatLng([lat, lon]);
    }
}

// تشغيل وإيقاف محاكاة حركة السيارة
function toggleCarSimulation() {
    if (!combinedPatrolLine) {
        alert("يرجى إضافة مقطع واحد على الأقل لمسار الدورية أولاً.");
        return;
    }

    const btn = document.getElementById('play-car-btn');
    const t = translations[currentLang];

    if (isCarRunning) {
        isCarRunning = false;
        clearInterval(carAnimationTimer);
        btn.querySelector('span').innerText = t.startCarBtn;
        btn.style.backgroundColor = '#805ad5';
    } else {
        isCarRunning = true;
        btn.querySelector('span').innerText = t.pauseCarBtn;
        btn.style.backgroundColor = '#dd6b20';

        const totalCircuitKm = turf.length(combinedPatrolLine, { units: 'kilometers' });
        const speedStepKm = 0.08; // سرعة الحركة على الخريطة (80 متر كل جزء من الثانية)

        carAnimationTimer = setInterval(function() {
            carTraveledKm += speedStepKm;
            if (carTraveledKm >= totalCircuitKm) {
                carTraveledKm = totalCircuitKm;
                toggleCarSimulation(); // إيقاف عند الوصول لنهاية الدورية
            }

            const pt = turf.along(combinedPatrolLine, carTraveledKm, { units: 'kilometers' });
            const lon = pt.geometry.coordinates.at(0);
            const lat = pt.geometry.coordinates.at(1);
            placeCarAt(lat, lon);

            document.getElementById('car-live-status').innerText = 
                'المسافة المقطوعة: ' + carTraveledKm.toFixed(2) + ' / ' + totalCircuitKm.toFixed(2) + ' km';
        }, 100);
    }
}

function resetCarSimulation() {
    isCarRunning = false;
    clearInterval(carAnimationTimer);
    carTraveledKm = 0;
const btn = document.getElementById('play-car-btn');
if (btn) {
btn.querySelector('span').innerText = translations[currentLang].startCarBtn;
btn.style.backgroundColor = '#805ad5';
}
document.getElementById('car-live-status').innerText = '';
if (combinedPatrolLine) {
const startPt = combinedPatrolLine.geometry.coordinates.at(0);
placeCarAt(startPt.at(1), startPt.at(0));
}
}
function exportPatrolCSV() {
if (patrolSegments.length === 0) return;
let csvContent = "الترتيب,المحور / البدال,من PK,إلى PK,المسافة (كم)\n";
let sum = 0;
patrolSegments.forEach(function(seg, i) {
sum += seg.distanceKm;
csvContent += (i + 1) + ',"' + seg.routeName + '","' + formatPkDisplay(seg.startPK) + '","' + formatPkDisplay(seg.endPK) + '",' + seg.distanceKm.toFixed(3) + "\n";
});
csvContent += ',,,"المجموع الإجمالي",' + sum.toFixed(3) + "\n";
const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = "تقرير_كيلومترات_الدورية.csv";
link.click();
}



// =========================================================
// وحدة استيراد وتدقيق ملفات Excel/CSV ورسم المعادلات على الخريطة
// =========================================================
let auditedRows = [];
let currentFilter = 'ALL';
let excelRouteLayer = null;

// القوالب القياسية للمركبات M1 إلى M6 (تُستخدم تلقائياً إذا كانت الخانة فارغة)
const standardFormulas = {
    'M1': '(65-33+2)*2',
    'M2': '(104-52+3)*2',
    'M3': '(160-104+3)*2',
    'M4': '(213-160+2)*2',
    'M5': '(232-198+2)*2',
    'M6': '(282-232+3)*2'
};

function toggleExcelDrawer() {
    document.getElementById('excel-drawer').classList.toggle('collapsed');
    if (!excelRouteLayer && map) {
        excelRouteLayer = L.layerGroup().addTo(map);
    }
}

// قراءة ملف Excel أو CSV
// قراءة ملف Excel أو CSV مع التحقق من جاهزية المكتبة
function handleExcelUpload(event) {
    const file = event.target.files.item(0);
    if (!file) return;

    if (typeof XLSX === 'undefined') {
        alert("⏳ مكتبة قراءة الإكسل (SheetJS) لم تكتمل بعد أو أن الرابط محجوب. يرجى الانتظار ثانية والمحاولة مجدداً.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            auditedRows = [];
            workbook.SheetNames.forEach(function(sheetName) {
                const sheet = workbook.Sheets[sheetName];
                const jsonRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                parseSheetRows(jsonRows, sheetName);
            });

            if (auditedRows.length === 0) {
                alert("⚠️ تم فتح الملف بنجاح، ولكن لم يتم العثور على صفوف مركبات (M1, M2, M3...). تأكد من وجود عمود باسم 'mobile'.");
            }

            renderExcelTable();
        } catch (err) {
            alert("❌ حدث خطأ أثناء قراءة الملف: " + err.message);
        }
    };
    reader.readAsArrayBuffer(file);
    // تفريغ قيمة المدخل للسماح بإعادة اختيار نفس الملف مرة أخرى
    event.target.value = '';
}


// استخراج صفوف العمليات الصالحة وتجاهل الهوامش والجداول الفارغة
function parseSheetRows(rows, sheetName) {
    let headerIdx = -1;
    let colMap = {};

    for (let i = 0; i < rows.length; i++) {
        const r = rows.at(i).map(c => String(c).trim().toLowerCase());
        if (r.includes('mobile') && (r.includes('date') || r.includes('poste'))) {
            headerIdx = i;
            r.forEach(function(colName, idx) {
                if (colName.includes('opérateur') || colName.includes('operateur')) colMap.op = idx;
                if (colName === 'poste') colMap.poste = idx;
                if (colName === 'date') colMap.date = idx;
                if (colName === 'marque') colMap.marque = idx;
                if (colName === 'mobile') colMap.mobile = idx;
                if (colName === 'matricule') colMap.matricule = idx;
                if (colName.includes('départ') || colName.includes('début')) colMap.cStart = idx;
                if (colName.includes('fin')) colMap.cEnd = idx;
                if (colName.includes('réel')) colMap.reel = idx;
                if (colName.includes('détail')) colMap.detail = idx;
                if (colName.includes('observation')) colMap.obs = idx;
            });
            continue;
        }

        if (headerIdx !== -1 && i > headerIdx) {
            const row = rows.at(i);
            const mobile = String(row[colMap.mobile] || '').trim().toUpperCase();
            // التحقق أن الصف يخص مركبة (M1, M2, M3, M4, M5, M6...)
            if (/^M\d+/.test(mobile)) {
                const cStart = parseFloat(row[colMap.cStart]) || 0;
                const cEnd = parseFloat(row[colMap.cEnd]) || 0;
                const reel = parseFloat(row[colMap.reel]) || (cEnd - cStart);
                let formula = String(row[colMap.detail] || '').trim();
                const obs = String(row[colMap.obs] || '').trim();

                // إذا كانت المعادلة فارغة، نضع القالب القياسي للمركبة تلقائياً
                if (!formula && standardFormulas[mobile]) {
                    formula = standardFormulas[mobile];
                }

                const calc = evaluateFormulaStats(formula, reel);

                auditedRows.push({
                    sheet: sheetName,
                    op: row[colMap.op] || '',
                    poste: row[colMap.poste] || '',
                    date: formatExcelDate(row[colMap.date]),
                    marque: row[colMap.marque] || '',
                    mobile: mobile,
                    matricule: row[colMap.matricule] || '',
                    cStart: cStart,
                    cEnd: cEnd,
                    reel: reel,
                    formula: formula,
                    theorique: calc.theorique,
                    ecart: calc.ecart,
                    kmComp: calc.kmComp,
                    obs: obs
                });
            }
        }
    }
}

function formatExcelDate(val) {
    if (typeof val === 'number') {
        const d = new Date((val - 25569) * 86400 * 1000);
        return d.toISOString().split('T').at(0);
    }
    return String(val || '').trim();
}

// حساب المسافة النظرية والفارق و KM à Comptabiliser بدقة من المعادلة
function evaluateFormulaStats(formula, reel) {
    let theorique = 0;
    try {
        // تنظيف المعادلة وحسابها بأمان (تدعم الجمع والضرب والأقواس)
        const safeExpr = formula.replace(/[^0-9+\-*/().]/g, '');
        if (safeExpr) {
            theorique = Math.round(Function('"use strict";return (' + safeExpr + ')')());
        }
    } catch (e) {
        theorique = 0;
    }
    const ecart = theorique - reel;
    const kmComp = Math.min(reel, theorique);
    return { theorique: theorique, ecart: ecart, kmComp: kmComp };
}

function filterExcelRows(filterType, btnEl) {
    currentFilter = filterType;
    document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    renderExcelTable();
}

function renderExcelTable() {
    const tbody = document.getElementById('excel-table-body');
    tbody.innerHTML = '';

    let totalReel = 0, totalTheo = 0, totalComp = 0, visibleCount = 0;

    auditedRows.forEach(function(item, index) {
        const isAnomaly = Math.abs(item.ecart) > 4 || item.obs.length > 0;
        
        if (currentFilter === 'ANOMALY' && !isAnomaly) return;
        if (currentFilter !== 'ALL' && currentFilter !== 'ANOMALY' && item.mobile !== currentFilter) return;

        visibleCount++;
        totalReel += item.reel;
        totalTheo += item.theorique;
        totalComp += item.kmComp;

        const tr = document.createElement('tr');
        if (Math.abs(item.ecart) > 5) tr.className = 'row-danger';
        else if (Math.abs(item.ecart) > 2 || item.obs) tr.className = 'row-warning';
        else tr.className = 'row-ok';

        tr.innerHTML = 
            '<td>' + item.date + '</td>' +
            '<td>' + item.poste + '</td>' +
            '<td><b>' + item.mobile + '</b></td>' +
            '<td>' + item.reel + '</td>' +
            '<td><b>' + item.theorique + '</b></td>' +
            '<td style="color:' + (item.ecart < -4 ? '#c53030' : '#2d3748') + '; font-weight:bold;">' + item.ecart + '</td>' +
            '<td style="color:#2b6cb0; font-weight:bold;">' + item.kmComp + '</td>' +
            '<td><input type="text" class="formula-input" value="' + item.formula + '" onchange="updateRowFormula(' + index + ', this.value)" /></td>' +
            '<td style="text-align:right; max-width:200px;">' + item.obs + '</td>' +
            '<td><button class="mini-icon-btn" style="background:#3182ce;" onclick="drawFormulaOnMap(' + index + ', this)">🗺️</button></td>';

        tbody.appendChild(tr);
    });

    document.getElementById('excel-summary-bar').innerHTML = 
        '<span>عدد السجلات المعروضة: ' + visibleCount + '</span>' +
        '<span>Réel: ' + totalReel + ' km | Théorique: ' + totalTheo + ' km | <b style="color:#2f855a;">KM à Comptabiliser: ' + totalComp + ' km</b></span>';
}

// تحديث المعادلة يدوياً في الجدول وإعادة الحساب ورسمها فوراً
function updateRowFormula(index, newFormula) {
    const item = auditedRows[index];
    item.formula = newFormula.trim();
    const calc = evaluateFormulaStats(item.formula, item.reel);
    item.theorique = calc.theorique;
    item.ecart = calc.ecart;
    item.kmComp = calc.kmComp;
    renderExcelTable();
    drawFormulaOnMap(index);
}

// تفكيك معادلة Détail de calcul ورسم مقاطعها على الخريطة (مثل 232-198+2)
function drawFormulaOnMap(index, btnEl) {
    if (!excelRouteLayer) excelRouteLayer = L.layerGroup().addTo(map);
    excelRouteLayer.clearLayers();

    document.querySelectorAll('#excel-table-body tr').forEach(r => r.classList.remove('row-selected'));
    if (btnEl) btnEl.closest('tr').classList.add('row-selected');

    const item = auditedRows[index];
    
    // جلب جميع مقاطع الطريق السيار A3 (سواء من 0-198 أو من 199-282)
    const highwaySections = Object.values(loadedLines).filter(r => r.info.hasReverse && !r.info.isReverse && r.info.name === 'A3');
    if (highwaySections.length === 0) return;

    const regex = /\((\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/g;
    let match;
    let drawnAny = false;
    let drawnBounds = L.latLngBounds([]);

    while ((match = regex.exec(item.formula)) !== null) {
        const pkA = parseFloat(match.at(1));
        const pkB = parseFloat(match.at(2));
        const minPK = Math.min(pkA, pkB);
        const maxPK = Math.max(pkA, pkB);

        // البحث عن المقطع المناسب الذي يغطي هذه النقاط الكيلومترية
        highwaySections.forEach(function(section) {
            const axisStart = section.info.startPK;
            const axisLen = turf.length(section.line, { units: 'kilometers' });
            const axisEnd = axisStart + axisLen;

            if (maxPK >= axisStart && minPK <= axisEnd) {
                const clampedStart = Math.max(axisStart, minPK) - axisStart;
                const clampedEnd = Math.min(axisEnd, maxPK) - axisStart;

                if (clampedEnd > clampedStart) {
                    const sliced = turf.lineSliceAlong(section.line, clampedStart, clampedEnd, { units: 'kilometers' });
                    const latLngs = sliced.geometry.coordinates.map(pt => [pt.at(1), pt.at(0)]);
                    
                    const poly = L.polyline(latLngs, { color: '#d97706', weight: 8, opacity: 0.85 }).addTo(excelRouteLayer);
                    drawnBounds.extend(poly.getBounds());
                    
                    L.circleMarker(latLngs.at(0), { radius: 6, color: '#000', fillColor: '#10b981', fillOpacity: 1 })
                     .addTo(excelRouteLayer).bindTooltip('PK ' + minPK, { permanent: true });
                    L.circleMarker(latLngs.at(-1), { radius: 6, color: '#000', fillColor: '#ef4444', fillOpacity: 1 })
                     .addTo(excelRouteLayer).bindTooltip('1/2 Tour PK ' + maxPK, { permanent: true });
                    
                    drawnAny = true;
                }
            }
        });
    }

    if (drawnAny && drawnBounds.isValid()) {
        map.fitBounds(drawnBounds, { padding: [50, 50] });
    } else {
        alert("نقاط PK في هذه المعادلة (" + item.formula + ") خارج نطاق المقاطع المرسومة حالياً.");
    }
}



// تصدير الجدول المدقق إلى ملف Excel جاهز
function exportAuditedExcel() {
if (auditedRows.length === 0) return alert("لا توجد بيانات لتصديرها");
const exportData = auditedRows.map(r => ({
'Opérateur': r.op,
'Poste': r.poste,
'Date': r.date,
'Marque': r.marque,
'Mobile': r.mobile,
'Matricule': r.matricule,
'Compteur Départ': r.cStart,
'Compteur Fin': r.cEnd,
'Parcouru Réel': r.reel,
'Parcouru Théorique': r.theorique,
'Ecart': r.ecart,
'KM à Comptabiliser': r.kmComp,
'Détail de calcul': r.formula,
'Observations': r.obs
}));
const ws = XLSX.utils.json_to_sheet(exportData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "DETAIL_CALCUL_VERIFIE");
XLSX.writeFile(wb, "Detail_Calcul_Verifie.xlsx");
}

// تفعيل العمل بدون إنترنت (Offline Mode) - يوضع في آخر سطر في الملف
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js').catch(function() {});
    });
}


// بدلاً من حساب logoLat و logoLon يدوياً، أضف هذا الزر السريع في قائمة الأدوات ليقوم بتحميل ملف stations.js جاهزاً بجميع المحطات والشعارات التي أضفتها على الخريطة

function downloadStationsFile() {
    const content = "const defaultStations = " + JSON.stringify(savedStations, null, 4) + ";\n";
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "defaultStations.txt";
    link.click();
}
