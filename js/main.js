            var dmsLat = 64.0784
var dmsLon = -16.2306
var ddmLat = 64.0784
var ddmLon = -16.2306
var ddLat = 64.0784
var ddLon = -16.2306
var map = {}
var markers = { dms: {}, ddm: {}, dd: {} }
var NS = { "-1": "S", "1":"N" }
var EW = { "-1": "W", "1":"E" }

var parser = {
    splitDStoDMS: function(ds) {
        return [ ds.substring(0,2), ds.substring(2,4), ds.substring(4,7) / 10 ]
    },
    splitDStoDDM: function(ds) {
        return [ ds.substring(0,2), ds.substring(2,7) / 1000 ]
    },
    splitDStoDD: function(ds) {
        return ds.substring(0,7) / 100000
    },
    dsdms: function(ds) {
        return this.parsedms(ds.substring(0,2), ds.substring(2,4), ds.substring(4,7) / 10)
    },
    dsddm: function(ds) {
        return this.parseddm(ds.substring(0,2), ds.substring(2,7) / 1000)
    },
    dsdd: function(ds) {
        return ds.substring(0,7) / 100000
    },
    parsedms: function(d,m,s) {
        return d * 1 + m / 60 + s / 3600
    },
    parseddm: function(d, m) {
        return d * 1 + m / 60
    },
    parsedd: function(d) {
        return d * 1.0
    },
    makedms: function(d) {
        var sg = Math.sign(d)

        var ad = Math.abs(d)

        var dd = Math.trunc(ad)
        var mm = Math.trunc((ad-dd)*60)
        var ss = Math.round(((ad - dd) * 60 - mm) * 600) / 10

        return( [sg, dd, mm, ss ] )
    },
    makeddm: function(d) {
        var sg = Math.sign(d)

        var ad = Math.abs(d)

        var dd = Math.trunc(ad)
        var mm = Math.round( (ad-dd)*60 * 1000) / 1000

        return( [sg, dd, mm ] )
    },
    makedd: function(d) {
        var sg = Math.sign(d)
    
        var ad = Math.abs(d)
    
        var dd = Math.round(ad*100000)/100000
    
        return( [sg, dd] )
    },
    makeDMSString: function(dl, nsew) {
        var d = this.makedms(dl)
        return nsew[d[0]]+" "+d[1]+"°"+d[2]+"'"+d[3]+"\""
    },
    makeDDMString: function(dl, nsew) {
        var d = this.makeddm(dl)
        return nsew[d[0]]+" "+d[1]+"°"+d[2]+"'"
    },
    makeDDString: function(dl, nsew) {
        var d = this.makedd(dl)
        return nsew[d[0]]+" "+d[1]+"°"
    }
}
var updater = {
    center: false,
    pad: function(n) {
        if (n < 10) { return "0" + (1.0*n).toString() }
        return n.toString()
    },
    recenter: function() {
        if( this.center ) {
            var llb = L.latLngBounds([dmsLat, dmsLon], [ddmLat, ddmLon] )
            llb.extend( [ddLat, ddLon] )
            map.fitBounds(llb)
        }
    },
    all: function() {
        this.ds()
        this.updateMisMarkers()
        this.recenter()
        updateExportMarkersLink()
    },
    updateConversions: function() {
        /* convert dms to ddm & dd */
        dmsLat = $("#dms-a").val() * parser.parsedms( $("#dms-a-dd").val(), $("#dms-a-mm").val(), $("#dms-a-ss").val() )
        dmsLon = $("#dms-o").val() * parser.parsedms( $("#dms-o-dd").val(), $("#dms-o-mm").val(), $("#dms-o-ss").val() )
        console.log("->", dmsLat, dmsLon)
        var lats = parser.makeddm(dmsLat)
        var lons = parser.makeddm(dmsLon)
        console.log("->", lats, lons)
        $("#dms-to-ddm span.value").html(parser.makeDDMString(dmsLat, NS)+" "+parser.makeDDMString(dmsLon, EW))
        lats = parser.makedd(dmsLat)
        lons = parser.makedd(dmsLon)
        console.log("->", lats, lons)
        $("#dms-to-dd span.value").html(parser.makeDDString(dmsLat, NS)+" "+parser.makeDDString(dmsLon, EW))
        
        what3words.api.convertTo3wa({lat:dmsLat, lng:dmsLon}, 'en')
          .then(function(response) {
            $("#dms-to-w3w span.value").html('<a href="'+response.map+'">'+response.words+"</a>")
          })
        
        ddmLat = $("#ddm-a").val() * parser.parseddm( $("#ddm-a-dd").val(), $("#ddm-a-mm").val() )
        ddmLon = $("#ddm-o").val() * parser.parseddm( $("#ddm-o-dd").val(), $("#ddm-o-mm").val() )
        console.log("->", ddmLat, ddmLon)
        $("#ddm-to-dms span.value").html(parser.makeDMSString(ddmLat, NS)+" "+parser.makeDMSString(ddmLon, EW))
        lats = parser.makedd(ddmLat)
        lons = parser.makedd(ddmLon)
        console.log("->", lats, lons)
        $("#ddm-to-dd span.value").html(parser.makeDDString(ddmLat, NS)+" "+parser.makeDDString(ddmLon, EW))

        what3words.api.convertTo3wa({lat:ddmLat, lng:ddmLon}, 'en')
          .then(function(response) {
            $("#ddm-to-w3w span.value").html('<a href="'+response.map+'">'+response.words+"</a>")
          })
        
        ddLat = $("#dd-a").val() * parser.parsedd( $("#dd-a-dd").val() )
        ddLon = $("#dd-o").val() * parser.parsedd( $("#dd-o-dd").val() )
        console.log("->", ddLat, ddLon)
        lats = parser.makedms(ddLat)
        lons = parser.makedms(ddLon)
        console.log("->", lats, lons)
        $("#dd-to-dms span.value").html(parser.makeDMSString(ddLat, NS)+" "+parser.makeDMSString(ddLon, EW))
        lats = parser.makeddm(ddLat)
        lons = parser.makeddm(ddLon)
        console.log("->", lats, lons)
        $("#dd-to-ddm span.value").html(NS[lats[0]]+" "+lats[1]+"°"+lats[2]+"'"+" "+EW[lons[0]]+" "+lons[1]+"°"+lons[2]+"'")

        what3words.api.convertTo3wa({lat:ddLat, lng:ddLon}, 'en')
          .then(function(response) {
            $("#dd-to-w3w span.value").html('<a href="'+response.map+'">'+response.words+"</a>")
          })
        
        this.updateMisMarkers()
    },
    updateMisMarkers: function() {
        if ( markers.dms.setLatLng ) {
            markers.dms.setLatLng([dmsLat, dmsLon])
            markers.ddm.setLatLng([ddmLat, ddmLon])
            markers.dd.setLatLng([ddLat, ddLon])
            
            markers.dms.setTooltipContent("<span class='tt dms'>DMS</span> "+parser.makeDMSString(dmsLat, NS)+" "+parser.makeDMSString(dmsLon, EW))
            markers.ddm.setTooltipContent("<span class='tt ddm'>DDM</span> "+parser.makeDDMString(ddmLat, NS)+" "+parser.makeDDMString(ddmLon, EW))
            markers.dd.setTooltipContent("<span class='tt dd'>DD</span> "+parser.makeDDString(ddLat, NS)+" "+parser.makeDDString(ddLon, EW))
            this.recenter()
        }
    },
    updateHash: function() {
        // history.replaceState(null, null, "") 
        var data = [
            "lat="+NS[$("#ds-a").val()]+$("#ds-a-nn").val(),
            "lon="+EW[$("#ds-o").val()]+$("#ds-o-nn").val()                       
        ]
        if ( map && map.getCenter ) {
            var mc = map.getCenter()
            data.push(
               "mlat="+mc.lat,
               "mlon="+mc.lng,
               "mz="+map.getZoom()
            )
        }
       
       window.location.hash = data.join("&")
    },
    ds: function() {
        /* update value fields based on plain digit string */
        /* N/S & E/W values */
        $("#dms-a").val($("#ds-a").val())
        $("#ddm-a").val($("#ds-a").val())
        $("#dd-a").val($("#ds-a").val())
        $("#dms-o").val($("#ds-o").val())
        $("#ddm-o").val($("#ds-o").val())
        $("#dd-o").val($("#ds-o").val())

        /* reinterpret latitude digit stream as DMS, DDM, and DD */
        var ds = $("#ds-a-nn").val()
        var dms = parser.splitDStoDMS(ds+"0000000")
        var ddm = parser.splitDStoDDM(ds+"0000000")
        var dd = parser.splitDStoDD(ds+"0000000")
        
        $("#dms-a-dd").val(this.pad(dms[0]))
        $("#dms-a-mm").val(this.pad(dms[1]))
        $("#dms-a-ss").val(this.pad(dms[2]))
        
        $("#ddm-a-dd").val(this.pad(ddm[0]))
        $("#ddm-a-mm").val(this.pad(ddm[1]))

        $("#dd-a-dd").val(this.pad(dd))

        /* reinterpret longitude digit stream as DMS, DDM, and DD */
        ds = $("#ds-o-nn").val()
        dms = parser.splitDStoDMS(ds+"0000000")
        ddm = parser.splitDStoDDM(ds+"0000000")
        dd = parser.splitDStoDD(ds+"0000000")
        
        $("#dms-o-dd").val(this.pad(dms[0]))
        $("#dms-o-mm").val(this.pad(dms[1]))
        $("#dms-o-ss").val(this.pad(dms[2]))
        
        $("#ddm-o-dd").val(this.pad(ddm[0]))
        $("#ddm-o-mm").val(this.pad(ddm[1]))
        
        $("#dd-o-dd").val(this.pad(dd))

        this.updateConversions()
        this.updateHash()
    },
    dms: function() {
        /* make digit stream from values, then trigger update via ds */
        $("#ds-a").val($("#dms-a").val())
        $("#ds-o").val($("#dms-o").val())

        var dsLat = this.pad($("#dms-a-dd").val())+this.pad($("#dms-a-mm").val())+this.pad($("#dms-a-ss").val())+"0000"
        var dsLon = this.pad($("#dms-o-dd").val())+this.pad($("#dms-o-mm").val())+this.pad($("#dms-o-ss").val())+"0000"
        dsLat = dsLat.replace(/[,.]/g,"").substr(0,7)
        dsLon = dsLon.replace(/[,.]/g,"").substr(0,7)
        $("#ds-a-nn").val(dsLat)
        $("#ds-o-nn").val(dsLon)

        this.ds()

    },
    ddm: function() {
        /* make digit stream from values, then trigger update via ds */
        $("#ds-a").val($("#ddm-a").val())
        $("#ds-o").val($("#ddm-o").val())

        var dsLat = this.pad($("#ddm-a-dd").val())+this.pad($("#ddm-a-mm").val())+"0000"
        var dsLon = this.pad($("#ddm-o-dd").val())+this.pad($("#ddm-o-mm").val())+"0000"
        dsLat = dsLat.replace(/[,.]/g,"").substr(0,7)
        dsLon = dsLon.replace(/[,.]/g,"").substr(0,7)
        $("#ds-a-nn").val(dsLat)
        $("#ds-o-nn").val(dsLon)
        
        this.ds()
        
        
    },
    dd: function() {
        /* make digit stream from values, then trigger update via ds */
        $("#ds-a").val($("#dd-a").val())
        $("#ds-o").val($("#dd-o").val())
        
        var dsLat = this.pad($("#dd-a-dd").val())+"0000"
        var dsLon = this.pad($("#dd-o-dd").val())+"0000"
        dsLat = dsLat.replace(/[,.]/g,"").substr(0,7)
        dsLon = dsLon.replace(/[,.]/g,"").substr(0,7)
        $("#ds-a-nn").val(dsLat)
        $("#ds-o-nn").val(dsLon)
        
        this.ds()
    }
}

