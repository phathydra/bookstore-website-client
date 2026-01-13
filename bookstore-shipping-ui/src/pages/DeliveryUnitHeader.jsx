import React, { useState, useEffect, useRef } from 'react';
import { Button, Menu, MenuItem, Dialog, DialogContent, DialogTitle, DialogActions, CircularProgress, IconButton, Box, Typography } from '@mui/material'; // Added Box, Typography
import CloseIcon from '@mui/icons-material/Close';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// --- INLINE SVG ICONS ---
const IconMapPin = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>);

// --- ACCESS TOKEN ---
mapboxgl.accessToken = 'pk.eyJ1IjoibGV0aGFuaGh1bmcxMSIsImEiOiJjbWc1Mjc3N3kwMDVvMmpzYXFjb20zaXB1In0.459YBDaJc6CAlJ1zIqugDw'; // Replace if needed

const DeliveryUnitHeader = ({
    userId,
    anchorEl,
    handleMenuOpen,
    handleMenuClose,
    handleGoToInfo,
    handleGoToChatPage,
    handleLogout,
    // Map props
    routeToDraw,
    isRouteLoading,
    onCloseMap
}) => {
    // Map states and refs
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [routeInfo, setRouteInfo] = useState(null);
    const [mapError, setMapError] = useState(null);

    // Effect 1: Control Dialog visibility
    useEffect(() => {
        if (routeToDraw || isRouteLoading) {
            setIsMapOpen(true);
            setMapError(null);
        } else {
            setIsMapOpen(false);
        }
    }, [routeToDraw, isRouteLoading]);

    // Effect 2: Map initialization and drawing logic
    useEffect(() => {
        const cleanupMap = () => {
            if (map.current) {
                // Remove sources, layers, and controls before removing the map instance
                try {
                    if (map.current.getLayer('route-layer')) map.current.removeLayer('route-layer');
                    if (map.current.getSource('route-source')) map.current.removeSource('route-source');
                    // Remove markers manually if stored in an array/ref
                } catch (e) {
                    console.warn("Error removing map layers/sources:", e);
                }
                map.current.remove();
                map.current = null;
                console.log("Map instance removed.");
            }
        };

        if (!isMapOpen) {
            cleanupMap();
            return;
        }

        if (isRouteLoading || !routeToDraw) {
            cleanupMap(); // Clean up map if loading or no data while dialog is open
            return;
        }

        // --- Start map processing ---
        setMapError(null);
        if (map.current) cleanupMap(); // Clean up existing map before creating new

        const allRoutes = routeToDraw.routes;
        // LẤY WAYPOINTS (với tên) TỪ BACKEND
        const waypointsWithInfo = routeToDraw.waypoints;

        if (!allRoutes || allRoutes.length === 0) {
            console.error("No routes found in routeToDraw data.");
            setMapError("Dữ liệu tuyến đường không hợp lệ.");
            cleanupMap();
            return;
        }

        let combinedCoords = [];
        let totalDistance = 0;
        let totalDuration = 0;
        allRoutes.forEach(route => {
            if (route?.geometry?.coordinates) {
                combinedCoords.push(...route.geometry.coordinates);
            }
            totalDistance += route?.distance || 0;
            totalDuration += route?.duration || 0;
        });

        if (combinedCoords.length < 2) {
            console.error("Not enough coordinates for route:", combinedCoords.length);
            setMapError("Không đủ tọa độ để vẽ tuyến đường.");
            cleanupMap();
            return;
        }

        setRouteInfo({
            distance: (totalDistance / 1000).toFixed(1),
            duration: Math.round(totalDuration / 60)
        });

        // Validate startCoord and endCoord before using
        const startCoord = combinedCoords[0];
        const endCoord = combinedCoords[combinedCoords.length - 1];
        if (!Array.isArray(startCoord) || startCoord.length !== 2 || !Array.isArray(endCoord) || endCoord.length !== 2) {
             console.error("Invalid start or end coordinates derived from combinedCoords.");
             setMapError("Tọa độ điểm đầu/cuối không hợp lệ.");
             cleanupMap();
             return;
        }


        if (!mapContainer.current) {
            console.error("Map container ref is not ready.");
            setMapError("Lỗi hiển thị vùng chứa bản đồ.");
            return; // Exit if container isn't ready
        }

        try {
            if (map.current) map.current.remove(); // Ensure cleanup

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: startCoord,
                zoom: 11
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

            map.current.once('load', () => { // Use 'once'
                if (!map.current) return; // Re-check map instance
                console.log("Map loaded, adding layers...");

                // Add route source/layer safely
                // Wrap in try-catch in case map is removed unexpectedly
                try {
                    if (!map.current.getSource('route-source')) {
                        map.current.addSource('route-source', {
                            'type': 'geojson',
                            'data': { 'type': 'Feature', 'geometry': { 'type': 'LineString', 'coordinates': combinedCoords } }
                        });
                    } else {
                         map.current.getSource('route-source').setData({
                             'type': 'Feature',
                             'geometry': { 'type': 'LineString', 'coordinates': combinedCoords }
                         });
                    }
                    if (!map.current.getLayer('route-layer')) {
                        map.current.addLayer({
                            'id': 'route-layer', 'type': 'line', 'source': 'route-source',
                            'layout': { 'line-join': 'round', 'line-cap': 'round' },
                            'paint': { 'line-color': '#3b82f6', 'line-width': 6, 'line-opacity': 0.8 }
                        });
                    }

                    // === Add Markers with Names ===
                    const originName = waypointsWithInfo?.[0]?.name || "Kho Xuất Phát";
                    new mapboxgl.Marker({ color: '#10B981' })
                        .setLngLat(startCoord)
                        .setPopup(new mapboxgl.Popup({ offset: 30, closeButton: false }).setHTML(
                            `<strong style="color: #10B981;">🟢 ${originName}</strong>`
                        ))
                        .addTo(map.current);

                    const destName = waypointsWithInfo?.[waypointsWithInfo.length - 1]?.name || "Khách Hàng";
                    new mapboxgl.Marker({ color: '#EF4444' })
                        .setLngLat(endCoord)
                        .setPopup(new mapboxgl.Popup({ offset: 30, closeButton: false }).setHTML(
                             `<strong style="color: #EF4444;">🚩 ${destName}</strong>`
                        ))
                        .addTo(map.current);

                    // Intermediate Markers
                    if (waypointsWithInfo && waypointsWithInfo.length > 2) {
                        console.log(`Adding ${waypointsWithInfo.length - 2} intermediate markers.`);
                        waypointsWithInfo.slice(1, -1).forEach((wpInfo, index) => {
                            if (wpInfo?.coordinate?.longitude != null && wpInfo?.coordinate?.latitude != null) {
                                const markerColor = '#2563eb';
                                const hubName = wpInfo.name || `Điểm dừng ${index + 1}`;
                                const el = document.createElement('div');
                                el.className = 'waypoint-marker';
                                el.style.cssText = `background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px rgba(0,0,0,0.2); cursor: pointer;`;

                                new mapboxgl.Marker(el)
                                    .setLngLat([wpInfo.coordinate.longitude, wpInfo.coordinate.latitude])
                                    .setPopup(new mapboxgl.Popup({ offset: 15, closeButton: false }).setHTML(
                                        `<strong style="color: ${markerColor};">${hubName}</strong>`
                                    ))
                                    .addTo(map.current);
                            } else {
                                console.warn("Invalid intermediate waypoint data:", wpInfo);
                            }
                        });
                    }
                    // === End Marker Addition ===

                    // Fit bounds
                    try {
                        const bounds = combinedCoords.reduce((b, coord) => b.extend(coord), new mapboxgl.LngLatBounds(startCoord, startCoord));
                        // Check if bounds are valid before fitting
                         if (bounds.getWest() !== bounds.getEast() || bounds.getSouth() !== bounds.getNorth()) {
                            map.current.fitBounds(bounds, { padding: 80, maxZoom: 15 });
                         } else {
                              // If bounds are essentially a single point, just center and zoom
                              map.current.easeTo({ center: startCoord, zoom: 14 });
                         }
                    } catch (boundsError) {
                        console.error("Error fitting bounds:", boundsError);
                        map.current.easeTo({ center: startCoord, zoom: 11 }); // Fallback zoom
                    }
                } catch (loadError) {
                     console.error("Error during map load event:", loadError);
                     setMapError('Lỗi khi vẽ dữ liệu lên bản đồ.');
                }
            }); // end map.on('load')

            map.current.on('error', (e) => {
                console.error('Mapbox GL Error:', e?.error);
                setMapError('Lỗi tải bản đồ.');
                cleanupMap();
            });

        } catch (initError) {
            console.error("Failed to initialize Mapbox:", initError);
            setMapError("Không thể khởi tạo bản đồ.");
            cleanupMap();
        }

        return cleanupMap; // Cleanup on effect change or unmount

    }, [isMapOpen, isRouteLoading, routeToDraw]); // Dependencies

    // --- FUNCTION TO CLOSE MAP DIALOG ---
    const handleMapClose = () => {
        setIsMapOpen(false);
        setRouteInfo(null);
        setMapError(null);
        if (onCloseMap) {
            onCloseMap();
        }
    };

    // --- RENDER ---
    return (
        <>
            {/* Header Section */}
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <IconMapPin className="text-3xl text-indigo-600 h-8 w-8" />
                        <Typography variant="h6" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            Quản Lý Vận Chuyển
                        </Typography>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'inline' }, color: 'text.secondary' }}>
                            Mã Đơn Vị: <Box component="span" sx={{ fontFamily: 'monospace', fontSize: 'caption.fontSize', bgcolor: 'grey.200', p: 0.5, borderRadius: 1 }}>{userId}</Box>
                        </Typography>
                        <Button
                            variant="contained" color="primary" onClick={handleMenuOpen}
                            sx={{ textTransform: 'none', backgroundColor: '#4f46e5', '&:hover': { backgroundColor: '#4338ca' } }}
                        >
                            Menu
                        </Button>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} keepMounted>
                            <MenuItem onClick={handleGoToInfo}>Quản lý thông tin</MenuItem>
                            <MenuItem onClick={handleGoToChatPage}>Message</MenuItem>
                            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                        </Menu>
                    </div>
                </div>
            </header>

            {/* Map Dialog */}
            <Dialog
                open={isMapOpen}
                onClose={handleMapClose}
                fullWidth
                maxWidth="lg"
                PaperProps={{ sx: { height: { xs: '95vh', sm: '90vh' }, maxHeight: '900px' } }}
            >
                <DialogTitle sx={{ m: 0, px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Tuyến đường Giao Hàng</Typography>
                    {routeInfo && (
                        <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                            (Khoảng {routeInfo.distance} km - {routeInfo.duration} phút)
                        </Typography>
                    )}
                    <IconButton aria-label="close" onClick={handleMapClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ padding: 0, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Conditional Rendering using explicit return */}
                    {(() => {
                        if (isRouteLoading) {
                            return (
                                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'primary.main' }}>
                                    <CircularProgress color="inherit" />
                                    <Typography sx={{ mt: 2 }}>Đang tải dữ liệu tuyến đường...</Typography>
                                </Box>
                            );
                        } else if (mapError) {
                            return (
                                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'error.main', p: 2, textAlign: 'center' }}>
                                    <Typography variant="h6" gutterBottom>Lỗi Hiển Thị Bản Đồ</Typography>
                                    <Typography>{mapError}</Typography>
                                </Box>
                            );
                        } else {
                            // Map container div
                            return (
                                <Box ref={mapContainer} sx={{ flexGrow: 1, width: '100%', minHeight: '300px' }} />
                            );
                        }
                    })()}
                </DialogContent>

                <DialogActions sx={{ px: 2, py: 1 }}>
                    <Button onClick={handleMapClose} color="primary" variant="contained">
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeliveryUnitHeader;