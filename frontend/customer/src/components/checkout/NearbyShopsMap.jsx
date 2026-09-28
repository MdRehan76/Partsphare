import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import './NearbyShopsMap.css';

// Google Maps API Key provided for PartNexa
const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  (typeof window !== 'undefined' ? window.__PARTNEXA_GMAP_KEY__ : '') ||
  '';

// Known default city coordinates
const CITY_COORDINATES = {
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  'New Delhi': { lat: 28.6139, lng: 77.2090 },
  Delhi: { lat: 28.6139, lng: 77.2090 },
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
};

/**
 * Calculates Haversine distance in km between two geo-points.
 */
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 4.5;
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDist = R * c;
  // Apply urban road circuity factor (~1.25x)
  return Math.round(Math.max(0.8, rawDist * 1.25) * 10) / 10;
}

/**
 * Singleton Google Maps JavaScript SDK Loader
 */
let googleMapsPromise = null;
const loadGoogleMapsSDK = (apiKey) => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window unavailable'));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-js-sdk');
    if (existing) {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        existing.addEventListener('load', () => resolve(window.google.maps));
        existing.addEventListener('error', (e) => reject(e));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    window.gm_authFailure = () => {
      console.warn('[GoogleMaps] Authentication failed. Falling back to Leaflet layer.');
      reject(new Error('Google Maps authentication failure'));
    };

    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('google.maps object unavailable'));
      }
    };

    script.onerror = (err) => {
      reject(err);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

export const NearbyShopsMap = ({
  selectedShopId,
  onSelectShop,
  customerAddress,
  onLocationChange,
  onContinueToReview,
}) => {
  // 1. Location state
  const [customerCoords, setCustomerCoords] = useState(() => {
    if (customerAddress?.city && CITY_COORDINATES[customerAddress.city]) {
      return {
        ...CITY_COORDINATES[customerAddress.city],
        city: customerAddress.city,
        isDetected: false,
      };
    }
    return { lat: 12.9716, lng: 77.5946, city: 'Bengaluru', isDetected: false };
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCityInput, setManualCityInput] = useState(customerAddress?.city || 'Bengaluru');

  // 2. Search & filtering state
  const [radiusKm, setRadiusKm] = useState(5);
  const [autoExpanded, setAutoExpanded] = useState(false);
  const [sortBy, setSortBy] = useState('NEAREST');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');

  // 3. Shops data state
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);

  // 4. Map Engine state: 'google' | 'leaflet'
  const [mapEngine, setMapEngine] = useState('google');

  // Google Maps Refs
  const googleMapContainerRef = useRef(null);
  const googleMapInstanceRef = useRef(null);
  const googleMarkersRef = useRef([]);
  const googleRadiusCircleRef = useRef(null);
  const googleInfoWindowRef = useRef(null);

  // Leaflet Maps Refs
  const leafletMapContainerRef = useRef(null);
  const leafletMapInstanceRef = useRef(null);
  const leafletMarkersLayerRef = useRef(null);

  // Try loading Google Maps on mount; fallback to Leaflet on error
  useEffect(() => {
    let isCancelled = false;

    loadGoogleMapsSDK(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (!isCancelled) {
          setMapEngine('google');
        }
      })
      .catch((err) => {
        console.warn('[NearbyShopsMap] Google Maps SDK init notice (using Leaflet fallback):', err?.message);
        if (!isCancelled) {
          setMapEngine('leaflet');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Fetch shops from backend API
  useEffect(() => {
    let isMounted = true;
    setLoadingShops(true);

    api
      .get('/shops')
      .then((res) => {
        if (!isMounted) return;
        const rawShops = res.data?.data || [];
        setShops(rawShops);
      })
      .catch((err) => {
        console.error('Failed to load shops from API:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingShops(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Request browser geolocation
  const detectBrowserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }

    setIsLocating(true);
    setLocationDenied(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isDetected: true,
        };
        setCustomerCoords(coords);
        setIsLocating(false);
        if (onLocationChange) onLocationChange(coords);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setIsLocating(false);
        setLocationDenied(true);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, [onLocationChange]);

  // Detect location on mount
  useEffect(() => {
    detectBrowserLocation();
  }, [detectBrowserLocation]);

  // Handle manual city selection
  const handleSelectCity = (cityName) => {
    const coords = CITY_COORDINATES[cityName] || { lat: 12.9716, lng: 77.5946 };
    const updated = { ...coords, city: cityName, isDetected: false };
    setCustomerCoords(updated);
    setManualCityInput(cityName);
    setShowManualInput(false);
    setLocationDenied(false);
    if (onLocationChange) onLocationChange(updated);
  };

  // Annotate shops with computed distance and estimated duration
  const annotatedShops = useMemo(() => {
    return shops.map((shop) => {
      const lat = shop.latitude != null ? Number(shop.latitude) : customerCoords.lat + 0.02;
      const lng = shop.longitude != null ? Number(shop.longitude) : customerCoords.lng + 0.02;
      const dist = calculateHaversineKm(customerCoords.lat, customerCoords.lng, lat, lng);
      const durationMins = Math.round(dist * 3.5 + 8);

      return {
        ...shop,
        computedLat: lat,
        computedLng: lng,
        distanceKm: dist,
        durationMinutes: durationMins,
        installationFee: shop.installationFee || 250,
        rating: Number(shop.rating) || 4.8,
        totalRatings: Number(shop.totalRatings) || 28,
        servicesOffered: shop.servicesOffered || [
          'Spare Parts Installation',
          'Brakes & Suspension',
          'Diagnostics',
          'Inspection',
        ],
        vehicleCategories: shop.vehicleCategories || ['Car', 'Bike', 'Scooter'],
      };
    });
  }, [shops, customerCoords]);

  // Filter and auto-expand radius
  const filteredShops = useMemo(() => {
    let result = annotatedShops;

    // Filter by vehicle
    if (vehicleFilter !== 'ALL') {
      result = result.filter((s) =>
        s.vehicleCategories?.some((v) => v.toUpperCase() === vehicleFilter)
      );
    }

    // Check if any shop matches within current radius
    let inRadius = result.filter((s) => s.distanceKm <= radiusKm);

    // Auto-expansion if none found in initial 5km
    if (inRadius.length === 0 && radiusKm === 5) {
      const within10 = result.filter((s) => s.distanceKm <= 10);
      if (within10.length > 0) {
        setAutoExpanded(true);
        setRadiusKm(10);
        inRadius = within10;
      } else {
        const within15 = result.filter((s) => s.distanceKm <= 15);
        if (within15.length > 0) {
          setAutoExpanded(true);
          setRadiusKm(15);
          inRadius = within15;
        } else {
          // If still none, show all available shops
          inRadius = result;
        }
      }
    } else {
      if (inRadius.length > 0 && autoExpanded) {
        setAutoExpanded(false);
      }
    }

    // Apply Sorting
    const sorted = [...(inRadius.length > 0 ? inRadius : result)];
    if (sortBy === 'NEAREST') {
      sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'RATING') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'FEE') {
      sorted.sort((a, b) => a.installationFee - b.installationFee);
    }

    return sorted;
  }, [annotatedShops, vehicleFilter, radiusKm, autoExpanded, sortBy]);

  // Auto-select nearest shop if none selected
  useEffect(() => {
    if (!selectedShopId && filteredShops.length > 0) {
      onSelectShop(filteredShops[0]);
    }
  }, [selectedShopId, filteredShops, onSelectShop]);

  // Currently selected shop object
  const currentSelectedShop = useMemo(() => {
    return annotatedShops.find((s) => s.id === selectedShopId) || filteredShops[0] || null;
  }, [annotatedShops, selectedShopId, filteredShops]);

  // =========================================================================
  // 1. GOOGLE MAPS ENGINE INITIALIZATION & RENDERING
  // =========================================================================
  useEffect(() => {
    if (mapEngine !== 'google' || !googleMapContainerRef.current || !window.google?.maps) return;

    if (!googleMapInstanceRef.current) {
      const gMap = new window.google.maps.Map(googleMapContainerRef.current, {
        center: { lat: customerCoords.lat, lng: customerCoords.lng },
        zoom: 13,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
      });

      googleMapInstanceRef.current = gMap;
      googleInfoWindowRef.current = new window.google.maps.InfoWindow();
    }

    const gMap = googleMapInstanceRef.current;

    // Clear previous markers
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];

    if (googleRadiusCircleRef.current) {
      googleRadiusCircleRef.current.setMap(null);
    }

    // Add User Location Pin
    const userMarker = new window.google.maps.Marker({
      position: { lat: customerCoords.lat, lng: customerCoords.lng },
      map: gMap,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#0284C7',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
      },
      zIndex: 999,
    });
    googleMarkersRef.current.push(userMarker);

    // Add Radius Circle
    const radiusCircle = new window.google.maps.Circle({
      strokeColor: '#0F766E',
      strokeOpacity: 0.6,
      strokeWeight: 1.5,
      fillColor: '#0F766E',
      fillOpacity: 0.08,
      map: gMap,
      center: { lat: customerCoords.lat, lng: customerCoords.lng },
      radius: radiusKm * 1000,
    });
    googleRadiusCircleRef.current = radiusCircle;

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: customerCoords.lat, lng: customerCoords.lng });

    filteredShops.forEach((shop) => {
      const isSelected = shop.id === selectedShopId;
      bounds.extend({ lat: shop.computedLat, lng: shop.computedLng });

      const marker = new window.google.maps.Marker({
        position: { lat: shop.computedLat, lng: shop.computedLng },
        map: gMap,
        title: shop.name,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: isSelected ? '#F59E0B' : '#0F766E',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: isSelected ? 1.6 : 1.3,
          anchor: new window.google.maps.Point(12, 22),
        },
        zIndex: isSelected ? 1000 : 100,
      });

      googleMarkersRef.current.push(marker);

      const infoHtml = `
        <div style="font-family: inherit; padding: 6px; max-width: 240px; color: #0F172A;">
          <div style="font-weight: 800; font-size: 14px; margin-bottom: 2px;">🔧 ${shop.name}</div>
          <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">★ ${shop.rating} (${shop.totalRatings || 24} reviews)</div>
          <div style="font-size: 12px; color: #64748B; margin-bottom: 6px;">📍 ${shop.distanceKm} km · ~${shop.durationMinutes} mins</div>
          <div style="font-weight: 700; color: #0F766E; margin-bottom: 8px;">₹${shop.installationFee} Fitment Fee</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <button id="gmap-select-btn-${shop.id}" style="width: 100%; background: #0F766E; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px;">
              ${isSelected ? '✓ Selected Shop' : 'Select This Shop'}
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${shop.computedLat},${shop.computedLng}" target="_blank" rel="noopener noreferrer" style="text-align: center; font-size: 11px; color: #2563EB; text-decoration: underline; font-weight: 600;">
              Directions in Google Maps ↗
            </a>
          </div>
        </div>
      `;

      marker.addListener('click', () => {
        onSelectShop(shop);
        if (googleInfoWindowRef.current) {
          googleInfoWindowRef.current.setContent(infoHtml);
          googleInfoWindowRef.current.open(gMap, marker);
        }
      });
    });

    if (filteredShops.length > 0) {
      gMap.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    } else {
      gMap.setCenter({ lat: customerCoords.lat, lng: customerCoords.lng });
      gMap.setZoom(13);
    }
  }, [mapEngine, customerCoords, filteredShops, selectedShopId, radiusKm, onSelectShop]);

  // =========================================================================
  // 2. LEAFLET FALLBACK ENGINE INITIALIZATION & RENDERING
  // =========================================================================
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !leafletMapContainerRef.current) return;

    if (!leafletMapInstanceRef.current) {
      const map = L.map(leafletMapContainerRef.current, {
        center: [customerCoords.lat, customerCoords.lng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      leafletMapInstanceRef.current = map;
      leafletMarkersLayerRef.current = markersGroup;
    }

    const map = leafletMapInstanceRef.current;
    const markersGroup = leafletMarkersLayerRef.current;
    markersGroup.clearLayers();

    // User Location Marker
    const userMarkerIcon = L.divIcon({
      className: 'user-marker-wrapper',
      html: '<div class="user-marker-pulse" title="Your Fitment Location"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const userMarker = L.marker([customerCoords.lat, customerCoords.lng], {
      icon: userMarkerIcon,
      zIndexOffset: 500,
    }).addTo(markersGroup);

    userMarker.bindPopup(`
      <div class="map-popup-card">
        <h4 class="map-popup-title">📍 Your Location</h4>
        <div class="map-popup-meta">${customerCoords.city || 'Detected Position'}</div>
      </div>
    `);

    // Shop Markers
    const bounds = L.latLngBounds([[customerCoords.lat, customerCoords.lng]]);

    filteredShops.forEach((shop) => {
      const isSelected = shop.id === selectedShopId;
      bounds.extend([shop.computedLat, shop.computedLng]);

      const shopIcon = L.divIcon({
        className: 'shop-marker-wrapper',
        html: `
          <div class="shop-map-pin ${isSelected ? 'selected' : ''}">
            <span>🔧</span>
          </div>
        `,
        iconSize: isSelected ? [44, 44] : [38, 38],
        iconAnchor: isSelected ? [22, 44] : [19, 38],
      });

      const marker = L.marker([shop.computedLat, shop.computedLng], {
        icon: shopIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      }).addTo(markersGroup);

      marker.bindPopup(`
        <div class="map-popup-card">
          <h4 class="map-popup-title">${shop.name}</h4>
          <div class="map-popup-meta">★ ${shop.rating} (${shop.totalRatings || 24} reviews)</div>
          <div class="map-popup-meta">📍 ${shop.distanceKm} km away · ~${shop.durationMinutes} mins</div>
          <div class="map-popup-price">₹${shop.installationFee} Installation</div>
          <button class="btn-popup-select" id="popup-select-${shop.id}">
            ${isSelected ? '✓ Selected' : 'Select This Shop'}
          </button>
        </div>
      `);

      marker.on('click', () => {
        onSelectShop(shop);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-select-${shop.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectShop(shop);
            map.closePopup();
          };
        }
      });
    });

    if (filteredShops.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView([customerCoords.lat, customerCoords.lng], 13);
    }
  }, [mapEngine, customerCoords, filteredShops, selectedShopId, onSelectShop]);

  // Center on selected shop when clicked in list
  const handleSelectAndCenter = (shop) => {
    onSelectShop(shop);
    if (mapEngine === 'google' && googleMapInstanceRef.current && shop.computedLat && shop.computedLng) {
      googleMapInstanceRef.current.panTo({ lat: shop.computedLat, lng: shop.computedLng });
      googleMapInstanceRef.current.setZoom(14);
    } else if (mapEngine === 'leaflet' && leafletMapInstanceRef.current && shop.computedLat && shop.computedLng) {
      leafletMapInstanceRef.current.setView([shop.computedLat, shop.computedLng], 14, {
        animate: true,
      });
    }
  };

  return (
    <div className="nearby-shops-map-container" id="nearby-shops-map-section">
      {/* 1. Location Detection Bar */}
      <div className="location-detection-bar">
        <div className="location-status-group">
          <div className="location-icon-badge">📍</div>
          <div className="location-status-text">
            <span className="location-title">
              {customerCoords.isDetected
                ? 'Device GPS Location Active'
                : `Service City: ${customerCoords.city || 'Bengaluru'}`}
            </span>
            <span className="location-subtitle">
              {locationDenied
                ? 'Location permission denied. Showing shops in your delivery city.'
                : 'Showing verified automotive workshops near your address.'}
            </span>
          </div>
        </div>

        <div className="location-action-buttons">
          <button
            type="button"
            className="btn-location"
            onClick={detectBrowserLocation}
            disabled={isLocating}
            id="use-my-location-btn"
          >
            {isLocating ? '⏳ Detecting...' : '📍 Use My Location'}
          </button>

          <button
            type="button"
            className="btn-location"
            onClick={() => setShowManualInput((prev) => !prev)}
            id="enter-location-manually-btn"
          >
            ✏️ {showManualInput ? 'Close' : 'Change City'}
          </button>
        </div>
      </div>

      {/* Manual Location Selection Panel (if toggled or permission denied) */}
      {(showManualInput || locationDenied) && (
        <div className="manual-location-panel" id="manual-location-picker">
          <div className="manual-cities-label">Select Your Service City:</div>
          <div className="city-chips-row">
            {Object.keys(CITY_COORDINATES).map((city) => (
              <button
                key={city}
                type="button"
                className={`city-chip ${customerCoords.city === city ? 'active' : ''}`}
                onClick={() => handleSelectCity(city)}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Filters & Radius Controls */}
      <div className="map-controls-toolbar">
        {/* Radius selector */}
        <div className="filter-pill-group">
          <span className="filter-group-label">Distance:</span>
          {[5, 10, 15, 25].map((km) => (
            <button
              key={km}
              type="button"
              className={`filter-pill-btn ${radiusKm === km ? 'active' : ''}`}
              onClick={() => {
                setRadiusKm(km);
                setAutoExpanded(false);
              }}
            >
              {km} km
            </button>
          ))}
          {autoExpanded && (
            <span className="auto-expanded-badge" title="Expanded automatically to find nearby workshops">
              ⚡ Auto-expanded to {radiusKm} km
            </span>
          )}
        </div>

        {/* Vehicle filter */}
        <div className="filter-pill-group">
          <span className="filter-group-label">Vehicle:</span>
          {['ALL', 'CAR', 'BIKE', 'SCOOTER'].map((vf) => (
            <button
              key={vf}
              type="button"
              className={`filter-pill-btn ${vehicleFilter === vf ? 'active' : ''}`}
              onClick={() => setVehicleFilter(vf)}
            >
              {vf === 'ALL' ? 'All Types' : vf.charAt(0) + vf.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Sort by */}
        <div className="filter-pill-group sort-group">
          <span className="filter-group-label">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown"
            aria-label="Sort workshops by"
          >
            <option value="NEAREST">Nearest First</option>
            <option value="RATING">Highest Rated</option>
            <option value="FEE">Lowest Fitment Fee</option>
          </select>
        </div>
      </div>

      {/* 3. Main Split View: Workshop Cards + Interactive Map */}
      <div className="shops-map-split-view">
        {/* Left Column: Workshop List */}
        <div className="shops-list-column" id="nearby-shops-list">
          <div className="shops-list-header">
            <span className="shops-found-count">
              {loadingShops
                ? 'Searching workshops...'
                : `${filteredShops.length} Partner Workshops Available`}
            </span>
            <span className="shops-sub-info">Click to select installation location</span>
          </div>

          {loadingShops ? (
            <div className="shops-loading-state">
              <div className="loading-spinner-circle" />
              <span>Scanning mechanical workshops in {customerCoords.city || 'your area'}...</span>
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="shops-empty-state">
              <div className="empty-icon">🔍</div>
              <h4>No workshops found within {radiusKm} km</h4>
              <p>Try expanding the search distance to view workshops in neighboring zones.</p>
              <button
                type="button"
                className="btn-location"
                onClick={() => setRadiusKm(25)}
                style={{ marginTop: '0.75rem' }}
              >
                Search Within 25 km
              </button>
            </div>
          ) : (
            filteredShops.map((shop) => {
              const isSelected = shop.id === selectedShopId;
              return (
                <div
                  key={shop.id}
                  className={`shop-map-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectAndCenter(shop)}
                  id={`shop-card-${shop.id}`}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                >
                  <div className="shop-card-header">
                    <div className="shop-name-group">
                      <div className="shop-card-title">
                        <span>🔧</span> {shop.name}
                        {shop.isVerified && (
                          <span className="shop-verified-tag">✓ Verified Partner</span>
                        )}
                      </div>
                      <div className="shop-card-address">{shop.address}</div>
                    </div>

                    <div className="shop-metrics-col">
                      <div className="shop-distance-pill">📍 {shop.distanceKm} km</div>
                      <div className="shop-duration-tag">~{shop.durationMinutes} mins away</div>
                      <div className="shop-rating-pill">★ {shop.rating}</div>
                    </div>
                  </div>

                  {/* Services Offered */}
                  <div className="shop-services-row">
                    {shop.servicesOffered?.slice(0, 3).map((srv, idx) => (
                      <span key={idx} className="shop-service-tag">
                        {srv}
                      </span>
                    ))}
                    <span className="shop-service-tag text-teal font-semibold">
                      ✓ Hoist & Bay Reserved
                    </span>
                  </div>

                  {/* Directions link */}
                  <div style={{ marginTop: '0.4rem' }}>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${shop.computedLat},${shop.computedLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shop-gmap-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🗺️ Open in Google Maps ↗
                    </a>
                  </div>

                  {/* Footer: Fee & Select Button */}
                  <div className="shop-card-footer">
                    <div className="shop-fee-label">
                      <span className="fee-sub">Standard Installation Fee</span>
                      <span className="fee-val">₹{shop.installationFee}</span>
                    </div>

                    <button
                      type="button"
                      className="btn-select-shop"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAndCenter(shop);
                      }}
                      id={`select-btn-${shop.id}`}
                    >
                      {isSelected ? '✓ Selected' : 'Select This Shop'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Interactive Map (Google Maps / Leaflet) */}
        <div className="interactive-map-column" style={{ position: 'relative' }}>
          <div className="map-engine-badge" id="map-engine-badge">
            <span>{mapEngine === 'google' ? '🗺️ Google Maps' : '📍 OpenStreetMap'}</span>
            <span style={{ color: '#10B981', fontSize: '10px' }}>● Live</span>
          </div>

          {mapEngine === 'google' ? (
            <div ref={googleMapContainerRef} className="google-map-element" id="google-shops-map" />
          ) : (
            <div ref={leafletMapContainerRef} className="leaflet-map-element" id="leaflet-shops-map" />
          )}
        </div>
      </div>

      {/* 4. Selected Shop Confirmation Panel */}
      {currentSelectedShop && (
        <div className="selected-shop-confirmation-panel" id="selected-shop-confirm-banner">
          <div className="selected-shop-left">
            <div className="selected-badge-icon">✓</div>
            <div className="selected-shop-details">
              <span className="selected-shop-header-label">Selected Mechanical Shop</span>
              <span className="selected-shop-name">{currentSelectedShop.name}</span>
              <span className="selected-shop-sub">
                📍 {currentSelectedShop.address} · 📏 {currentSelectedShop.distanceKm} km away (~
                {currentSelectedShop.durationMinutes} mins) · ⭐ {currentSelectedShop.rating}
              </span>
            </div>
          </div>

          <div className="selected-shop-right">
            <div className="selected-fee-badge">
              <span className="fee-sub">Bay & Fitting Fee</span>
              <span className="fee-val">₹{currentSelectedShop.installationFee}</span>
            </div>

            {onContinueToReview && (
              <button
                type="button"
                className="btn-proceed-review"
                onClick={onContinueToReview}
                id="continue-to-order-review-btn"
              >
                Continue to Order Review →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyShopsMap;