function makeWpt(marker, name, desc, sym) {
    var latLng = marker.getLatLng()
    var wpt = '<wpt lat="'+latLng.lat+'" lon="'+latLng.lng+'">'
    if ( name ) { wpt = wpt + '<name>'+name+'</name>' }
    if ( desc ) { wpt = wpt + '<desc>'+desc+'</desc>' }
    if ( sym  ) { wpt = wpt + '<sym>' +sym+ '</sym>' }
    wpt = wpt + '</wpt>'
    return wpt
}

function updateExportMarkersLink() {
    var xml='<?xml version="1.0" encoding="UTF-8"?>'
    xml = xml +'<gpx version="1.1" creator="https://tools.stepman.is/gps" '
    xml = xml + ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
    xml = xml + ' xmlns="http://www.topografix.com/GPX/1/1"'
    xml = xml + ' xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">'
    xml = xml + makeWpt( markers.dms, "DMS", "Position was given in DMS" )
    xml = xml + makeWpt( markers.ddm, "DDM", "Position was given in DDM" )
    xml = xml + makeWpt( markers.dd, "DD", "Position was given in DD" )
    xml = xml + '</gpx>'
    
    $("#gpx-export").attr("href", 'data:text/xml;charset=utf-8,' + encodeURIComponent(xml))
}

function bootstrap(position, mapPos) {
    if( position ) {
        ddLat = position.coords.latitude
        ddLon = position.coords.longitude
        
        var dsLat = ddLat.toString()+",000000"
        var dsLon = ddLon.toString()+",000000"
        dsLat = dsLat.replace(/[,.]/g,"").substr(0,7)
        dsLon = dsLon.replace(/[,.]/g,"").substr(0,7)
        $("#ds-a").val(Math.sign(ddLat))
        $("#ds-o").val(Math.sign(ddLon))
        $("#ds-a-nn").val(Math.abs(dsLat))
        $("#ds-o-nn").val(Math.abs(dsLon))
        
        updater.ds()
    }
    // see if we have map params
    
    if ( !mapPos ) {
        mapPos = { "pos": [ ddLat, ddLon ], "zoom": 13 }
    }
    map = L.map('map').setView(mapPos.pos, mapPos.zoom)
    
    map.on("zoomend", updater.updateHash)
    map.on("moveend", updater.updateHash)

    /*
    var nexrad = L.tileLayer.wms("https://gis.lmi.is/geoserver/wms", {
        layers: 'IS_50V:haedarlinur',
        format: 'image/png',
        transparent: true,
        styles: 'IS_50V:LMI IS 50V haedarlinur',
        attribution: '&copy; <a href="http://www.lmi.is">Landmælingar Íslands</a>'
    })
    nexrad.addTo(map)
    */
    var lmi = L.tileLayer('https://maps.stepman.is/cache/wmts/LMI_DEM/webmercator/{z}/{x}/{y}.jpeg', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.lmi.is">Landmælingar Íslands</a>'
    })
    var otm = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org/">SRTM</a>; <a href="http://www.opentopomap.org/">OpenTopoMap</a>'
    })
    otm.addTo(map)
    L.control.layers({"LMÍ Topo": lmi, "OpenTopoMap": otm}).addTo(map)
    L.control.scale().addTo(map)
    var icon = L.icon({ 
        iconUrl: "media/Marker-Icon-Red.png",
        iconRetinaUrl: "media/Marker-Icon-Red-2x.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
     })
    markers.dms = L.marker( [0,0], { title: "dd°mm'ss.s\""})
    markers.ddm  = L.marker( [0,0], { title: "dd°mm.mmmm'"})
    markers.dd = L.marker( [0,0], { title: "dd.ddddd°"})
    
    markers.dms.addTo(map)
    markers.ddm.addTo(map)
    markers.dd.addTo(map)
    
    markers.dms.bindTooltip("Numbers are DMS", { permanent: true }).openTooltip()
    markers.ddm.bindTooltip("Numbers are DDM", { permanent: true }).openTooltip()
    markers.dd.bindTooltip("Numbers are DD", { permanent: true }).openTooltip()
    updater.all()
}
// see if we have lon, lat in hash
const parsedHash = new URLSearchParams(
  window.location.hash.substring(1) // any_hash_key=any_value
);

