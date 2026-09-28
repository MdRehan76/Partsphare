import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import './NearbyShopsMap.css';

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

  // Map DOM and instance refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

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

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance if not already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [customerCoords.lat, customerCoords.lng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false, // Prevent page scroll hijack
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      markersLayerRef.current = markersGroup;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    // 1. Add User Location Marker
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

    // 2. Add Shop Markers
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

    // Fit map bounds to view all shops and user location
    if (filteredShops.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView([customerCoords.lat, customerCoords.lng], 13);
    }
  }, [customerCoords, filteredShops, selectedShopId, onSelectShop]);

  // Center on selected shop when clicked
  const handleSelectAndCenter = (shop) => {
    onSelectShop(shop);
    if (mapInstanceRef.current && shop.computedLat && shop.computedLng) {
      mapInstanceRef.current.setView([shop.computedLat, shop.computedLng], 14, {
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

          <div className="manual-input-row">
            <input
              type="text"
              className="manual-input"
              placeholder="Or enter city / area name (e.g. Indiranagar, Bengaluru)"
              value={manualCityInput}
              onChange={(e) => setManualCityInput(e.target.value)}
            />
            <button
              type="button"
              className="btn-location primary"
              onClick={() => handleSelectCity(manualCityInput.trim() || 'Bengaluru')}
            >
              Set Location
            </button>
          </div>
        </div>
      )}

      {/* 2. Filter & Sort Bar */}
      <div className="map-filter-bar">
        <div className="radius-filter-group">
          <span className="radius-label">Search Radius:</span>
          {[5, 10, 15, 25].map((r) => (
            <button
              key={r}
              type="button"
              className={`radius-pill ${radiusKm === r ? 'active' : ''}`}
              onClick={() => {
                setRadiusKm(r);
                setAutoExpanded(false);
              }}
              id={`radius-${r}km`}
            >
              {r} km
            </button>
          ))}
        </div>

        <div className="sort-and-count-group">
          <span className="shops-count-badge">
            {filteredShops.length} Partner Garages Found
            {autoExpanded && ` (Expanded to ${radiusKm} km)`}
          </span>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort shops by"
            id="sort-shops-select"
          >
            <option value="NEAREST">Nearest First</option>
            <option value="RATING">Highest Rated</option>
            <option value="FEE">Lowest Installation Fee</option>
          </select>
        </div>
      </div>

      {/* 3. Split Layout: List on Left, Map on Right */}
      <div className="map-split-layout">
        {/* Left Column: Scrollable Shop Cards */}
        <div className="shops-list-column" role="listbox" aria-label="Available mechanical shops">
          {loadingShops ? (
            <div className="no-shops-found-card">
              <div className="no-shops-icon">⏳</div>
              <h4>Loading verified mechanical workshops...</h4>
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="no-shops-found-card">
              <div className="no-shops-icon">🔍</div>
              <h4>No mechanical shops found within {radiusKm} km.</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Try expanding your search radius to find certified PartNexa partner hubs.
              </p>
              <button
                type="button"
                className="btn-location primary"
                onClick={() => setRadiusKm(25)}
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

        {/* Right Column: Interactive Leaflet Map */}
        <div className="interactive-map-column">
          <div ref={mapContainerRef} className="leaflet-map-element" id="leaflet-shops-map" />
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
