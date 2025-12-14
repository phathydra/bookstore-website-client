import React, { useState, useEffect, useMemo } from 'react';

const CountdownTimer = ({ targetDate }) => {
    // Tính toán thời gian còn lại
    const calculateTimeLeft = () => {
        const difference = new Date(targetDate) - new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                h: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
                m: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
                s: Math.floor((difference / 1000) % 60).toString().padStart(2, '0')
            };
        } else {
            timeLeft = { h: '00', m: '00', s: '00' };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Clear interval khi component unmount
        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <div className="flex items-center gap-1 font-bold text-white">
            <span className="bg-black px-2 py-1 rounded text-lg min-w-[36px] text-center">{timeLeft.h}</span>
            <span className="text-black text-xl">:</span>
            <span className="bg-black px-2 py-1 rounded text-lg min-w-[36px] text-center">{timeLeft.m}</span>
            <span className="text-black text-xl">:</span>
            <span className="bg-black px-2 py-1 rounded text-lg min-w-[36px] text-center">{timeLeft.s}</span>
        </div>
    );
};

export default React.memo(CountdownTimer);