var haveHash = false
var mapPos = undefined
if (parsedHash.get("mlat") && parsedHash.get("mlon") && parsedHash.get("mz")) {
    mapPos = { pos: [ parsedHash.get("mlat"), parsedHash.get("mlon")], zoom: parsedHash.get("mz") }
}
if (parsedHash.get("lat") && parsedHash.get("lon")) {
    
    var parseRegex = function(m) {
        if ( !m ) { return undefined }
        var q = m[1]
        var deg = m[2]
        
        if(!q) {
            q = m[3]
            deg = m[4]
        }
        
        if ((q == "N" )|| (q == "E")) {
            q = 1;
        } else {
            q = -1;
        }
        
        return [ q, deg ]
    }
    // lat, lon are 6-7 digit numbers either prefixed or postfixed with NSEW
    const regex = /(?:([NSEW])(\d\d\d\d\d\d\d?))|(?:(\d\d\d\d\d\d\d?)([NSEW]))/
    var reLat = parseRegex( regex.exec(parsedHash.get("lat")) )
    var reLon = parseRegex( regex.exec(parsedHash.get("lon")) )
    if ( reLat && reLon ) {
        haveHash = true
        console.log(reLat, reLon )
        
        var dsLat = reLat[1].toString()+",000000"
        var dsLon = reLon[1].toString()+",000000"
        dsLat = dsLat.replace(/[,.]/g,"").substr(0,7)
        dsLon = dsLon.replace(/[,.]/g,"").substr(0,7)
        $("#ds-a").val(Math.sign(reLat[0]))
        $("#ds-o").val(Math.sign(reLon[0]))
        $("#ds-a-nn").val(Math.abs(dsLat))
        $("#ds-o-nn").val(Math.abs(dsLon))
        
        updater.ds()
    }
}
if (!haveHash && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(bootstrap, mapPos)
} else {
    bootstrap(undefined, mapPos)
}
$("#coords-calculator select, #coords-calculator input").change( function() {
    if( this.id == "center") {
        updater.center = this.checked
        updater.all()
    } else {
        var mode = this.parentNode.parentNode.id
        updater[mode]()
    }
})