'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ClockTimePickerProps {
    value?: string;
    onChange: (time: string) => void;
    disabled?: boolean;
}

const ClockTimePicker: React.FC<ClockTimePickerProps> = ({ value, onChange, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState(12);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [mode, setMode] = useState<'hour' | 'minute'>('hour');
    const [isAM, setIsAM] = useState(true);
    const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
    const clockRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            const [hours, minutes] = value.split(':').map(Number);
            if (hours === 0) {
                setSelectedHour(12);
                setIsAM(true);
            } else if (hours <= 12) {
                setSelectedHour(hours);
                setIsAM(true);
            } else {
                setSelectedHour(hours - 12);
                setIsAM(false);
            }
            setSelectedMinute(minutes);
        }
    }, [value]);

    const formatTime = (hour: number, minute: number, am: boolean): string => {
        let hour24 = hour;
        if (am && hour === 12) hour24 = 0;
        else if (!am && hour !== 12) hour24 = hour + 12;
        
        return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    const handleTimeChange = () => {
        const timeString = formatTime(selectedHour, selectedMinute, isAM);
        onChange(timeString);
        setIsOpen(false);
    };

    const getClockPosition = (value: number, max: number, isHour: boolean = false) => {
        const angle = (value * 360) / max - 90;
        const radius = isHour ? 48 : 60;
        const centerX = 70;
        const centerY = 70;
        const x = Math.cos((angle * Math.PI) / 180) * radius + centerX;
        const y = Math.sin((angle * Math.PI) / 180) * radius + centerY;
        return { x, y, angle };
    };

    const handleClockClick = (event: React.MouseEvent) => {
        if (!clockRef.current) return;
        
        const rect = clockRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const x = event.clientX - rect.left - centerX;
        const y = event.clientY - rect.top - centerY;
        
        const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        const normalizedAngle = angle < 0 ? angle + 360 : angle;
        
        if (mode === 'hour') {
            const hour = Math.round(normalizedAngle / 30) || 12;
            setSelectedHour(hour);
        } else {
            const minute = Math.round(normalizedAngle / 6) % 60;
            setSelectedMinute(minute);
        }
    };

    const displayTime = value ? value : '00:00';
    const [displayHour, displayMinute] = displayTime.split(':');
    const display12Hour = (() => {
        const hour = parseInt(displayHour);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${hour12.toString().padStart(2, '0')}:${displayMinute} ${period}`;
    })();

    const getHandAngle = () => {
        if (mode === 'hour') {
            return (selectedHour % 12) * 30;
        } else {
            return selectedMinute * 6;
        }
    };

    const getHandLength = () => {
        return mode === 'hour' ? 40 : 52;
    };

    const calculateDropdownPosition = () => {
        if (!triggerRef.current) return;
        
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownHeight = 380; // Approximate height of dropdown
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            setDropdownPosition('top');
        } else {
            setDropdownPosition('bottom');
        }
    };

    const handleToggleOpen = () => {
        if (!disabled) {
            if (!isOpen) {
                calculateDropdownPosition();
            }
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className="relative">
            <div
                ref={triggerRef}
                className="flex items-center justify-between p-2 border border-gray-300 rounded-md cursor-pointer bg-white dark:bg-gray-800 dark:border-gray-600 text-sm"
                onClick={handleToggleOpen}
            >
                <span className="text-gray-700 dark:text-gray-200">
                    {display12Hour}
                </span>
                <svg 
                    className="w-4 h-4 text-gray-500 dark:text-gray-400" 
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                >
                    <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" 
                        clipRule="evenodd"
                    />
                </svg>
            </div>

            {isOpen && (
                <div 
                    className={`absolute left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 z-50 min-w-[240px] ${
                        dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full'
                    }`}
                >
                    {/* Digital time display */}
                    <div className="text-center mb-3">
                        <div className="text-xl font-mono bg-gray-100 dark:bg-gray-700 rounded p-1.5">
                            {selectedHour.toString().padStart(2, '0')}:
                            {selectedMinute.toString().padStart(2, '0')} 
                            <span className="text-xs ml-1.5">
                                {isAM ? 'AM' : 'PM'}
                            </span>
                        </div>
                    </div>

                    {/* Mode switcher */}
                    <div className="flex justify-center mb-3">
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded p-0.5">
                            <button
                                type="button"
                                className={`px-3 py-1 rounded text-xs font-medium ${
                                    mode === 'hour' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'text-gray-600 dark:text-gray-300'
                                }`}
                                onClick={() => setMode('hour')}
                            >
                                Hour
                            </button>
                            <button
                                type="button"
                                className={`px-3 py-1 rounded text-xs font-medium ${
                                    mode === 'minute' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'text-gray-600 dark:text-gray-300'
                                }`}
                                onClick={() => setMode('minute')}
                            >
                                Minute
                            </button>
                        </div>
                    </div>

                    {/* Clock face */}
                    <div className="flex justify-center mb-3">
                        <div 
                            ref={clockRef}
                            className="relative w-36 h-36 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 cursor-pointer"
                            onClick={handleClockClick}
                        >
                            {mode === 'hour' ? (
                                Array.from({ length: 12 }, (_, i) => {
                                    const hour = i + 1;
                                    const pos = getClockPosition(hour, 12, true);
                                    return (
                                        <div
                                            key={hour}
                                            className={`absolute w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium ${
                                                selectedHour === hour 
                                                    ? 'bg-blue-500 text-white' 
                                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                            style={{ 
                                                left: `${pos.x}px`, 
                                                top: `${pos.y}px`,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedHour(hour);
                                            }}
                                        >
                                            {hour}
                                        </div>
                                    );
                                })
                            ) : (
                                Array.from({ length: 12 }, (_, i) => {
                                    const minute = i * 5;
                                    const pos = getClockPosition(minute, 60);
                                    return (
                                        <div
                                            key={minute}
                                            className={`absolute w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium ${
                                                selectedMinute === minute 
                                                    ? 'bg-blue-500 text-white' 
                                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                            style={{ 
                                                left: `${pos.x}px`, 
                                                top: `${pos.y}px`,
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMinute(minute);
                                            }}
                                        >
                                            {minute.toString().padStart(2, '0')}
                                        </div>
                                    );
                                })
                            )}

                            {/* Center dot */}
                            <div 
                                className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full z-10"
                                style={{ 
                                    left: '50%', 
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />

                            {/* Clock hand */}
                            <div 
                                className="absolute bg-blue-500 origin-bottom"
                                style={{
                                    width: '2px',
                                    height: `${getHandLength()}px`,
                                    left: '50%',
                                    top: '50%',
                                    transform: `translate(-50%, -100%) rotate(${getHandAngle()}deg)`,
                                    transformOrigin: 'bottom center'
                                }}
                            />
                        </div>
                    </div>

                    {/* AM/PM toggle */}
                    <div className="flex justify-center mb-3">
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded p-0.5">
                            <button
                                type="button"
                                className={`px-4 py-1 rounded text-xs font-medium ${
                                    isAM 
                                        ? 'bg-blue-500 text-white' 
                                        : 'text-gray-600 dark:text-gray-300'
                                }`}
                                onClick={() => setIsAM(true)}
                            >
                                AM
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-1 rounded text-xs font-medium ${
                                    !isAM 
                                        ? 'bg-blue-500 text-white' 
                                        : 'text-gray-600 dark:text-gray-300'
                                }`}
                                onClick={() => setIsAM(false)}
                            >
                                PM
                            </button>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
                            onClick={handleTimeChange}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClockTimePicker;