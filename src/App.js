import React, { useState, useEffect } from 'react';
import './App.css';
import './Components/navbar.css';
import './Table.css';
import './InfoBox.css';
import NavBar from './Components/NavBar';
import { MenuItem, FormControl, Select, CardContent, Card } from '@material-ui/core';
import InfoBox from './InfoBox';
import Map from './Map';
import CountryTable from './Table';
import { sortData, prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";


function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] =  useState([])
  const [casesType, setCasesType] = useState('cases')
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
          const countries = data.map((country) => (
            {
              name: country.country,
              value: country.countryInfo.iso2
            }
          ));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);

        });
    }
    getCountriesData();
  },
    []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    // setCountry(countryCode)

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/countries' :
    `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    
    await fetch(url)
    .then((response)=> response.json())
    .then(data => {

      setCountry(countryCode);
      setCountryInfo(data);

      setMapCenter([data.countryInfo.lat, data.countryInfo.long])
      setMapZoom(4);

    });

  };

  return (
    <div className="App">
      <div className="app_left">
      <div className="nav-conatainer">
          <NavBar />
          {/* <h1>Covid 19 tracker</h1> */}
        </div>
        <div className="drop-conatiner">
          <FormControl className="app-dropdown">
            <Select variant="outlined" onChange={onCountryChange} value={country}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map(country => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>
        {/* infobox */}
        <div className="app_stats">
          <InfoBox
          onClick={(e) => setCasesType('cases')}
           title='Coronavirus cases' 
           isRed
           active={casesType === "cases"}
          cases={prettyPrintStat(countryInfo.todayCases)} 
          total={prettyPrintStat(countryInfo.cases)}/>

          <InfoBox
           onClick={(e) => setCasesType('recovered')} 
          title='Recovered' 
          active={casesType === "recovered"}
          cases={prettyPrintStat(countryInfo.todayRecovered)} 
          total={prettyPrintStat(countryInfo.recovered)}/>


          <InfoBox
            onClick={(e) => setCasesType('deaths')}
            title='Deaths' 
            isRed
            active={casesType === "deaths"}
          cases={prettyPrintStat(countryInfo.todayDeaths)} 
          total={prettyPrintStat(countryInfo.deaths)} />
        </div>

        {/* map */}
        <div>
          <Map 
          casesType={casesType}
          countries={mapCountries} center={mapCenter} zoom={mapZoom}/>
        </div>
     </div>
     {/* end the left side */}
     <div className="app_right">
       {/* table */}
       
       <Card>
         <CardContent>
           <h3>Live cases of country</h3>
           <CountryTable countries={tableData}/>
           <h3>Worldwide new {casesType}</h3>
           <LineGraph casesType={casesType} />
         </CardContent>
       </Card>
     </div>
     {/* graph */}

    </div>
   
  );
}

export default App;
