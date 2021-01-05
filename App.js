import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

import * as Location from 'expo-location';
import WeatherInfo from './components/WeatherInfo'
import UnitsPicker from './components/UnitsPicker'
import ReloadIcon from './components/ReloadIcon'
import WeatherDetails from './components/WeatherDetails'
import {colors} from './utils/index'
//import {Config} from 'react-native-config'
const WEATHER_API_KEY = '9ddc7df76a4694159f972e7505892cdb'
const BASE_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather?';
export default function App() {

  const [errorMessage, setErrorMessage] = useState(null)
  const [currentWeather, setCurrentWeather] = useState(null)
  const [unitsSystem, setUnitsSystem] = useState('imperial')



  useEffect(() => {
    load()
  }, [unitsSystem]) // everytime unitssystem changes load will be called which is cool and easy 

  async function load(){
    setCurrentWeather(null)
    setErrorMessage(null)
    try {
      
      let {status} = await Location.requestPermissionsAsync()

      if(status != 'granted'){
        setErrorMessage('Access to location is needed to run this app')
        return
      }

      const location = await Location.getCurrentPositionAsync()

      const {latitude, longitude} = location.coords

      // for the sake of example were grabbing the units via api request.
      // but what if a user wants to change units after we've already given them the weather? 
      // it doesn't seem like its worth another API request, so we should just do the calculation on our end. its such a simple calc
      // if we only accept kelvin units from api requests, we can convert it to  imperial or metric as we like
      // formula: F = 1.8(K - 273.15) + 32
      // formula: C = K - 273.15
      const weatherUrl = `${BASE_WEATHER_URL}lat=${latitude}&lon=${longitude}&units=${unitsSystem}&appid=${WEATHER_API_KEY}`

      const response = await fetch(weatherUrl)

      const result = await response.json() 

      if(response.ok) {
        setCurrentWeather(result)
      } else {
        setErrorMessage(result.message)
      }

      //alert(`Latitude : ${latitude}, Longitude: ${longitude}`)
    } catch (error) {
      setErrorMessage(error);
    }
  } // load() END



  if(currentWeather){  
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.main}>
          <UnitsPicker unitsSystem={unitsSystem} setUnitsSystem={setUnitsSystem} />
          <ReloadIcon load={load} />
          <WeatherInfo currentWeather={currentWeather}/>
          
        </View>
        <WeatherDetails currentWeather={currentWeather} unitsSystem={unitsSystem}/>
      </View>
    );
  } else if(errorMessage){
    return (
      <View style={styles.container}>
        <ReloadIcon load={load} />
        <Text style={{textAlign: 'center'}}>{errorMessage}</Text>
        <StatusBar style="auto" />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.PRIMARY_COLOR}/>
        <StatusBar style="auto" />
      </View>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
  }
});
