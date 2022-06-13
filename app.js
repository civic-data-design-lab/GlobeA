import React  from 'react';
import {useState, useMemo, useCallback, Component, StaticMap} from 'react';
import {TileLayer} from '@deck.gl/geo-layers';

import {render} from 'react-dom';
import {styled, withStyles} from '@material-ui/core/styles';



import DeckGL from '@deck.gl/react';
import { Deck,
  COORDINATE_SYSTEM,
  
  LightingEffect,
  AmbientLight, 
  _SunLight as SunLight
} from '@deck.gl/core';
import {GeoJsonLayer, TextLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {BitmapLayer} from '@deck.gl/layers';
import {MapController, Controller, FlyToInterpolator, TRANSITION_EVENTS} from 'deck.gl';
import {_GlobeView as GlobeView, _GlobeController as GlobeController} from '@deck.gl/core';
import {SphereGeometry} from '@luma.gl/core';
import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';

import AnimatedArcLayer from './animated-arc-layer';
import {sliceData, getDate} from './slice-data';
import RangeInput from './range-input';
import {isPlaying, setIsPlaying} from './range-input';

// import {MapboxLayer} from '@deck.gl/mapbox';


// Data source
const DATA_URL = './data';

const INITIAL_VIEW_STATE = {
  longitude: 110,
  latitude: .5,
  zoom: 1
};

const SECOND_VIEW_STATE = {
  longitude: 100,
  latitude: 20,
  zoom: 1.4
};


const Container = styled('div')({
  position: 'absolute',
  zIndex: 2,
  bottom: '40px',
  width: '100%',
  display: 'flex',
  opacity: 0,
  justifyContent: 'center',
//   pointer-events:'none',
  alignItems: 'center'
});


const TIME_WINDOW = 50; // 15 minutes
const EARTH_RADIUS_METERS = 6.3e6;

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 0.1
});
const sunLight = new SunLight({
  color: [255, 255, 255],
  intensity: .3,
  timestamp: 10
});
// create lighting effect with light sources
const lightingEffect = new LightingEffect({ambientLight, sunLight});




/* eslint-disable react/no-deprecated */

