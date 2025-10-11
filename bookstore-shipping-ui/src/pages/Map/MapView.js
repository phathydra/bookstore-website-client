import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useLocation, useNavigate } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css'; // Quan trọng: Đảm bảo Mapbox CSS được import

// Thay thế bằng Mapbox Access Token của bạn
mapboxgl.accessToken = 'pk.eyJ1IjoibGV0aGFuaGh1bmcxMSIsImEiOiJjbWc1Mjc3N3kwMDVvMmpzYXFjb20zaXB1In0.459YBDaJc6CAlJ1zIqugDw'; 

const MapView = () => {
    const mapContainer = useRef(null);
    const map = useRef(null); 
    
    const location = useLocation();
    const navigate = useNavigate();
    
    const [route, setRoute] = useState(null); 
    const [initialCenter, setInitialCenter] = useState([106.66, 10.77]); 
    const initialZoom = 12;

    const [originAddress, setOriginAddress] = useState("Vị trí hiện tại");
    const [destinationAddress, setDestinationAddress] = useState("Điểm đến");
    const [isDataReady, setIsDataReady] = useState(false);

    // ====================================================================
    // useEffect 1: Xử lý dữ liệu tuyến đường
    // ====================================================================
    useEffect(() => {
        if (location.state && location.state.routeData) {
            const fetchedRoute = location.state.routeData.routes[0];
            const origin = location.state.origin; // { lon, lat }
            
            // Giả định địa chỉ được truyền vào đã là chuỗi đẹp để hiển thị
            const destAddr = location.state.destinationAddress || "Điểm đến (Đơn vị Vận chuyển)";
            const originAddr = location.state.originAddress || "Vị trí hiện tại của Shipper";

            setRoute(fetchedRoute);
            setInitialCenter([origin.lon, origin.lat]);
            setOriginAddress(originAddr);
            setDestinationAddress(destAddr);
            setIsDataReady(true);
            
        } else {
             console.error("Không tìm thấy dữ liệu đường đi.");
             // Không navigate ngay để dễ debug, nhưng trong môi trường production nên navigate
        }
    }, [location.state]);

    // ====================================================================
    // useEffect 2: Khởi tạo Mapbox và Vẽ tuyến đường
    // ====================================================================
    useEffect(() => {
        if (map.current || !mapContainer.current || !isDataReady) return;

        // --- KHỞI TẠO MAP ---
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            // SỬ DỤNG STYLE NAVIGATION-DAY CHO GIAO DIỆN CHUYÊN NGHIỆP
            style: 'mapbox://styles/mapbox/navigation-day-v1', 
            center: initialCenter, 
            zoom: initialZoom
        });

        // Thêm các control cơ bản
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        map.current.on('load', () => {
            if (!route || !route.geometry || !route.geometry.coordinates) return;

            const coordinates = route.geometry.coordinates;
            const startCoord = coordinates[0];
            const endCoord = coordinates[coordinates.length - 1];

            // 1. Thêm Source và Layer cho đường đi
            map.current.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': coordinates
                    }
                }
            });

            map.current.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    // Màu xanh đậm/cam nổi bật hơn cho tuyến đường
                    'line-color': '#00AEEF', 
                    'line-width': 7, 
                    'line-opacity': 0.9
                }
            });

            // 2. Thêm Marker cho điểm xuất phát (Shipper) - Màu Xanh Lá
            new mapboxgl.Marker({ color: '#10B981' }) 
                .setLngLat(startCoord)
                .setPopup(new mapboxgl.Popup({ offset: 30 }).setHTML(`
                    <div style="font-family: sans-serif; max-width: 250px;">
                        <h5 style="color: #10B981; margin: 0 0 5px 0; font-weight: 600;">🟢 VỊ TRÍ BẮT ĐẦU</h5>
                        <p style="margin: 0; font-size: 14px;">${originAddress}</p>
                    </div>
                `))
                .addTo(map.current);
            
            // 3. Thêm Marker cho điểm đích (Delivery Unit) - Màu Đỏ
            new mapboxgl.Marker({ color: '#EF4444' }) 
                .setLngLat(endCoord)
                .setPopup(new mapboxgl.Popup({ offset: 30 }).setHTML(`
                    <div style="font-family: sans-serif; max-width: 250px;">
                        <h5 style="color: #EF4444; margin: 0 0 5px 0; font-weight: 600;">🚩 ĐIỂM CẦN ĐẾN</h5>
                        <p style="margin: 0; font-size: 14px;">${destinationAddress}</p>
                    </div>
                `))
                .addTo(map.current);
            
            // 4. Căn bản đồ để hiển thị toàn bộ tuyến đường
            const bounds = coordinates.reduce((bounds, coord) => {
                return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(startCoord, startCoord));

            map.current.fitBounds(bounds, {
                padding: 100 
            });
        });

        // --- HÀM CLEANUP ---
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };

    }, [route, initialCenter, isDataReady, originAddress, destinationAddress]); 

    // ====================================================================
    // RENDER 
    // ====================================================================

    if (!isDataReady) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <p className="text-lg text-indigo-600">Đang xử lý và tải dữ liệu tuyến đường...</p>
            </div>
        );
    }
    
    // Tính toán lại thông tin
    const distanceKm = (route.distance / 1000).toFixed(1);
    const durationMinutes = Math.round(route.duration / 60);

    return (
        <div className="flex flex-col h-screen font-sans">
            {/* Header / Thanh thông tin cố định */}
            <header className="bg-white shadow-xl p-4 sticky top-0 z-20 border-b border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    {/* Nút Quay lại */}
                    <button 
                        onClick={() => navigate('/shipper-dashboard')}
                        className="text-gray-500 hover:text-indigo-600 font-semibold flex items-center space-x-1 transition duration-150 ease-in-out text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        <span>Quay lại</span>
                    </button>
                    {/* Tiêu đề chính */}
                    <h1 className="text-xl font-extrabold text-indigo-600 uppercase tracking-wider">ĐIỀU HƯỚNG GIAO HÀNG</h1>
                    <div className="w-24"></div> 
                </div>

                {/* Thanh thông tin tuyến đường (Distance/Duration) */}
                <div className="flex justify-center items-center space-x-8 bg-indigo-50 border-y border-indigo-200 py-3 rounded-lg">
                    
                    {/* Thời gian */}
                    <div className="flex items-center space-x-1 text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-lg font-bold text-gray-800">{durationMinutes}</span>
                        <span className="text-sm">phút</span>
                    </div>

                    {/* Khoảng cách */}
                    <div className="flex items-center space-x-1 text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="text-lg font-bold text-gray-800">{distanceKm}</span>
                        <span className="text-sm">km</span>
                    </div>
                </div>

                {/* Thanh địa chỉ */}
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                        <span className="text-green-500 font-bold">●</span>
                        <p className='truncate' title={originAddress}>**Bắt đầu:** {originAddress}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-red-500 font-bold">■</span>
                        <p className='truncate' title={destinationAddress}>**Đích:** {destinationAddress}</p>
                    </div>
                </div>
            </header>
            
            {/* Vùng Mapbox */}
            <div ref={mapContainer} className="flex-1 w-full h-full" />
        </div>
    );
};

export default MapView;