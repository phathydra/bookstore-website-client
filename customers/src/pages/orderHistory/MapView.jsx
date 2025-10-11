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
    // useEffect 1: Xử lý dữ liệu tuyến đường (ROUTE DATA) - KHÔNG ĐỔI
    // ====================================================================
    useEffect(() => {
        if (location.state && location.state.routeData && location.state.origin) {
            const fetchedRoute = location.state.routeData.routes[0];
            const origin = location.state.origin; // { lon, lat }
            
            const destAddr = location.state.destinationAddress || "Điểm đến (Đơn vị Vận chuyển)";
            const originAddr = location.state.originAddress || "Vị trí hiện tại của Shipper";

            setRoute(fetchedRoute);
            setInitialCenter([origin.lon, origin.lat]);
            setOriginAddress(originAddr);
            setDestinationAddress(destAddr);
            setIsDataReady(true);
            
        } else {
             console.error("❌ Lỗi: Không tìm thấy dữ liệu đường đi.");
             alert("Không tìm thấy dữ liệu tuyến đường hợp lệ. Đang quay lại.");
             navigate(-1); 
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, navigate]); 

    // ====================================================================
    // useEffect 2: Khởi tạo Mapbox và Vẽ tuyến đường - KHÔNG ĐỔI
    // ====================================================================
    useEffect(() => {
        if (map.current || !mapContainer.current || !isDataReady) return;

        // --- KHỞI TẠO MAP ---
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/navigation-day-v1', 
            center: initialCenter, 
            zoom: initialZoom
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        map.current.on('load', () => {
            if (!route || !route.geometry || !route.geometry.coordinates) return;

            const coordinates = route.geometry.coordinates;
            const startCoord = coordinates[0];
            const endCoord = coordinates[coordinates.length - 1];
            
            // 1. VẼ TUYẾN ĐƯỜNG
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
                    'line-color': '#4F46E5', 
                    'line-width': 7, 
                    'line-opacity': 0.9
                }
            });

            // 2. THÊM MARKER ĐIỂM BẮT ĐẦU (SHIPPER)
            new mapboxgl.Marker({ color: '#10B981' }) 
                .setLngLat(startCoord)
                .setPopup(new mapboxgl.Popup({ offset: 30 }).setHTML(`
                    <div style="font-family: sans-serif; max-width: 250px;">
                        <h5 style="color: #10B981; margin: 0 0 5px 0; font-weight: 600;">🟢 VỊ TRÍ SHIPPER</h5>
                        <p style="margin: 0; font-size: 14px; word-wrap: break-word;">${originAddress}</p>
                    </div>
                `))
                .addTo(map.current);
            
            // 3. THÊM MARKER ĐIỂM ĐÍCH (KHÁCH HÀNG)
            new mapboxgl.Marker({ color: '#EF4444' }) 
                .setLngLat(endCoord)
                .setPopup(new mapboxgl.Popup({ offset: 30 }).setHTML(`
                    <div style="font-family: sans-serif; max-width: 250px;">
                        <h5 style="color: #EF4444; margin: 0 0 5px 0; font-weight: 600;">🚩 ĐIỂM NHẬN HÀNG</h5>
                        <p style="margin: 0; font-size: 14px; word-wrap: break-word;">${destinationAddress}</p>
                    </div>
                `))
                .addTo(map.current);
            
            // 4. CĂN BẢN ĐỒ
            const bounds = coordinates.reduce((bounds, coord) => {
                return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(startCoord, startCoord));

            map.current.fitBounds(bounds, {
                padding: 
                {top: 150, bottom: 50, left: 50, right: 50}, 
                duration: 1500 
            });
        });

        // --- HÀM CLEANUP ---
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route, initialCenter, isDataReady, originAddress, destinationAddress]); 

    // ====================================================================
    // RENDER ĐÃ TỐI ƯU
    // ====================================================================

    if (!isDataReady || !route) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <p className="text-lg text-indigo-600">Đang xử lý và tải dữ liệu tuyến đường...</p>
            </div>
        );
    }
    
    // Tính toán thông tin hiển thị
    const distanceKm = (route.distance / 1000).toFixed(1);
    const durationMinutes = Math.round(route.duration / 60);

    return (
        <div className="flex flex-col h-screen font-sans">
            
            {/* Header / Thanh thông tin cố định - THU GỌN HƠN */}
            <header className="bg-white shadow-lg p-3 sticky top-0 z-20 border-b-4 border-indigo-600">
                
                {/* Dòng 1: Tiêu đề và nút quay lại */}
                <div className="flex justify-between items-center mb-2">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="text-gray-500 hover:text-indigo-600 font-semibold flex items-center space-x-1 transition duration-150 ease-in-out text-sm p-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        <span>Quay lại</span>
                    </button>
                    <h1 className="text-lg font-extrabold text-indigo-600 uppercase tracking-wider">📍 THEO DÕI ĐƠN HÀNG</h1>
                    <div className="w-16"></div> 
                </div>

                {/* Dòng 2: Tóm tắt tuyến đường (Thời gian & Khoảng cách) - ĐẶT CẠNH NHAU */}
                <div className="flex justify-between items-center space-x-4 bg-indigo-50 border border-indigo-200 p-2 rounded-lg">
                    
                    {/* Thời gian */}
                    <div className="flex items-center space-x-2 text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-base font-extrabold text-gray-800">{durationMinutes}</span>
                        <span className="text-sm">phút còn lại</span>
                    </div>

                    {/* Khoảng cách */}
                    <div className="flex items-center space-x-2 text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="text-base font-extrabold text-gray-800">{distanceKm}</span>
                        <span className="text-sm">km đến đích</span>
                    </div>
                </div>

                {/* Dòng 3: Thanh địa chỉ chi tiết - SỬ DỤNG MỘT DÒNG NGANG/SCROLL NGANG */}
                <div className="mt-3 overflow-x-auto whitespace-nowrap pb-1">
                    <div className="inline-flex space-x-3 text-xs">
                        {/* Địa chỉ Shipper (Origin) */}
                        <div className="flex items-center space-x-2 p-1 border rounded-lg bg-gray-50">
                            <span className="text-green-600 font-extrabold shrink-0">●</span>
                            <span className="font-medium text-gray-900 truncate max-w-xs" title={originAddress}>Shipper: {originAddress}</span>
                        </div>
                        {/* Mũi tên */}
                        <div className="flex items-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                        {/* Địa chỉ Khách hàng (Destination) */}
                        <div className="flex items-center space-x-2 p-1 border rounded-lg bg-gray-50">
                            <span className="text-red-600 font-extrabold shrink-0">■</span>
                            <span className="font-medium text-gray-900 truncate max-w-xs" title={destinationAddress}>Đích: {destinationAddress}</span>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Vùng Mapbox chiếm phần còn lại lớn hơn của màn hình (flex-1) */}
            <div ref={mapContainer} className="flex-1 w-full relative z-10" />
        </div>
    );
};

export default MapView;