export default function App({data}) {
  const [currentTime, setCurrentTime] = useState(0);

  const groups = useMemo(() => sliceData(data), [data]);

  const endTime = useMemo(() => {
    return groups.reduce((max, group) => Math.max(max, group.endTime), 0);
  }, [groups]);

  const timeRange = [currentTime, currentTime + TIME_WINDOW];
const [glContext, setGLContext] = useState();
  const formatLabel = useCallback(t => getDate(data, t).toUTCString(), [data]);
  


  if (data) {
    sunLight.timestamp = getDate(data, currentTime).getTime();
  }
  

  

const [initialViewState, setInitialViewState] = useState({
  longitude: 112,
  latitude: .5,
  zoom: 1

  });

const goToAmericas = useCallback(() => {
    setInitialViewState({
      longitude: -67.77,
      latitude: .9,
      zoom: 1.6,
      transitionDuration: 35000,
      transitionInterpolator: new FlyToInterpolator()
    })
  }, []);




  const backgroundLayers = useMemo(
    () => [
      new SimpleMeshLayer({
        id: 'earth-sphere',
        data: [0],
        mesh: new SphereGeometry({radius: EARTH_RADIUS_METERS, nlat: 18, nlong: 36}),
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPosition: [0, 0, 0],
        getColor: [255, 255, 255]
      }),
// new GeoJsonLayer({
//       id: 'cities',
//       data: 'urbareas.geojson',
//       // Styles
//       stroked: false,
//       filled: true,
// //       lineWidthMinPixels: .4,
// //       getLineColor: [255, 255, 255],
//       getFillColor: [255, 255, 255]
//     }),
    
// new GeoJsonLayer({
//       id: 'countries',
//       data: 'countries.geojson',
//       stroked: true,
//         filled: false,
//         opacity: 1,
//        getLineColor: [255, 255, 255],
//  	 	lineWidthMinPixels: .3,
//      
//     }),
    
        
new GeoJsonLayer({
      id: 'graticules',
      data: 'graticules.geojson',
      stroked: true,
        filled: false,
        opacity: 1,
       getLineColor: [255, 255, 255],
 	 	lineWidthMinPixels: .25,
     
    }),

   new GeoJsonLayer({
      id: 'land',
      data: 'dt2.geojson',
      // Styles
      filled: true,
      pointRadiusMinPixels: 3,
      pointRadiusScale: .1,
     //  getPointRadius: d => 11 - d.properties._duration,
      getFillColor: [255, 255, 255 ],
      // Interactive props
      pickable: false,
      autoHighlight: true,
//       onClick: info =>
//         eslint-disable-next-line
//         info.object && alert(`${info.object.properties.nationality} (${info.object.properties.nationality})`)
    }),
    
new TextLayer({
    id: 'text-layer',
    data: 'nat.json',
    fontFamily: 'Arial',
    pickable: false,
    getPosition: d => [d.lon1, d.lat1],
    getText: d => d.Nationality,
    getSize: 12,
    getColor: [255, 255, 255],
    getAngle: 0, 
    getPixelOffset: [-5,-1],
    fontWeight: 'normal',
    getTextAnchor: 'end',
    getAlignmentBaseline: 'bottom'
  }),
    
       new GeoJsonLayer({
      id: 'intersections',
      data: 'intersections.geojson',
      // Styles
      filled: true,
      pointRadiusMinPixels: 1,
      pointRadiusScale: .05,
     //  getPointRadius: d => 11 - d.properties._duration,
      getFillColor: [255, 255, 255],
    }),
    
       new BitmapLayer({
      id: 'BitmapLayer',
      image: 'World Tileset Flattened.jpg',
      // Styles
      bounds: [[-180, -90], [-180, 90], [180, 90], [180, -90]],
    }),
    
    

    
//       new GeoJsonLayer({
//       id: 'roads',
//       data: 'roads.geojson',
//       // Styles
//       stroked: true,
//       filled: false,
//       lineWidthMinPixels: .05,
//       getLineColor: [255, 255, 255]
//  //      getFillColor: [255, 255, 255]
//     }),
      
      new GeoJsonLayer({
        id: 'earth-land',
        data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson',
        // Styles
        stroked: true,
        filled: false,
        opacity: 1,
       getLineColor: [255, 255, 255],
 	 	lineWidthMinPixels: .6,
       
      })
    ],
    []

    
  );



  const dataLayers = groups.map(
    (group, index) =>
    
      new AnimatedArcLayer({
      
        id: `flights-${index}`,
        data: group.flights,
//         visible: group.startTime < timeRange[1] && group.endTime > timeRange[1],
        getSourcePosition: d => [d.lon2, d.lat2, d.alt1],
        getTargetPosition: d => [d.lon1, d.lat1, d.alt2],
        getSourceTimestamp: d => d.time1,
        getTargetTimestamp: d => d.time2,
        getTilt: d => d.tilt,
        getHeight: .1,
        getWidth: .95,   
        timeRange,
        getSourceColor: [255, 255, 0],
        getTargetColor: [255, 255, 255]
      })
  );

  return (
    <>
      <DeckGL
        views={new GlobeView({
    controller: {keyboard: true, moveSpeed:100, dragPan:true}
  })}
        initialViewState={initialViewState}
      //   controller={false}
        effects={[lightingEffect]}
        layers={[backgroundLayers, dataLayers]}
        onLoad={goToAmericas}
        
        getTooltip={({object}) => object && `${object.Nationality}`} />;
      />
   
      {endTime && (
        <RangeInput
          min={500}
          max={endTime}
          value={currentTime}
          animationSpeed={TIME_WINDOW * 0.1}
          formatLabel={formatLabel}
          onChange={setCurrentTime}
          
        />
        
      )}
//      <Container> <button onClick={goToAmericas}>Americas </button></Container>
   
  //   {glContext && (
        /* This is important: Mapbox must be instantiated after the WebGLContext is available */
     <StaticMap
          ref={mapRef}
          gl={glContext}
          mapStyle='mapbox://styles/mitcivicdata/cl3z0yi5p000h14tb9ya73tok'
          mapboxApiAccessToken='pk.eyJ1IjoiYnBlbGhvcyIsImEiOiJjazZjNHZucW8weGpnM2ttZ2w3dXozYnVpIn0.6ctYlIS2y1chIG1guYgUXQ'
          onLoad={onMapLoad}
        />
        )}
        
    </>
  );
}

export function renderToDOM(container) {
  render(<App />, container);

  async function loadData(dates) {
    const data = [];
    for (const date of dates) {
      const url = `${DATA_URL}/${date}.csv`;
      const flights = await load(url, CSVLoader, {csv: {skipEmptyLines: true}});
      data.push({flights, date});
      render(<App data={data} />, container);
    }
  }
  

  loadData([
    '2020-01-14'
  ]);}
  
