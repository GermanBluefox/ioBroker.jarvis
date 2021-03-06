import React, { useState, useEffect, useRef } from 'react'
import Connection from '../Connection'

import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { getSunrise, getSunset } from 'sunrise-sunset-js'

import i18n from '../i18n'
import CircularProgress from '@material-ui/core/CircularProgress'


export default function DateTime(props) {
	const { settings } = props;
	
	const refTimer = useRef();
	const [DateTime, setDateTime] = useState(format(new Date(), settings.format, { locale: de }));
	const [city, setCity] = useState('');
	const [sunrise, setSunrise] = useState('');
	const [sunset, setSunset] = useState('');
	
	// https://date-fns.org/v2.9.0/docs/format
	settings.style = { fontSize: '1.5rem', textAlign: 'center', ...settings.style };
	settings.format = settings.format || 'dd.MM.yyyy HH:mm:ss';
	settings.refresh = settings.format.indexOf('s') > -1 ? 1000 : (settings.format.indexOf('i') > -1 ? 60*1000 : 60*60*1000);
	
	useEffect(() => {
		clearTimeout(refTimer.current);
		refTimer.current = setTimeout(() => setDateTime(format(new Date(), settings.format, { locale: de })), settings.refresh);
		
		// get coordinates
		Connection.getConnection.getObject('system.config', (err, data) => {
			
			if (!city && data && data.common) {
				if (data.common.latitude && data.common.longitude) {
					setSunrise(getSunrise(data.common.latitude, data.common.longitude));
					setSunset(getSunset(data.common.latitude, data.common.longitude));
				}
				
				if (data.common.city) {
					setCity(data.common.city);
				}
			}
		});
		
	}, [city]);
	
	return (

<div style={settings.style}>
	{i18n.t('%DateTime').replace(/%DateTime/, DateTime)}
	
	{settings.sun !== false && <p style={{ margin: '5px 0', fontSize: '1.2rem' }}>
		<span className="mdi mdi-weather-sunset-up"></span> {sunrise ? format(sunrise, 'HH:mm') : <CircularProgress size="1.2rem" />}
		<span style={{ margin: '0 10px' }}></span>
		<span className="mdi mdi-weather-sunset-down"></span> {sunset ? format(sunset, 'HH:mm') : <CircularProgress size="1.2rem" />}
	</p>
	}
</div>

	);
}

export const Settings = {
	noDevicesAllowed: true,
	title: i18n.t('Time'),
	icon: 'clock-outline'
}
